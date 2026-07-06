import { Router } from "express";
import OpenAI from "openai";
import { asyncHandler } from "../lib/asyncHandler";
import { createError } from "../middleware/errorHandler";

const router = Router();

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw createError(
      "AI assistant is not configured. Add an OPENAI_API_KEY secret to enable it.",
      503,
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const CONTEXT_PROMPTS: Record<string, string> = {
  general:
    "You are a helpful writing assistant embedded inside an agency management platform (AgencyOS). Write clear, professional, concise text for the given field. Do not add quotation marks, markdown, or explanations — output only the final text to insert.",
  proposal:
    "You are a business proposal writer for a creative/marketing agency. Write persuasive, professional proposal content. Output only the final text, no markdown or preamble.",
  quotation:
    "You are writing quotation/estimate line item descriptions or notes for a creative agency. Be concise and professional. Output only the final text.",
  invoice:
    "You are writing invoice notes or line-item descriptions for a creative agency. Be concise and professional. Output only the final text.",
  "content-caption":
    "You are a social media copywriter. Write an engaging, on-brand social media caption based on the instructions. Keep it concise, include relevant tone, no markdown formatting, no hashtags unless asked. Output only the caption text.",
  task:
    "You are writing a clear, actionable task description for a project management tool. Output only the final text, no markdown or preamble.",
  "client-notes":
    "You are summarizing or writing internal notes about a client for an agency's CRM. Be concise and professional. Output only the final text.",
  lead:
    "You are writing notes or a summary about a sales lead for an agency's CRM. Be concise and professional. Output only the final text.",
  email:
    "You are writing a professional business email. Output only the final email body text, no subject line unless asked, no markdown.",
};

router.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const {
      prompt,
      context,
      existingText,
    } = req.body as { prompt?: string; context?: string; existingText?: string };

    if (!prompt || !prompt.trim()) {
      throw createError("prompt is required", 400);
    }

    const systemPrompt = CONTEXT_PROMPTS[context || "general"] || CONTEXT_PROMPTS.general;

    const userMessage = existingText?.trim()
      ? `Existing text:\n"""${existingText}"""\n\nInstruction: ${prompt}`
      : `Instruction: ${prompt}`;

    const openai = getClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 700,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    res.json({ text });
  }),
);

export default router;
