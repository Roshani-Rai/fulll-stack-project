import { useState, useRef, useEffect } from "react";

const STORAGE_KEY = "mediassist_chat_history";

const statusStyle = {
  normal:   { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  icon: "✅" },
  abnormal: { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700",      icon: "❌" },
  suspected:{ bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800",icon: "⚠️" },
};

const urgencyConfig = {
  low:      { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  icon: "✅", label: "Low"      },
  moderate: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: "⚠️",  label: "Moderate" },
  high:     { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "⚡", label: "High"     },
  critical: { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    icon: "🚨", label: "Critical" },
};

export default function AIChatModal({ onClose }) {
  const [sessions, setSessions]           = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [uploadedFile, setUploadedFile]   = useState(null);
  const [error, setError]                 = useState("");
  const [showHistory, setShowHistory]     = useState(false);
  const [isListening, setIsListening]     = useState(false);
  const bottomRef      = useRef(null);
  const fileRef        = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = "hi-IN";
    r.onstart  = () => setIsListening(true);
    r.onend    = () => setIsListening(false);
    r.onerror  = () => setIsListening(false);
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${t}` : t);
    };
    recognitionRef.current = r;
  }, []);

  const startNewChat = () => {
    setActiveSession(null); setMessages([]); setInput("");
    setUploadedFile(null); setError(""); setShowHistory(false);
  };

  const openSession = (s) => { setActiveSession(s.id); setMessages(s.messages); setShowHistory(false); };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession === id) startNewChat();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG, WebP and PDF supported."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5MB."); return; }

    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 800;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = (height / width) * MAX; width = MAX; }
            else { width = (width / height) * MAX; height = MAX; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setUploadedFile({ name: file.name, base64: compressed.split(",")[1], type: "image/jpeg" });
          setError("");
        };
        img.src = reader.result;
      } else {
        setUploadedFile({ name: file.name, base64: reader.result.split(",")[1], type: file.type });
        setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) { setError("Speech recognition not supported."); return; }
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;
    setError("");

    const userMsg = { role: "user", text: text || "Please analyze this medical report.", fileName: uploadedFile?.name || null };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput(""); setUploadedFile(null); setLoading(true);

    try {
      const contentParts = [];
      if (uploadedFile) {
        if (uploadedFile.type === "application/pdf") {
          contentParts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: uploadedFile.base64 } });
        } else {
          contentParts.push({ type: "image", source: { type: "base64", media_type: uploadedFile.type, data: uploadedFile.base64 } });
        }
      }
      if (text) contentParts.push({ type: "text", text });

      const apiMessages = updatedMessages.map((m, i) => ({
        role: "user",
        content: i === updatedMessages.length - 1 ? contentParts : m.text,
      }));

      const response = await fetch("https://doctor-appointment-backened.onrender.com/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API error");

      const rawText = data.content.map(b => b.text || "").join("");
      let parsed;
      try {
        parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
      } catch {
        parsed = { reply: rawText, findings: [], possibleConditions: [], recommendations: [], urgencyLevel: "moderate", urgencyReason: "", disclaimer: true };
      }

      // ✅ Capture suggestedDoctors from API response
      const suggestedDoctors = data.suggestedDoctors || [];
      const finalMessages = [...updatedMessages, { role: "assistant", ...parsed, suggestedDoctors, rawJson: rawText }];
      setMessages(finalMessages);

      const sessionTitle = text ? text.slice(0, 40) + (text.length > 40 ? "..." : "") : "Report Analysis";
      const sessionId = activeSession || Date.now().toString();
      setActiveSession(sessionId);
      setSessions(prev => {
        const exists = prev.find(s => s.id === sessionId);
        if (exists) return prev.map(s => s.id === sessionId ? { ...s, messages: finalMessages, updatedAt: new Date().toLocaleString() } : s);
        return [{ id: sessionId, title: sessionTitle, messages: finalMessages, createdAt: new Date().toLocaleString(), updatedAt: new Date().toLocaleString() }, ...prev];
      });

    } catch (err) {
      setError("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Assistant message card ──────────────────────────────────────────────────
  const AssistantMessage = ({ msg }) => {
    const u = urgencyConfig[msg.urgencyLevel] || urgencyConfig.low;
    return (
      <div className="max-w-[88%] space-y-2">

        {/* Intro reply */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
          <p className="text-gray-800 text-sm leading-relaxed">{msg.reply}</p>
        </div>

        {/* Findings */}
        {msg.findings?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">🔍 Report Findings</p>
            </div>
            <div className="divide-y divide-gray-100">
              {msg.findings.map((f, i) => {
                const s = statusStyle[f.status] || statusStyle.normal;
                return (
                  <div key={i} className={`flex items-start gap-3 px-4 py-3 ${s.bg}`}>
                    <span className="text-base mt-0.5 flex-shrink-0">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-700">{f.label}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
                          {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                        </span>
                      </div>
                      <p className={`text-xs ${s.text}`}>{f.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Possible Conditions */}
        {msg.possibleConditions?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-2">🧠 Possible Conditions</p>
            <div className="flex flex-wrap gap-2">
              {msg.possibleConditions.map((c, i) => (
                <span key={i} className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {msg.recommendations?.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-green-700 mb-2">💡 What You Should Do</p>
            <ul className="space-y-1.5">
              {msg.recommendations.map((r, i) => (
                <li key={i} className="text-xs text-green-800 flex gap-2">
                  <span className="flex-shrink-0 font-bold">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Urgency */}
        {msg.urgencyLevel && (
          <div className={`rounded-xl px-4 py-3 border ${u.bg} ${u.border}`}>
            <p className={`text-xs font-semibold ${u.text} mb-1`}>{u.icon} Urgency: {u.label}</p>
            {msg.urgencyReason && <p className={`text-xs ${u.text} opacity-90`}>{msg.urgencyReason}</p>}
          </div>
        )}

        {/* ✅ Suggested Doctors */}
        {msg.suggestedDoctors?.length > 0 && (
          <div className="bg-white border border-purple-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-purple-50 border-b border-purple-100">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                🩺 Suggested {msg.suggestedSpecialty}s Near You
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {msg.suggestedDoctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => { window.location.href = `/appointment/${doc._id}`; }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                    {doc.image
                      ? <img src={doc.image} alt={doc.name} className="w-9 h-9 rounded-full object-cover" />
                      : doc.name?.charAt(0)
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.speciality} • {doc.experience}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={`text-xs ${star <= Math.round(doc.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{doc.rating?.toFixed(1)}</span>
                      {doc.fees && <span className="text-xs text-gray-400">• ₹{doc.fees}</span>}
                    </div>
                  </div>
                  <span className="text-purple-400 text-xs self-center flex-shrink-0">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {msg.disclaimer && (
          <p className="text-[11px] text-gray-400 px-1">
            ⓘ AI-generated information only — not a substitute for professional medical advice. Please consult a qualified doctor.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl flex overflow-hidden shadow-2xl border border-gray-100">

        {/* ── SIDEBAR ── */}
        <div className={`${showHistory ? 'flex' : 'hidden'} md:flex flex-col w-64 border-r border-gray-100 bg-gray-50 flex-shrink-0`}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <p className="text-sm font-semibold text-gray-700">Chat History</p>
            <button onClick={startNewChat} className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-colors">+ New</button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-xs text-gray-400">No chat history yet.</p>
                <p className="text-xs text-gray-400 mt-1">Start a conversation!</p>
              </div>
            ) : sessions.map(session => (
              <div key={session.id} onClick={() => openSession(session)}
                className={`mx-2 mb-1 px-3 py-2.5 rounded-xl cursor-pointer group flex items-start justify-between gap-2 transition-colors
                  ${activeSession === session.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-white border border-transparent hover:border-gray-200'}`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${activeSession === session.id ? 'text-blue-700' : 'text-gray-700'}`}>{session.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{session.updatedAt}</p>
                  <p className="text-xs text-gray-400">{session.messages.length} messages</p>
                </div>
                <button onClick={(e) => deleteSession(e, session.id)} className="text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5">🗑</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
            <button onClick={() => setShowHistory(h => !h)} className="md:hidden text-white/80 hover:text-white text-lg">☰</button>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-lg flex-shrink-0">🩺</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">MediAssist AI</p>
              <p className="text-blue-100 text-xs truncate">
                {activeSession ? sessions.find(s => s.id === activeSession)?.title || "Current chat" : "Describe symptoms or upload a report"}
              </p>
            </div>
            <button onClick={startNewChat} className="hidden md:block text-white/70 hover:text-white text-xs border border-white/30 px-2.5 py-1 rounded-lg transition-colors">+ New Chat</button>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl px-1 flex-shrink-0">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👋</div>
                <p className="text-gray-700 font-medium">Hello! I'm your AI health assistant.</p>
                <p className="text-gray-400 text-sm mt-1">Tell me your symptoms or upload a medical report.</p>
                <div className="flex flex-wrap gap-2 justify-center mt-5">
                  {["I have a headache and fever", "My report shows high blood pressure", "I have chest pain since morning", "I feel dizzy and nauseous"].map(s => (
                    <button key={s} onClick={() => setInput(s)}
                      className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 transition-colors">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[75%]">
                    {msg.fileName && (
                      <div className="mb-1 text-right">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">📎 {msg.fileName}</span>
                      </div>
                    )}
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed">{msg.text}</div>
                  </div>
                ) : (
                  <AssistantMessage msg={msg} />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-gray-400 ml-1">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center justify-between flex-shrink-0">
              <span>⚠ {error}</span>
              <button onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {/* File preview */}
          {uploadedFile && (
            <div className="mx-4 mb-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-blue-700">📎 {uploadedFile.name}</span>
              <button onClick={() => setUploadedFile(null)} className="text-blue-400 hover:text-blue-600 text-xs">Remove</button>
            </div>
          )}

          {/* Input bar */}
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-end gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 bg-gray-50 transition-colors"
                title="Upload report">📎</button>
              <button onClick={toggleVoiceInput}
                className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  isListening ? "bg-red-100 border-red-300 text-red-600" : "bg-gray-50 border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-300"
                }`} title="Voice Input">
                {isListening ? "🎙️" : "🎤"}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your symptoms in detail..."
                  rows={1}
                  className="w-full mb-[-10px] resize-none text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white outline-none leading-relaxed transition-colors"
                  style={{ minHeight: "42px", maxHeight: "120px" }}
                />
                {isListening && (
                  <div className="absolute -top-6 left-0 text-xs text-red-500 animate-pulse">🎙️ Listening... Speak now</div>
                )}
              </div>
              <button onClick={sendMessage} disabled={loading || (!input.trim() && !uploadedFile)}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ➤
              </button>
            </div>
            <p className="text-xs text-gray-300 text-center mt-2">Press Enter to send • Shift+Enter for new line</p>
          </div>

        </div>
      </div>
    </div>
  );
}