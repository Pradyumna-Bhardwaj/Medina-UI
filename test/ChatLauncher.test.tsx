import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatLauncher } from "../src/components/ChatLauncher";

function mockFetchOk(): typeof fetch {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        sessionId: "s1",
        reply: "hi",
        expiresAt: "2026-01-01T00:00:00.000Z",
        sessionReset: false,
        actionType: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ),
  );
}

describe("ChatLauncher", () => {
  it("opens the panel on click and closes again on a second click", () => {
    render(<ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} />);
    const bubble = screen.getByRole("button", { name: "Chat" });

    fireEvent.click(bubble);
    expect(bubble).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(bubble);
    expect(bubble).toHaveAttribute("aria-expanded", "false");
  });

  it("closes via the panel's header close button", () => {
    render(<ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} />);
    const bubble = screen.getByRole("button", { name: "Chat" });

    fireEvent.click(bubble);
    expect(bubble).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(bubble).toHaveAttribute("aria-expanded", "false");
  });

  it("defaults to the bottom-right corner", () => {
    render(<ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} />);
    const bubble = screen.getByRole("button", { name: "Chat" });
    expect(bubble).toHaveClass("miden-chat-launcher-bubble--bottom-right");
  });

  it.each(["top-left", "top-right", "bottom-left", "bottom-right"] as const)(
    "applies the %s position class to both the bubble and the panel",
    (position) => {
      const { container } = render(
        <ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} position={position} />,
      );
      const bubble = screen.getByRole("button", { name: "Chat" });
      const panel = container.querySelector(".miden-chat-launcher-panel");

      expect(bubble).toHaveClass(`miden-chat-launcher-bubble--${position}`);
      expect(panel).toHaveClass(`miden-chat-launcher-panel--${position}`);
    },
  );
});
