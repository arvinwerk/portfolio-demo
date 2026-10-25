import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WELCOME_TEXT } from "@/lib/chat/welcome";

const chat = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  stop: vi.fn(),
  status: "ready" as "ready" | "streaming",
  messages: [
    {
      id: "welcome",
      role: "assistant" as const,
      parts: [{ type: "text", state: undefined, text: "" }],
    },
  ] as {
    id: string;
    role: "assistant" | "user";
    parts: { type: string; state?: string; text: string }[];
  }[],
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    stop: chat.stop,
    status: chat.status,
    error: undefined,
  }),
}));

import { ChatWidget } from "./chat-widget";

describe("ChatWidget", () => {
  beforeEach(() => {
    cleanup();
    chat.sendMessage.mockClear();
    chat.stop.mockClear();
    chat.status = "ready";
    chat.messages = [
      {
        id: "welcome",
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_TEXT }],
      },
    ];
  });

  it("opent het dialoog en stuurt een bericht", () => {
    render(<ChatWidget />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));

    expect(screen.getByRole("dialog", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByText(WELCOME_TEXT)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Bericht" }), { target: { value: "Wie ben je?" } });
    fireEvent.click(screen.getByRole("button", { name: "Verstuur" }));

    expect(chat.sendMessage).toHaveBeenCalledWith({ text: "Wie ben je?" });
  });

  it("toont dat het profiel wordt doorzocht", () => {
    chat.status = "streaming";
    chat.messages = [
      {
        id: "lookup",
        role: "assistant",
        parts: [{ type: "tool-searchProfile", state: "input-available", text: "" }],
      },
    ];

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));

    expect(screen.getByText("Ik zoek in het profiel.")).toBeInTheDocument();
  });

  it("toont een binnenkomend antwoord en kan de stream stoppen", () => {
    chat.status = "streaming";
    chat.messages = [
      ...chat.messages,
      { id: "answer", role: "assistant", parts: [{ type: "text", text: "Ik ben" }] },
    ];

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));

    expect(screen.getByText("Ik ben")).toBeInTheDocument();
    expect(screen.getByText("Het antwoord komt binnen.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(chat.stop).toHaveBeenCalled();
  });
});
