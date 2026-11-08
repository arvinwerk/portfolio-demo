"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { recruiterQuestion, visitorDoors, type VisitorDoor } from "../domain/visitor-door";
import { readableChatError } from "./client-error";

export function ChatWidget({ name = "Noor Linden" }: { name?: string }) {
  const [open, setOpen] = useState(false);
  const [door, setDoor] = useState<VisitorDoor | null>(null);
  const [input, setInput] = useState("");
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const firstDoorRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const doors = useMemo(() => visitorDoors(name), [name]);
  const opening = doors.find((item) => item.id === door);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        fetch: async (input, init) => readableChatError(await fetch(input, init)),
      }),
    [],
  );
  const { messages, sendMessage, setMessages, stop, status, error } = useChat({ messages: [], transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) {
      return;
    }

    if (opening) {
      inputRef.current?.focus();
    } else {
      firstDoorRef.current?.focus();
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, opening]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, open, status, opening]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("portfolio-chat-open", openChat);
    return () => window.removeEventListener("portfolio-chat-open", openChat);
  }, []);

  function choose(id: VisitorDoor) {
    const next = doors.find((item) => item.id === id);
    if (!next) {
      return;
    }
    setDoor(id);
    setInput("");
    if (next.question) {
      sendMessage({ text: next.question });
    }
  }

  function otherDoor() {
    if (busy) {
      void stop();
    }
    setDoor(null);
    setInput("");
    setMessages([]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy || !opening) {
      return;
    }
    sendMessage({ text: door === "recruiter" ? recruiterQuestion(text) : text });
    setInput("");
  }

  return (
    <div
      className={`fixed right-4 bottom-4 z-40 flex flex-col gap-3 sm:right-8 sm:bottom-6 ${
        open ? "w-[calc(100%-2rem)] max-w-md items-stretch" : "items-end"
      }`}
    >
      {open ? (
        <section
          className="flex h-[min(36rem,calc(100dvh-7rem))] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div>
              <h2 id={titleId} className="font-display text-lg font-semibold text-white">
                Chat
              </h2>
              <p className="text-xs text-white/75">Antwoorden komen uit het demoprofiel.</p>
            </div>
            <button type="button" className="px-2 py-1 text-sm text-white" onClick={() => setOpen(false)}>
              Sluiten
            </button>
          </header>
          {opening ? (
            <>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-paper px-4 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-ui text-[11px] tracking-[0.22em] text-primary uppercase">{opening.hint}</p>
                  <button type="button" className="text-xs text-muted underline" onClick={otherDoor}>
                    Andere ingang
                  </button>
                </div>
                <p className="font-display text-2xl leading-tight text-ink">{opening.prompt}</p>
                {messages.map((message) => (
                  <Message key={message.id} message={message} busy={busy} last={message.id === messages.at(-1)?.id} />
                ))}
                <div ref={endRef} />
              </div>
              <p className="sr-only" aria-live="polite">
                {status === "streaming" ? "Het antwoord komt binnen." : ""}
              </p>
              {error ? <p className="px-4 py-2 text-sm text-primary">{error.message}</p> : null}
              <form className="flex items-end gap-2 border-t border-[#ededed] p-3" onSubmit={submit}>
                <label className="sr-only" htmlFor="chat-bericht">
                  Bericht
                </label>
                <textarea
                  id="chat-bericht"
                  ref={inputRef}
                  rows={2}
                  value={input}
                  placeholder={opening.placeholder}
                  className="min-h-12 flex-1 resize-none border border-[#e3dcd0] px-3 py-2 text-ink outline-none focus:border-primary"
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                {/* type="button" zodat Stop niet tijdens de klik in een submit-knop verandert. */}
                {busy ? (
                  <button type="button" className="bg-ink px-3 py-2 text-sm text-white" onClick={() => void stop()}>
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-action px-3 py-2 text-sm font-medium text-white uppercase"
                    onClick={(event) => event.currentTarget.form?.requestSubmit()}
                  >
                    Verstuur
                  </button>
                )}
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col bg-ink px-5 pt-6 pb-5 text-white">
              <p className="font-ui text-[11px] tracking-[0.28em] text-white/55 uppercase">Drie deuren</p>
              <p className="mt-3 font-display text-4xl leading-none text-white">Hoe kom je hier binnen?</p>
              <div className="mt-auto flex flex-col gap-2" role="group" aria-label="Hoe kom je hier binnen?">
                {doors.map((item, index) => (
                  <button
                    key={item.id}
                    ref={index === 0 ? firstDoorRef : undefined}
                    type="button"
                    className="group border-y border-r border-white/15 border-l-2 border-l-primary bg-white/5 px-4 py-3 text-left hover:bg-white"
                    aria-label={item.label}
                    onClick={() => choose(item.id)}
                  >
                    <span className="block font-display text-xl leading-tight text-white group-hover:text-ink">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs tracking-wide text-white/60 group-hover:text-muted">
                      {item.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : null}
      <button
        type="button"
        className="hidden h-14 w-14 items-center justify-center self-end rounded-full bg-primary text-white shadow-material sm:flex"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="sr-only">{open ? "Chat sluiten" : "Chat openen"}</span>
        <ChatIcon />
      </button>
    </div>
  );
}

function Message({ message, busy, last }: { message: UIMessage; busy: boolean; last: boolean }) {
  const text = message.parts.flatMap((part) => (part.type === "text" ? [part.text] : []));
  const searching = message.parts.some((part) => isPendingTool(part));
  if (text.length === 0 && !searching) {
    return null;
  }

  return (
    <p
      className={`max-w-[85%] px-3 py-2 whitespace-pre-wrap ${
        message.role === "user" ? "ml-auto bg-primary text-white" : "bg-white text-ink shadow-material"
      }`}
    >
      {text.join("")}
      {searching ? <span className="block text-sm text-muted">Ik zoek in het profiel.</span> : null}
      {busy && last && message.role === "assistant" ? (
        <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary align-middle" aria-hidden="true" />
      ) : null}
    </p>
  );
}

function isPendingTool(part: { type: string; state?: string }): boolean {
  return part.type.startsWith("tool-") && part.state !== "output-available" && part.state !== "output-error";
}

function ChatIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 5.5h14v9.2H8.2L5 17.8V5.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
