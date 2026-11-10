import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACQUAINTANCE_QUESTION, RECRUITER_PROMPT } from "../domain/visitor-door";

const chat = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  setMessages: vi.fn(),
  stop: vi.fn(),
  status: "ready" as "ready" | "streaming",
  messages: [] as {
    id: string;
    role: "assistant" | "user";
    parts: { type: string; state?: string; text: string }[];
  }[],
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    setMessages: chat.setMessages,
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
    chat.setMessages.mockClear();
    chat.stop.mockClear();
    chat.status = "ready";
    chat.messages = [];
  });

  it("opent op drie deuren en stuurt de woorden van een recruiter", () => {
    render(<ChatWidget />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));

    const dialog = screen.getByRole("dialog", { name: "Chat" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Hoe kom je hier binnen?")).toBeInTheDocument();
    expect(screen.getByText("Het model antwoordt vanuit het demoprofiel.")).toBeInTheDocument();
    expect(screen.getByText("Zeg de stack. Ik zeg of die erin zit.")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Bericht" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ik zoek iemand" }));
    expect(screen.getByText(RECRUITER_PROMPT)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Bericht" }), { target: { value: "Angular" } });
    fireEvent.click(screen.getByRole("button", { name: "Verstuur" }));

    expect(chat.sendMessage).toHaveBeenCalledWith({ text: "Kun je ook Angular?" });
  });

  it("vraagt voor een bekende meteen naar het huidige werk", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));
    fireEvent.click(screen.getByRole("button", { name: "Ik ken Noor" }));

    expect(screen.getByText("Je wilt vast weten waar ik nu werk, en wat ik doe.")).toBeInTheDocument();
    expect(chat.sendMessage).toHaveBeenCalledWith({ text: ACQUAINTANCE_QUESTION });
  });

  it("geeft een onbekende een eerste indruk zonder verzoek", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));
    fireEvent.click(screen.getByRole("button", { name: "Ik liep binnen" }));

    expect(screen.getByText("Noor. Vraag gerust naar werk, opleiding of contact.")).toBeInTheDocument();
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  it("zet een andere ingang terug naar de deuren", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));
    fireEvent.click(screen.getByRole("button", { name: "Ik liep binnen" }));
    fireEvent.click(screen.getByRole("button", { name: "Andere ingang" }));

    expect(screen.getByText("Hoe kom je hier binnen?")).toBeInTheDocument();
    expect(chat.setMessages).toHaveBeenCalledWith([]);
  });

  it("opent de poster over de pagina en houdt het gesprek daarboven", () => {
    const { container } = render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));

    const poster = screen.getByRole("dialog", { name: "Chat" });
    expect(poster.className).toContain("inset-0");
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Zeg de stack. Ik zeg of die erin zit.")).toBeInTheDocument();
    expect(screen.getByText("Waar ik nu werk, en wat ik doe.")).toBeInTheDocument();
    expect(screen.getByText("Eén blik. Dan ken je me.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chat sluiten" })).toHaveClass("hidden");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(container.querySelector(".bg-ink\\/60")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Ik ken Noor" }));

    const conversation = screen.getByRole("dialog", { name: "Chat" });
    expect(conversation.className).toContain("bg-paper");
    expect(conversation.className).not.toContain("inset-0");
    expect(container.querySelector(".bg-ink\\/60")).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Sluiten" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });

  it("opent de poster als de kop Chat stuurt", () => {
    render(<ChatWidget />);
    fireEvent(window, new Event("portfolio-chat-open"));
    expect(screen.getByRole("dialog", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: "Ik liep binnen" }));

    expect(screen.getByText("Ik zoek in het profiel.")).toBeInTheDocument();
  });

  it("toont een binnenkomend antwoord en kan de stream stoppen", () => {
    chat.status = "streaming";
    chat.messages = [{ id: "answer", role: "assistant", parts: [{ type: "text", text: "Ik ben" }] }];

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Chat openen" }));
    fireEvent.click(screen.getByRole("button", { name: "Ik liep binnen" }));

    expect(screen.getByText("Ik ben")).toBeInTheDocument();
    expect(screen.getByText("Het antwoord komt binnen.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(chat.stop).toHaveBeenCalled();
  });
});
