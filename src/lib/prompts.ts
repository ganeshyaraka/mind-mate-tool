// Feature definitions + prompt generation. Shared by UI (labels) and server (prompts).

export const FEATURES = [
  {
    id: "summarize",
    emoji: "📝",
    label: "Summarize Notes",
    hint: "Turn long notes into quick revision points",
  },
  {
    id: "explain",
    emoji: "💡",
    label: "Explain Concept",
    hint: "Understand a difficult topic step by step",
  },
  {
    id: "quiz",
    emoji: "❓",
    label: "Generate Quiz",
    hint: "5 multiple-choice questions with answers",
  },
  {
    id: "improve",
    emoji: "✍️",
    label: "Improve Answer",
    hint: "Polish your written answer",
  },
  {
    id: "questions",
    emoji: "📚",
    label: "Study Questions",
    hint: "10 revision questions for exam prep",
  },
] as const;

export type FeatureId = (typeof FEATURES)[number]["id"];

export const FEATURE_IDS = FEATURES.map((f) => f.id) as readonly FeatureId[];

export const MAX_INPUT_LENGTH = 10000;

export function buildPrompt(feature: FeatureId, input: string): string {
  switch (feature) {
    case "summarize":
      return `You are an AI study assistant.
Summarize the following study material for a student.
Requirements:
- Identify the most important concepts.
- Use simple language.
- Provide concise bullet points.
- Do not add information that is not supported by the material.
- Make the result useful for quick revision.

Study material:
${input}`;

    case "explain":
      return `You are an AI study assistant helping a student understand a difficult concept.
Explain the following concept in simple language.
Requirements:
- Give a simple definition.
- Explain the concept step by step.
- Give an easy example.
- Mention important points.
- Avoid unnecessary complexity.

Concept:
${input}`;

    case "quiz":
      return `You are an AI study assistant.
Create a quiz from the following study material.
Generate 5 multiple-choice questions.
For each question:
- Provide four options: A, B, C and D.
- Provide the correct answer.
- Provide a short explanation of the correct answer.
Only use information supported by the provided study material.

Study material:
${input}`;

    case "improve":
      return `You are an AI study assistant.
Improve the following student's answer.
Requirements:
- Correct grammar and spelling.
- Improve clarity and organization.
- Preserve the student's original meaning.
- Make the answer academically clear.
- Do not introduce unsupported facts.
Return two sections with markdown headings: "Improved Answer" and "Key Improvements Made".

Student answer:
${input}`;

    case "questions":
      return `You are an AI study assistant.
Generate important revision questions from the following study material.
Create 10 questions that help a student prepare for an exam.
Include a mixture of short-answer questions, conceptual questions and application-based questions.
Only create questions based on the supplied material.

Study material:
${input}`;
  }
}

export const SYSTEM_PROMPT =
  "You are a helpful AI study assistant for students. Reply in clean markdown using headings, short paragraphs, bullet points and numbered lists where useful.";
