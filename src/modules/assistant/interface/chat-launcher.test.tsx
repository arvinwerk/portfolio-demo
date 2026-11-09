import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatLauncher } from "./chat-launcher";

describe("ChatLauncher", () => {
  it("vraagt de chat om open te gaan", () => {
    const heard = vi.fn();
    window.addEventListener("portfolio-chat-open", heard);
    render(<ChatLauncher />);

    fireEvent.click(screen.getByRole("button", { name: "Chat" }));

    expect(heard).toHaveBeenCalledOnce();
    window.removeEventListener("portfolio-chat-open", heard);
  });
});
