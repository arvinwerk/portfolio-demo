"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { parseGuidance } from "../domain/guidance";

const SUGGESTIONS = [
  "Leg je architectuurkeuzes uit.",
  "Laat je AI-experimenten zien.",
  "Verken je projecten.",
  "Hoe ontwerp je een schaalbaar AI-platform?",
] as const;

export function CommandDock() {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };
    const onPrefill = (event: Event) => {
      const text = (event as CustomEvent<unknown>).detail;
      if (typeof text !== "string" || !text.trim()) {
        return;
      }
      setValue(text);
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("portfolio-command", onPrefill);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("portfolio-command", onPrefill);
    };
  }, []);

  async function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const raw: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        setError(messageFrom(raw));
        return;
      }
      const guidance = parseGuidance(raw);
      window.dispatchEvent(new CustomEvent("portfolio-guide", { detail: guidance }));
      setValue("");
    } catch {
      setError("De verkenning lukte niet. Probeer het opnieuw.");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitText(value);
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:bottom-6 sm:pr-28" data-boundary="commando">
      <form
        className="mx-auto max-w-2xl bg-white p-2 shadow-card ring-1 ring-black/5"
        onSubmit={submit}
        onFocus={() => setSuggestionsOpen(true)}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
            setSuggestionsOpen(false);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={fieldId}>
            Verkenning
          </label>
          <input
            id={fieldId}
            ref={inputRef}
            value={value}
            disabled={pending}
            placeholder="Vraag iets, of druk op / om te verkennen…"
            className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-ink outline-none placeholder:text-muted"
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="submit"
            className="bg-action px-3 py-2 font-ui text-sm font-medium tracking-wide text-white uppercase disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Zoekt" : "Open"}
          </button>
        </div>
        {suggestionsOpen ? (
          <div className="flex gap-2 overflow-x-auto px-1 pt-2 pb-1" aria-label="Voorbeelden">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="shrink-0 bg-paper px-3 py-1 text-left text-xs text-ink hover:text-primary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void submitText(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {pending ? "De verkenning wordt gekozen." : ""}
        </p>
        {error ? <p className="px-3 pb-2 text-sm text-primary">{error}</p> : null}
      </form>
    </div>
  );
}

function messageFrom(value: unknown): string {
  if (value && typeof value === "object" && "error" in value && typeof value.error === "string" && value.error.trim()) {
    return value.error;
  }
  return "De verkenning lukte niet. Probeer het opnieuw.";
}
