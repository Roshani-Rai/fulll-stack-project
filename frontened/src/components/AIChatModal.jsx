import { useState, useRef, useEffect } from "react";

const URGENCY = {
  low:      { label: "Low",      bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  icon: "✓" },
  moderate: { label: "Moderate", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", icon: "⚠" },
  high:     { label: "High",     bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", icon: "⚡" },
  critical: { label: "Critical", bg: "bg-red-50",    border: "border-red-400",    text: "text-red-700",    icon: "🚨" },
};

const STORAGE_KEY = "mediassist_chat_history";

export default function AIChatModal({ onClose }) {
  const [sessions, setSessions]         = useState(() => {
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
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);
  const recognitionRef = useRef(null);
const [isListening, setIsListening] = useState(false);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const startNewChat = () => {
    setActiveSession(null);
    setMessages([]);
    setInput("");
    setUploadedFile(null);
    setError("");
    setShowHistory(false);
  };


  useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "hi-IN";

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.onerror = () => {
    setIsListening(false);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    setInput(prev =>
      prev ? `${prev} ${transcript}` : transcript
    );
  };

  recognitionRef.current = recognition;
}, []);

  const openSession = (session) => {
    setActiveSession(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSession === id) startNewChat();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG, WebP and PDF supported."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({ name: file.name, base64: reader.result.split(",")[1], type: file.type });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const toggleVoiceInput = () => {
  if (!recognitionRef.current) {
    setError(
      "Speech recognition is not supported in this browser."
    );
    return;
  }

  if (isListening) {
    recognitionRef.current.stop();
  } else {
    recognitionRef.current.start();
  }
};

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;
    setError("");

    const userMsg = {
      role: "user",
      text: text || "Please analyze this medical report.",
      fileName: uploadedFile?.name || null,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setUploadedFile(null);
    setLoading(true);

    try {
      const contentParts = [];
      if (uploadedFile) {
        if (uploadedFile.type === "application/pdf") {
          contentParts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: uploadedFile.base64 } });
        } else {
          contentParts.push({ type: "image", source: { type: "base64", media_type: uploadedFile.type, data: uploadedFile.base64 } });
        }
      }
     if (text) {
  contentParts.push({
    type: "text",
    text: `
You are MediAssist AI.

The patient may communicate in:
- English
- Hindi
- Hinglish

Examples:
"mai bimar hu" = "I am sick"
"mujhe bukhar hai" = "I have fever"
"mere pet me dard hai" = "I have stomach pain"
"meri tabiyat kharab hai" = "I feel unwell"

Instructions:
- Detect language automatically.
- Translate internally if needed.
- Understand Hindi/Hinglish naturally.
- Reply in the same language as the patient.
- Provide medical guidance in simple language.

Patient Message:
${text}
`,
  });
}
      const apiMessages = updatedMessages.map((m, i) => {
        if (m.role === "user") {
          return { role: "user", content: i === updatedMessages.length - 1 ? contentParts : m.text };
        }
        return { role: "assistant", content: m.rawJson || m.text };
      });

      const response = await fetch("http://localhost:4000/api/ai-chat", {
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
        parsed = { reply: rawText, possibleConditions: [], recommendations: [], urgencyLevel: "low", urgencyReason: "", disclaimer: true };
      }

      const finalMessages = [...updatedMessages, { role: "assistant", ...parsed, rawJson: rawText }];
      setMessages(finalMessages);

      // Save or update session in history
      const sessionTitle = text
        ? text.slice(0, 40) + (text.length > 40 ? "..." : "")
        : "Report Analysis";

      const sessionId = activeSession || Date.now().toString();
      setActiveSession(sessionId);

      setSessions(prev => {
        const exists = prev.find(s => s.id === sessionId);
        if (exists) {
          return prev.map(s => s.id === sessionId
            ? { ...s, messages: finalMessages, updatedAt: new Date().toLocaleString() }
            : s
          );
        }
        return [{
          id: sessionId,
          title: sessionTitle,
          messages: finalMessages,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        }, ...prev];
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* LARGER SCREEN — 900px wide, 85vh tall */}
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl flex overflow-hidden shadow-2xl border border-gray-100">

        {/* ── LEFT SIDEBAR — HISTORY ── */}
        <div className={`${showHistory ? 'flex' : 'hidden'} md:flex flex-col w-64 border-r border-gray-100 bg-gray-50 flex-shrink-0`}>
          
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
            <p className="text-sm font-semibold text-gray-700">Chat History</p>
            <button
              onClick={startNewChat}
              className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New
            </button>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto py-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-xs text-gray-400">No chat history yet.</p>
                <p className="text-xs text-gray-400 mt-1">Start a conversation!</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => openSession(session)}
                  className={`mx-2 mb-1 px-3 py-2.5 rounded-xl cursor-pointer group flex items-start justify-between gap-2 transition-colors
                    ${activeSession === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-white border border-transparent hover:border-gray-200'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${activeSession === session.id ? 'text-blue-700' : 'text-gray-700'}`}>
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{session.updatedAt}</p>
                    <p className="text-xs text-gray-400">{session.messages.length} messages</p>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, session.id)}
                    className="text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT SIDE — CHAT ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
            {/* History toggle — mobile only */}
            <button
              onClick={() => setShowHistory(h => !h)}
              className="md:hidden text-white/80 hover:text-white text-lg"
              title="Toggle history"
            >
              ☰
            </button>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-lg flex-shrink-0">🩺</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">MediAssist AI</p>
              <p className="text-blue-100 text-xs truncate">
                {activeSession
                  ? sessions.find(s => s.id === activeSession)?.title || "Current chat"
                  : "Describe symptoms or upload a report"}
              </p>
            </div>
            <button
              onClick={startNewChat}
              className="hidden md:block text-white/70 hover:text-white text-xs border border-white/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              + New Chat
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl px-1 flex-shrink-0">✕</button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👋</div>
                <p className="text-gray-700 font-medium">Hello! I'm your AI health assistant.</p>
                <p className="text-gray-400 text-sm mt-1">Tell me your symptoms or upload a medical report.</p>
                <div className="flex flex-wrap gap-2 justify-center mt-5">
                  {["I have a headache and fever", "My report shows high blood pressure", "I have chest pain since morning", "I feel dizzy and nauseous"].map(s => (
                    <button key={s} onClick={() => setInput(s)}
                      className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 transition-colors">
                      {s}
                    </button>
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
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] space-y-2">
                   <div className="max-w-[85%] space-y-3">

  {/* MAIN REPLY */}
  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
    <p className="text-gray-800 text-sm leading-relaxed">
      {msg.reply}
    </p>
  </div>

  {/* CONDITIONS */}
  {msg.possibleConditions?.length > 0 && (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
      <p className="text-xs font-semibold text-blue-700 mb-2">
        🧠 Possible Conditions
      </p>
      <div className="flex flex-wrap gap-2">
        {msg.possibleConditions.map((c, i) => (
          <span
            key={i}
            className="text-xs bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  )}

  {/* RECOMMENDATIONS */}
  {msg.recommendations?.length > 0 && (
    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <p className="text-xs font-semibold text-green-700 mb-2">
        💡 Recommendations
      </p>
      <ul className="space-y-1">
        {msg.recommendations.map((r, i) => (
          <li key={i} className="text-xs text-green-800 flex gap-2">
            <span>•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  )}

  {/* URGENCY CARD */}
  {msg.urgencyLevel && (
    <div
      className={`rounded-xl px-4 py-3 border text-xs ${
        msg.urgencyLevel === "critical"
          ? "bg-red-50 border-red-300 text-red-700"
          : msg.urgencyLevel === "high"
          ? "bg-orange-50 border-orange-300 text-orange-700"
          : msg.urgencyLevel === "moderate"
          ? "bg-yellow-50 border-yellow-300 text-yellow-700"
          : "bg-green-50 border-green-300 text-green-700"
      }`}
    >
      <p className="font-semibold mb-1">
        🚨 Urgency: {msg.urgencyLevel.toUpperCase()}
      </p>
      <p className="opacity-90">{msg.urgencyReason}</p>
    </div>
  )}

  {/* DISCLAIMER */}
  {msg.disclaimer && (
    <p className="text-[11px] text-gray-400 px-1">
      ⚠ This is AI-generated information. Not a substitute for professional medical advice.
    </p>
  )}
</div>
                    {msg.urgencyLevel && (() => {
                      const u = URGENCY[msg.urgencyLevel] || URGENCY.low;
                      return (
                        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs ${u.bg} ${u.border}`}>
                          <span className={`font-bold text-sm ${u.text}`}>{u.icon}</span>
                          <div>
                            <span className={`font-semibold ${u.text}`}>Urgency: {u.label}</span>
                            {msg.urgencyReason && <p className={`mt-0.5 ${u.text} opacity-80`}>{msg.urgencyReason}</p>}
                          </div>
                        </div>
                      );
                    })()}
                    {msg.possibleConditions?.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Possible Conditions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.possibleConditions.map((c, j) => (
                            <span key={j} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.recommendations?.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">What To Do</p>
                        <ul className="space-y-1.5">
                          {msg.recommendations.map((r, j) => (
                            <li key={j} className="text-xs text-gray-700 flex gap-2">
                              <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.disclaimer && (
                      <p className="text-xs text-gray-400 px-1">ⓘ This is AI-generated information, not medical advice. Always consult a qualified doctor.</p>
                    )}
                  </div>
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

          {/* ERROR */}
          {error && (
            <div className="mx-4 mb-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center justify-between flex-shrink-0">
              <span>⚠ {error}</span>
              <button onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {/* FILE PREVIEW */}
          {uploadedFile && (
            <div className="mx-4 mb-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-blue-700">📎 {uploadedFile.name}</span>
              <button onClick={() => setUploadedFile(null)} className="text-blue-400 hover:text-blue-600 text-xs">Remove</button>
            </div>
          )}

          {/* INPUT */}
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-end gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex-shrink-0 w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 bg-gray-50 transition-colors"
                title="Upload report">
                📎
              </button>
              <button
  onClick={toggleVoiceInput}
  className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
    isListening
      ? "bg-red-100 border-red-300 text-red-600"
      : "bg-gray-50 border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-300"
  }`}
  title="Voice Input"
>
  {isListening ? "🎙️" : "🎤"}
</button>
              <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
              <textarea 
                value={input}
               onChange={(e) => {
  setInput(e.target.value);

  e.target.style.height = "auto";
  e.target.style.height =
    Math.min(e.target.scrollHeight, 120) + "px";
}}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms in detail..."
                rows={1}
                
                className="flex-1 resize-none text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white outline-none leading-relaxed transition-colors"
                style={{ minHeight: "42px", maxHeight: "120px" }}
              />
              {isListening && (
  <div className="text-xs text-red-500 mt-1 animate-pulse">
    🎙️ Listening... Speak now
  </div>
)}
              <button
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !uploadedFile)}
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