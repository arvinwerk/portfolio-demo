"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  CHAT_ADDRESS_LIMIT,
  CHAT_ADDRESS_WINDOW_MS,
  CHAT_GLOBAL_LIMIT,
  CHAT_GLOBAL_WINDOW_MS,
} from "../domain/rate-policy";
import { SURFACES } from "../domain/guidance";
import { demonstrateSeal, demonstrationMatches, SEAL_SAMPLE_TEXT } from "./seal-demonstration";

const STUDIES = ["retrieval", "seal", "tempo", "guidance"] as const;

type StudyId = (typeof STUDIES)[number];

const studyRegistry: { [Key in StudyId]: () => ReactNode } = {
  retrieval: RetrievalStudy,
  seal: SealStudy,
  tempo: TempoStudy,
  guidance: GuidanceStudy,
};

const LABELS: Record<StudyId, string> = {
  retrieval: "Zoeken",
  seal: "Zegel",
  tempo: "Tempo",
  guidance: "Vorm",
};

export function StudyBench() {
  const [active, setActive] = useState<StudyId>("retrieval");
  const Panel = studyRegistry[active];

  return (
    <div className="bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Experimenten">
        {STUDIES.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`study-tab-${id}`}
            aria-selected={active === id}
            aria-controls={`study-panel-${id}`}
            className={`rounded-full px-4 py-2 font-ui text-sm ${
              active === id ? "bg-primary text-white" : "bg-paper text-ink"
            }`}
            onClick={() => setActive(id)}
          >
            {LABELS[id]}
          </button>
        ))}
      </div>
      <div className="mt-6" role="tabpanel" id={`study-panel-${active}`} aria-labelledby={`study-tab-${active}`}>
        <Panel />
      </div>
    </div>
  );
}

function RetrievalStudy() {
  const [query, setQuery] = useState("opleiding");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fragments, setFragments] = useState<{ source: string; text: string }[] | null>(null);
  const [found, setFound] = useState<boolean | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = query.trim();
    if (!text || pending) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/probe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const raw: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        setFragments(null);
        setFound(null);
        setError(messageFrom(raw));
        return;
      }
      const parsed = readProbe(raw);
      if (!parsed) {
        setError("Het zoeken lukte niet. Probeer het opnieuw.");
        return;
      }
      setFound(parsed.found);
      setFragments(parsed.fragments);
    } catch {
      setError("Het zoeken lukte niet. Probeer het opnieuw.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)}>
      <p className="text-ink">BM25 doorzoekt content/rag. Dezelfde poort als de chat. De volgorde is de rangschikking, hoogste eerst.</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="probe-query">
          Zoekterm
        </label>
        <input
          id="probe-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-11 flex-1 border border-[#e3dcd0] px-3 text-ink outline-none focus:border-primary"
        />
        <button type="submit" className="bg-action px-4 py-2 font-ui text-sm font-medium tracking-wide text-white uppercase" disabled={pending}>
          {pending ? "Zoekt" : "Zoek"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? "Ik doorzoek het profiel." : ""}
      </p>
      {error ? <p className="mt-4 text-sm text-primary">{error}</p> : null}
      {found === false ? <p className="mt-4 text-muted">Niets in het profiel voor die woorden.</p> : null}
      {fragments && fragments.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {fragments.map((fragment, index) => (
            <li key={`${fragment.source}-${index}`} className="bg-paper p-4">
              <p className="font-ui text-xs tracking-[0.14em] text-primary uppercase">
                {index + 1}. {fragment.source}
              </p>
              <p className="mt-2 text-sm text-ink">{fragment.text}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </form>
  );
}

function SealStudy() {
  const [text, setText] = useState(SEAL_SAMPLE_TEXT);
  const [signature, setSignature] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);

  return (
    <div>
      <p className="text-ink">
        Openbare demonstratiesleutel. Het chatgesprek gebruikt een andere sleutel, die de browser niet ziet.
      </p>
      <label className="mt-4 block text-sm text-muted" htmlFor="seal-text">
        Tekst
      </label>
      <textarea
        id="seal-text"
        rows={3}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setVerdict(null);
        }}
        className="mt-2 w-full border border-[#e3dcd0] px-3 py-2 text-ink outline-none focus:border-primary"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="bg-action px-4 py-2 font-ui text-sm font-medium tracking-wide text-white uppercase"
          onClick={() => {
            void demonstrateSeal(text).then((next) => {
              setSignature(next);
              setVerdict(null);
            });
          }}
        >
          Verzegel
        </button>
        <button
          type="button"
          className="bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
          disabled={!signature}
          onClick={() => {
            if (!signature) {
              return;
            }
            void demonstrationMatches(text, signature).then((matches) => {
              setVerdict(matches ? "Het zegel klopt." : "Het zegel breekt. De tekst wijkt af van wat er getekend is.");
            });
          }}
        >
          Controleer
        </button>
      </div>
      {signature ? <p className="mt-4 font-ui text-xs break-all text-muted">{signature}</p> : null}
      {verdict ? (
        <p className="mt-3 text-ink" role="status">
          {verdict}
        </p>
      ) : null}
    </div>
  );
}

function TempoStudy() {
  return (
    <div>
      <p className="text-ink">Dit paneel doet geen verzoek. De chat en een modelantwoord wel. De getallen komen uit de tempo-regel.</p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="bg-paper p-4">
          <dt className="font-ui text-xs tracking-[0.14em] text-primary uppercase">Per adres</dt>
          <dd className="mt-2 font-display text-3xl font-semibold text-ink">{CHAT_ADDRESS_LIMIT}</dd>
          <dd className="text-sm text-muted">verzoeken per {CHAT_ADDRESS_WINDOW_MS / 1000} seconden</dd>
        </div>
        <div className="bg-paper p-4">
          <dt className="font-ui text-xs tracking-[0.14em] text-primary uppercase">Per proces</dt>
          <dd className="mt-2 font-display text-3xl font-semibold text-ink">{CHAT_GLOBAL_LIMIT}</dd>
          <dd className="text-sm text-muted">verzoeken per {CHAT_GLOBAL_WINDOW_MS / 60000} minuten</dd>
        </div>
      </dl>
    </div>
  );
}

function GuidanceStudy() {
  return (
    <div>
      <p className="text-ink">
        De commandoregel kiest een werkruimte uit deze lijst. Een antwoord met een ander oppervlak wordt geweigerd. Er wordt geen code uitgevoerd.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {SURFACES.map((surface) => (
          <li key={surface} className="bg-paper px-3 py-1 font-ui text-sm text-ink">
            {surface}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-5 text-sm text-ink underline decoration-primary/40 underline-offset-4"
        onClick={() => window.dispatchEvent(new CustomEvent("portfolio-command", { detail: "Laat je AI-experimenten zien." }))}
      >
        Zet een voorbeeld in de commandoregel
      </button>
    </div>
  );
}

function readProbe(value: unknown): { found: boolean; fragments: { source: string; text: string }[] } | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.found !== "boolean" || !Array.isArray(record.fragments)) {
    return null;
  }
  const fragments: { source: string; text: string }[] = [];
  for (const item of record.fragments) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const fragment = item as Record<string, unknown>;
    if (typeof fragment.source !== "string" || typeof fragment.text !== "string") {
      return null;
    }
    fragments.push({ source: fragment.source, text: fragment.text });
  }
  return { found: record.found, fragments };
}

function messageFrom(value: unknown): string {
  if (value && typeof value === "object" && "error" in value && typeof value.error === "string" && value.error.trim()) {
    return value.error;
  }
  return "Het zoeken lukte niet. Probeer het opnieuw.";
}
