import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, Copy, Loader2, Sparkles, Trash2 } from "lucide-react";

import { Markdown } from "@/components/Markdown";
import { FEATURES, MAX_INPUT_LENGTH, type FeatureId } from "@/lib/prompts";
import { validateStudyInput } from "@/lib/validation";
import { generateStudyResponse } from "@/lib/study.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Student Study Assistant — Learn smarter. Revise faster." },
      {
        name: "description",
        content:
          "Summarize notes, explain concepts, generate quizzes, improve answers and create revision questions with AI.",
      },
      { property: "og:title", content: "AI Student Study Assistant" },
      {
        property: "og:description",
        content:
          "Use AI to summarize notes, understand concepts, practice quizzes and improve your answers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudyAssistant,
});

function StudyAssistant() {
  const generate = useServerFn(generateStudyResponse);

  const [input, setInput] = useState("");
  const [feature, setFeature] = useState<FeatureId>("summarize");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const overLimit = input.length > MAX_INPUT_LENGTH;

  async function handleGenerate() {
    if (loading) return; // prevent duplicate requests

    const valid = validateStudyInput(input);
    if (!valid.ok) {
      setError(valid.message);
      setResponse("");
      return;
    }

    setError("");
    setLoading(true);
    setResponse("");
    try {
      const result = await generate({ data: { feature, input } });
      if (result.ok) setResponse(result.text);
      else setError(result.error);
    } catch {
      setError("Unable to generate a response. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setInput("");
    setResponse("");
    setError("");
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy the response. Please select and copy it manually.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-hero-gradient px-4 py-12 text-primary-foreground sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Student utility
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            AI Student Study Assistant
          </h1>
          <p className="mt-2 text-lg font-medium opacity-90">Learn smarter. Revise faster.</p>
          <p className="mt-3 max-w-2xl text-sm opacity-80 sm:text-base">
            Use AI to summarize notes, understand concepts, practice quizzes, and improve your
            answers.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:py-10">
        {/* Study material input */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <label htmlFor="material" className="text-sm font-semibold text-foreground">
            Study Material
          </label>
          <textarea
            id="material"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError("");
            }}
            placeholder="Paste your notes, question, concept, or answer here..."
            rows={10}
            className="mt-3 w-full resize-y rounded-xl border border-input bg-background p-4 text-[0.95rem] leading-relaxed outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
          />
          <div className="mt-2 flex justify-end">
            <span
              className={`text-xs ${overLimit ? "font-semibold text-destructive" : "text-muted-foreground"}`}
            >
              {input.length.toLocaleString()} / {MAX_INPUT_LENGTH.toLocaleString()} characters
            </span>
          </div>
        </section>

        {/* Feature selection */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Choose what you need</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const active = feature === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFeature(f.id)}
                  className={`rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-card focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 ${
                    active
                      ? "border-primary bg-primary/8 shadow-card"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="text-xl">{f.emoji}</span>
                  <p className="mt-2 font-semibold text-foreground">{f.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-card transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : "✨ Generate"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-5 py-3 font-medium text-foreground transition hover:bg-secondary disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
        </section>

        {/* Output */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
            <h2 className="text-lg font-bold tracking-tight text-foreground">AI Response</h2>
            {response && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-1.5 text-sm font-medium transition hover:bg-secondary"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Response"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>AI is generating your response...</span>
            </div>
          ) : response ? (
            <Markdown content={response} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Your AI-generated response will appear here.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built as a student utility project · Powered by the Gemini LLM API
      </footer>
    </div>
  );
}
