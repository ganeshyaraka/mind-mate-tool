// Secure server-side endpoint: builds the prompt and calls the Gemini LLM.
// The API key is read from server environment variables only and never sent to the browser.

import { createServerFn } from "@tanstack/react-start";
import { buildPrompt, SYSTEM_PROMPT, type FeatureId } from "./prompts";
import { validateFeature, validateStudyInput } from "./validation";

const FRIENDLY_ERROR = "Unable to generate a response. Please try again.";

export type GenerateInput = { feature: string; input: string };
export type GenerateResult = { ok: true; text: string } | { ok: false; error: string };

/** Calls the user's own Gemini API key (Google AI Studio) when configured. */
async function callGoogleGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini_http_${res.status}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

/** Default: Gemini served through Lovable AI (no personal API key needed). */
async function callLovableGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3.8-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`gateway_http_${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

export const generateStudyResponse = createServerFn({ method: "POST" })
  .inputValidator((data: GenerateInput) => data)
  .handler(async ({ data }): Promise<GenerateResult> => {
    // 1. Server-side validation (never trust the client)
    if (!data || typeof data.input !== "string" || typeof data.feature !== "string") {
      return { ok: false, error: "Invalid request. Please try again." };
    }
    const valid = validateStudyInput(data.input);
    if (!valid.ok) return { ok: false, error: valid.message };
    if (!validateFeature(data.feature)) {
      return { ok: false, error: "Please choose a study feature." };
    }

    const prompt = buildPrompt(data.feature as FeatureId, data.input.trim());

    const googleKey = process.env["GEMINI_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];

    try {
      let text = "";
      if (googleKey) {
        text = await callGoogleGemini(googleKey, prompt);
      } else if (lovableKey) {
        text = await callLovableGemini(lovableKey, prompt);
      } else {
        console.error("No Gemini credentials configured");
        return { ok: false, error: FRIENDLY_ERROR };
      }

      if (!text.trim()) {
        return { ok: false, error: "The AI returned an empty response. Please try again." };
      }
      return { ok: true, text };
    } catch (err) {
      // Log details server-side only; the user sees a safe message.
      const message = err instanceof Error ? err.message : "unknown";
      console.error("AI generation failed:", message);
      if (message.endsWith("_401") || message.endsWith("_403")) {
        return { ok: false, error: "AI service is not configured correctly. Please try later." };
      }
      if (message.endsWith("_429")) {
        return { ok: false, error: "Too many requests right now. Please wait a moment and retry." };
      }
      if (message.endsWith("_402")) {
        return { ok: false, error: "AI usage limit reached. Please add credits and try again." };
      }
      return { ok: false, error: FRIENDLY_ERROR };
    }
  });
