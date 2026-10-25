"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { WELCOME_TEXT } from "../domain/welcome";
import { readableChatError } from "./client-error";

const welcome: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [{ type: "text", text: WELCOME_TEXT }],
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        fetch: async (input, init) => readableChatError(await fetch(input, init)),
      }),
    [],
  );
  const { messages, sendMessage, stop, status, error } = useChat({ messages: [welcome], transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, open, status]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("portfolio-chat-open", openChat);
    return () => window.removeEventListener("portfolio-chat-open", openChat);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) {
      return;
    }
    sendMessage({ text });
    setInput("");
  }

  return (
    <div
      className={`fixed right-4 bottom-4 z-40 flex flex-col gap-3 sm:right-8 sm:bottom-6 ${
        open ? "w-[calc(100%-2rem)] max-w-96 items-stretch" : "items-end"
      }`}
    >
      {open ? (
        <section
          className="flex h-[min(32rem,calc(100dvh-7rem))] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5"
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
            <button
              type="button"
              className="px-2 py-1 text-sm text-white"
              onClick={() => setOpen(false)}
            >
              Sluiten
            </button>
          </header>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-paper px-4 py-4">
            {messages.map((message) => {
              const text = message.parts.flatMap((part) => (part.type === "text" ? [part.text] : []));
              const searching = message.parts.some((part) => isPendingTool(part));
              if (text.length === 0 && !searching) {
                return null;
              }

              return (
                <p
                  key={message.id}
                  className={`max-w-[85%] px-3 py-2 whitespace-pre-wrap ${
                    message.role === "user" ? "ml-auto bg-primary text-white" : "bg-white text-ink shadow-material"
                  }`}
                >
                  {text.join("")}
                  {searching ? <span className="block text-sm text-muted">Ik zoek in het profiel.</span> : null}
                  {busy && message.id === messages.at(-1)?.id && message.role === "assistant" ? (
                    <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary align-middle" aria-hidden="true" />
                  ) : null}
                </p>
              );
            })}
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
              placeholder="Stel een vraag"
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
