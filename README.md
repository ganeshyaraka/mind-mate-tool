# AI Student Study Assistant

**Learn smarter. Revise faster.**

## Description

AI Student Study Assistant is a web application that helps students study more effectively using a
real Large Language Model (Google Gemini). A student pastes notes, a concept, or an answer, picks
what they need, and the app returns a clear AI-generated study output. It was created as an
internship project to demonstrate end-to-end LLM integration with secure server-side API handling.

## Features

1. 📝 **Summarize Notes** — concise revision bullet points from long notes.
2. 💡 **Explain Concept** — simple definition, step-by-step explanation and an example.
3. ❓ **Generate Quiz** — 5 multiple-choice questions with options A–D, answers and explanations.
4. ✍️ **Improve Answer** — corrected, clearer answer plus a list of key improvements.
5. 📚 **Study Questions** — 10 exam-style revision questions (short, conceptual, application).

Extras: copy response to clipboard, clear button, live character counter, empty output state,
loading indicator, full validation and error handling.

## Technology Stack

- **React 19** + **TypeScript**
- **TanStack Start** (full-stack React framework) with server functions for the backend
- **Tailwind CSS v4** design system (semantic tokens, responsive, accessible)
- **Google Gemini** as the LLM
- **Vite** as the build tool

## Architecture

```
Frontend (React) → Server function (TanStack Start) → Gemini API → Server function → Frontend
```

The browser never talks to Gemini directly and never sees the API key. All prompt building and API
calls happen inside `src/lib/study.functions.ts`, which runs only on the server.

## Project Structure

```
src/
├── components/
│   └── Markdown.tsx          # renders headings, paragraphs, bullet & numbered lists
├── lib/
│   ├── prompts.ts            # feature list + prompt generation (one prompt per feature)
│   ├── validation.ts         # shared client + server validation
│   └── study.functions.ts    # SERVER-ONLY: validates, builds prompt, calls Gemini, handles errors
├── routes/
│   ├── __root.tsx            # document shell, fonts, metadata
│   └── index.tsx             # the main UI (input, feature cards, actions, AI response)
└── styles.css                # design system tokens
.env.example                  # shows the required variable name (no real key)
```

## How It Works

1. Student opens the app and pastes study material.
2. Student selects one of the five AI features.
3. Student clicks **✨ Generate**.
4. The frontend validates the input (empty / whitespace / too long).
5. The request `{ "feature": "summarize", "input": "..." }` is sent to the server function.
6. The server re-validates, builds the feature-specific prompt and calls Gemini.
7. The AI response is returned and rendered in the **AI Response** section.

## Prompt Engineering

Each feature has its own carefully written prompt in `src/lib/prompts.ts`. The prompt instructs the
model on role, requirements, output structure and grounding (for example, the quiz and summary
prompts forbid adding information not present in the supplied material). The selected feature id
decides which prompt template is used, and the student's text is injected into it on the server.

## Validation

- Empty or whitespace-only input → `Please enter your study material.` and **no API request is made**.
- Input longer than 10,000 characters → `Your input is too long. Please shorten your study material and try again.`
- The same rules run again on the server, so the API cannot be misused by a crafted request.

## Error Handling

The server catches invalid API keys, rate limits, quota errors, network failures, malformed
responses and unexpected exceptions. Technical details are logged on the server only; the user sees
a friendly message such as `Unable to generate a response. Please try again.` An empty AI response is
also detected and reported. No API keys, stack traces or backend details are ever exposed.

## API Setup

By default the app calls Gemini through Lovable AI using the managed `LOVABLE_API_KEY` server
secret — no manual setup is needed to run it here.

To use your own Google AI Studio key instead:

1. Create a key at <https://aistudio.google.com/app/apikey>.
2. Copy `.env.example` to `.env` and set:

```
GEMINI_API_KEY=your_api_key_here
```

3. Restart the app. When `GEMINI_API_KEY` is present, requests go to the Google Gemini API directly.

`.env` is git-ignored and the key is only ever read inside the server function.

## Running the Project

```bash
bun install      # or: npm install
bun run dev      # or: npm run dev   → http://localhost:8080
bun run build    # production build
```

## Screenshots

_Add screenshots here after running the app._

| Screen | Image |
| --- | --- |
| Home / input | _(add screenshot)_ |
| Quiz output | _(add screenshot)_ |

## Testing

| # | Test | Expected |
| --- | --- | --- |
| 1 | Paste a paragraph → Summarize Notes | Concise bullet-point summary |
| 2 | Enter a difficult concept → Explain Concept | Simple explanation with example |
| 3 | Paste material → Generate Quiz | 5 MCQs with options, answers, explanations |
| 4 | Paste a weak answer → Improve Answer | Improved answer + key improvements |
| 5 | Paste material → Study Questions | 10 revision questions |
| 6 | Click Generate with empty input | "Please enter your study material." and no request sent |
| 7 | Simulate API failure | "Unable to generate a response. Please try again." app keeps working |

## Future Improvements

- User accounts and sign-in
- Saved study sessions and history
- PDF / document upload
- Flashcard generation
- Difficulty levels for quizzes
- Export responses to PDF
