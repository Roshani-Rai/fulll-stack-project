import express from "express";
import { GoogleGenAI } from "@google/genai";
import doctorModel from "../models/doctorsch.js";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are MediAssist AI — a compassionate medical assistant who explains things in simple, clear, point-wise language.

DOCTOR SUGGESTION RULE:
Always populate the "suggestedSpecialty" field with the most relevant doctor type based on symptoms or findings.
Examples: "Gynecologist", "Cardiologist", "Dermatologist", "Neurologist", "General Physician", "Gastroenterologist", "Pediatricians"

LANGUAGE RULE:
Detect patient language (English / Hindi / Hinglish). Use the SAME language in every single field. No mixing.

REPLY FORMAT RULE:
The "reply" field must be SHORT and conversational — 2 to 3 sentences max. Just a warm intro like "I reviewed your report. Here is what it means for you."
All details go into "findings", "possibleConditions", and "recommendations" — NOT inside reply.

REPORT ANALYSIS:
When a medical report is shared, populate the "findings" array. Each finding must be a short object with:
- "label": the organ or section name (e.g. "Uterus", "Ovaries", "Kidneys")
- "status": "normal" or "abnormal" or "suspected"
- "explanation": 1 simple sentence explaining what it means for the patient

URGENCY RULES:
- "low" = fully normal, no follow-up needed
- "moderate" = suspected condition, needs doctor visit soon
- "high" = serious finding, see doctor in 24-48 hours
- "critical" = emergency, go to hospital now
- NEVER use "low" if any condition is suspected

OUTPUT RULE:
Return ONLY raw JSON. No markdown. No backticks. No \`\`\`json. Start with { end with }.

JSON structure:
{
  "reply": "2-3 sentence warm intro only",
  "findings": [
    { "label": "Uterus", "status": "normal", "explanation": "Your uterus is normal in size and position." },
    { "label": "Ovaries", "status": "suspected", "explanation": "Both ovaries are slightly enlarged with tiny follicles — this suggests PCOD." }
  ],
  "possibleConditions": ["PCOD / PCOS"],
  "recommendations": [
    "Visit a gynecologist to confirm the PCOD diagnosis with blood tests.",
    "Get hormone levels tested (LH, FSH, testosterone, insulin).",
    "Start lifestyle changes: balanced diet and regular exercise help manage PCOD.",
    "Do not ignore irregular periods — report them to your doctor."
  ],
  "urgencyLevel": "moderate",
  "suggestedSpecialty": "Gynecologist",
  "urgencyReason": "PCOD is suspected and needs medical confirmation and management.",
  "disclaimer": true
}

If patient describes symptoms (not a report), leave "findings" as an empty array [].
`;

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const latestUserMessage = messages.filter((m) => m.role === "user").slice(-1)[0];
    if (!latestUserMessage) {
      return res.status(400).json({ error: "No user message found" });
    }

    const parts = [];

    if (Array.isArray(latestUserMessage?.content)) {
      let hasText = false;

      for (const part of latestUserMessage.content) {
        if (part.type === "text") {
          hasText = true;
          parts.push({ text: part.text });
        } else if (part.type === "image" && part.source?.type === "base64") {
          if (part.source.data && part.source.media_type) {
            parts.push({
              inlineData: {
                mimeType: part.source.media_type,
                data: part.source.data,
              },
            });
          }
        } else if (part.type === "document") {
          hasText = true;
          parts.push({ text: "Please analyze my uploaded medical report and explain it in simple language." });
        }
      }

      if (!hasText) {
        parts.push({ text: "Please analyze this medical image and provide guidance." });
      }
    } else {
      const userText =
        typeof latestUserMessage?.content === "string"
          ? latestUserMessage.content
          : JSON.stringify(latestUserMessage?.content || "");

      parts.push({ text: userText });
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2,
        },
        contents: [{ role: "user", parts }],
      });
    } catch (geminiErr) {
      console.error("Gemini error:", geminiErr?.message);
      return res.status(500).json({
        error: "Gemini API error: " + (geminiErr?.message || "Unknown error"),
      });
    }

    const rawText = response.text;

    if (!rawText) {
      return res.status(500).json({ error: "Empty response from Gemini" });
    }

    const cleanText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = null; }
      }

      if (!parsed) {
        parsed = {
          reply: "I reviewed your information.",
          findings: [],
          possibleConditions: [],
          recommendations: ["Please consult a doctor for proper evaluation."],
          urgencyLevel: "moderate",
          urgencyReason: "Could not fully process response. Please consult a doctor.",
          disclaimer: true,
        };
      }
    }

    // ✅ Fetch matching doctors from MongoDB using correct field name "speciality"
    let suggestedDoctors = [];
    if (parsed.suggestedSpecialty) {
      try {
        suggestedDoctors = await doctorModel.find({
          speciality: { $regex: parsed.suggestedSpecialty, $options: "i" },
          available: true,
        })
          .select("-password -email -slots_booked -reviews")
          .sort({ rating: -1 })
          .limit(3);
      } catch (dbErr) {
        console.error("Doctor fetch error:", dbErr.message);
      }
    }

    res.json({
      content: [{ text: JSON.stringify(parsed) }],
      suggestedDoctors,
    });

  } catch (err) {
    console.error("Unexpected error:", err?.message);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
});

export default router;