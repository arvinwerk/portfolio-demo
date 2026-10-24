"use client";

export function ChatLauncher() {
  return (
    <button
      type="button"
      className="bg-primary px-3 py-1.5 text-sm font-medium text-white sm:hidden"
      onClick={() => window.dispatchEvent(new Event("portfolio-chat-open"))}
    >
      Chat
    </button>
  );
}
