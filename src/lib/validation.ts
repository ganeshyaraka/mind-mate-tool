// Shared validation used on both the client and the server.

import { FEATURE_IDS, MAX_INPUT_LENGTH, type FeatureId } from "./prompts";

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateStudyInput(input: string): ValidationResult {
  if (!input || input.trim().length === 0) {
    return { ok: false, message: "Please enter your study material." };
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return {
      ok: false,
      message: "Your input is too long. Please shorten your study material and try again.",
    };
  }
  return { ok: true };
}

export function validateFeature(feature: string): feature is FeatureId {
  return (FEATURE_IDS as readonly string[]).includes(feature);
}
