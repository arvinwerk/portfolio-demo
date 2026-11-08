"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import { recruiterQuestion, visitorDoors, type DoorOpening, type VisitorDoor } from "../domain/visitor-door";
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
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

  const shell = open ? "fixed inset-0 z-40" : "fixed right-4 bottom-4 z-40 sm:right-8 sm:bottom-6";

  return (
    <div className={shell}>
      {open && opening ? <div className="absolute inset-0 bg-ink/60" aria-hidden="true" /> : null}
      {open ? (
        <section
          className={
            opening
              ? "absolute inset-x-3 top-3 bottom-3 z-10 flex flex-col overflow-hidden bg-paper shadow-card sm:inset-y-6 sm:right-6 sm:bottom-24 sm:left-auto sm:w-[min(36rem,calc(100%-3rem))]"
              : "absolute inset-0 z-10 flex flex-col overflow-y-auto border-l-[12px] border-l-primary bg-ink text-white"
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {opening ? (
            <Conversation
              titleId={titleId}
              opening={opening}
              messages={messages}
              busy={busy}
              status={status}
              error={error?.message}
              input={input}
              inputRef={inputRef}
              endRef={endRef}
              onClose={() => setOpen(false)}
              onOtherDoor={otherDoor}
              onInput={setInput}
              onSubmit={submit}
              onStop={() => void stop()}
            />
          ) : (
            <Poster titleId={titleId} doors={doors} firstDoorRef={firstDoorRef} onClose={() => setOpen(false)} onChoose={choose} />
          )}
        </section>
      ) : null}
      <button
        type="button"
        className={`${
          open && !opening ? "hidden" : "hidden sm:flex"
        } h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-material ${
          opening ? "absolute right-6 bottom-6 z-50" : ""
        }`}
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

function Poster({
  titleId,
  doors,
  firstDoorRef,
  onClose,
  onChoose,
}: {
  titleId: string;
  doors: readonly DoorOpening[];
  firstDoorRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onChoose: (id: VisitorDoor) => void;
}) {
  return (
    <>
      <header className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8">
        <div>
          <h2 id={titleId} className="font-ui text-xs tracking-[0.28em] text-white uppercase">
            Chat
          </h2>
          <p className="mt-1 text-sm text-white/70">Het model antwoordt vanuit het demoprofiel.</p>
        </div>
        <button type="button" className="border border-white/40 px-4 py-2 text-sm tracking-wide text-white uppercase" onClick={onClose}>
          Sluiten
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative flex flex-col justify-end overflow-hidden px-6 py-8 sm:px-10 lg:w-[46%] lg:py-12">
          <p className="font-ui text-[11px] tracking-[0.28em] text-primary uppercase">Drie deuren</p>
          <p className="mt-4 font-display text-5xl leading-[0.86] text-white sm:text-7xl lg:text-8xl">
            Hoe kom je <br /> hier binnen?
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col border-t border-white/15 lg:border-t-0 lg:border-l" role="group" aria-label="Hoe kom je hier binnen?">
          {doors.map((item, index) => (
            <button
              key={item.id}
              ref={index === 0 ? firstDoorRef : undefined}
              type="button"
              className="group flex flex-1 flex-col justify-end border-t border-white/15 px-6 py-4 text-left first:border-t-0 hover:bg-white sm:px-10 sm:py-6"
              aria-label={item.label}
              onClick={() => onChoose(item.id)}
            >
              <span aria-hidden="true" className="font-display text-4xl leading-none text-primary sm:text-5xl">
                0{index + 1}
              </span>
              <span className="mt-2 block font-display text-2xl leading-none text-white group-hover:text-ink sm:mt-3 sm:text-4xl">
                {item.label}
              </span>
              <span className="mt-3 block max-w-sm text-base text-white/75 group-hover:text-muted">{item.line}</span>
              <span className="mt-4 block font-ui text-[11px] tracking-[0.22em] text-white/50 uppercase group-hover:text-primary">
                {item.hint}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Conversation({
  titleId,
  opening,
  messages,
  busy,
  status,
  error,
  input,
  inputRef,
  endRef,
  onClose,
  onOtherDoor,
  onInput,
  onSubmit,
  onStop,
}: {
  titleId: string;
  opening: DoorOpening;
  messages: UIMessage[];
  busy: boolean;
  status: string;
  error: string | undefined;
  input: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  endRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onOtherDoor: () => void;
  onInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
}) {
  const headline = opening.id === "stranger";

  return (
    <>
      <header className="flex items-center justify-between bg-primary px-5 py-4 text-white">
        <div>
          <h2 id={titleId} className="font-display text-lg font-semibold text-white">
            Chat
          </h2>
          <p className="text-xs text-white/75">Het model antwoordt vanuit het demoprofiel.</p>
        </div>
        <button type="button" className="px-2 py-1 text-sm text-white" onClick={onClose}>
          Sluiten
        </button>
      </header>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-ui text-[11px] tracking-[0.22em] text-primary uppercase">{opening.hint}</p>
          <button type="button" className="border border-ink/20 px-3 py-1 text-xs tracking-[0.16em] uppercase" onClick={onOtherDoor}>
            Andere ingang
          </button>
        </div>
        <p className={`font-display leading-[0.95] text-ink ${headline ? "text-3xl" : "text-5xl sm:text-6xl"}`}>{opening.prompt}</p>
        {messages.map((message) => (
          <Message key={message.id} message={message} busy={busy} last={message.id === messages.at(-1)?.id} />
        ))}
        <div ref={endRef} />
      </div>
      <p className="sr-only" aria-live="polite">
        {status === "streaming" ? "Het antwoord komt binnen." : ""}
      </p>
      {error ? <p className="px-5 py-2 text-sm text-primary">{error}</p> : null}
      <form className="flex items-end gap-2 border-t border-ink/10 p-4" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="chat-bericht">
          Bericht
        </label>
        <textarea
          id="chat-bericht"
          ref={inputRef}
          rows={2}
          value={input}
          placeholder={opening.placeholder}
          className="min-h-14 flex-1 resize-none border-2 border-ink/15 px-3 py-2 text-ink outline-none focus:border-primary"
          onChange={(event) => onInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        {/* type="button" zodat Stop niet tijdens de klik in een submit-knop verandert. */}
        {busy ? (
          <button type="button" className="bg-ink px-4 py-3 text-sm text-white" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            className="bg-action px-4 py-3 text-sm font-medium text-white uppercase"
            onClick={(event) => event.currentTarget.form?.requestSubmit()}
          >
            Verstuur
          </button>
        )}
      </form>
    </>
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
