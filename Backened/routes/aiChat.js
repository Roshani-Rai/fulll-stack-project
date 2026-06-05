import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are MediAssist AI, a medical assistant.

Patients may speak in:
- English
- Hindi
- Hinglish

Examples:
"mai bimar hu"
"mujhe bukhar hai"
"mere pet me dard hai"
"meri tabiyat kharab hai"

You must:
1. Understand Hindi/Hinglish automatically
2. Translate internally if needed
3. Analyze symptoms or medical reports
4. Give simple, safe medical guidance
5. Detect urgency level

CRITICAL: Always respond ONLY in valid JSON. No markdown, no explanation.

Format:
{
  "reply": "short simple explanation",
  "possibleConditions": [],
  "recommendations": [],
  "urgencyLevel": "low | moderate | high | critical",
  "urgencyReason": "",
  "disclaimer": true
}
`;

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "messages array is required",
      });
    }

    // Get latest user message
    const latestUserMessage =
      messages.filter((m) => m.role === "user").slice(-1)[0];

    const userText =
      typeof latestUserMessage?.content === "string"
        ? latestUserMessage.content
        : JSON.stringify(latestUserMessage?.content || "");

    const prompt = `
${SYSTEM_PROMPT}

Patient Message:
${userText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    // Try parsing JSON safely
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      parsed = {
        reply: text,
        possibleConditions: [],
        recommendations: [],
        urgencyLevel: "low",
        urgencyReason: "",
        disclaimer: true,
      };
    }

    res.json({
      content: [
        {
          text: JSON.stringify(parsed),
        },
      ],
    });
  } catch (err) {
    console.error("Gemini AI error:", err);

    res.status(500).json({
      error: err.message || "Unknown error",
    });
  }
});

export default router;