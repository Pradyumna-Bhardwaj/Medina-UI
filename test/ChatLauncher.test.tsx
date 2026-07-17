import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatLauncher } from "../src/components/ChatLauncher";

// The pointermove/pointerup handlers are plain `window.addEventListener` calls the
// hook attaches itself (not React props), so dispatching them natively is correct —
// but since that's outside React's own event system, the resulting state update
// (and the onDragEnd -> writePosition call it triggers) needs an explicit act()
// to guarantee it's flushed before the next assertion runs.
function firePointer(
  target: EventTarget,
  type: "pointerdown" | "pointermove" | "pointerup",
  { clientX, clientY, pointerId = 1 }: { clientX: number; clientY: number; pointerId?: number },
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { clientX, clientY, pointerId, button: 0 });
  act(() => {
    target.dispatchEvent(event);
  });
}

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

beforeEach(() => {
  window.localStorage.clear();
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 800 });
  Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 600 });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 100,
    y: 100,
    left: 100,
    top: 100,
    right: 156,
    bottom: 156,
    width: 56,
    height: 56,
    toJSON() {
      return {};
    },
  });
});

describe("ChatLauncher", () => {
  it("opens the panel on a plain click", () => {
    render(<ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} />);
    const bubble = screen.getByRole("button", { name: "Chat" });
    fireEvent.click(bubble);
    expect(bubble).toHaveAttribute("aria-expanded", "true");
  });

  it("does not toggle open when the bubble is dragged", () => {
    render(<ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} />);
    const bubble = screen.getByRole("button", { name: "Chat" });

    firePointer(bubble, "pointerdown", { clientX: 128, clientY: 128 });
    firePointer(window, "pointermove", { clientX: 200, clientY: 200 });
    firePointer(window, "pointerup", { clientX: 200, clientY: 200 });
    fireEvent.click(bubble);

    expect(bubble).toHaveAttribute("aria-expanded", "false");
  });

  it("persists the dropped position and restores it on remount", () => {
    const { unmount } = render(
      <ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} positionStorageKey="test-pos" />,
    );
    const bubble = screen.getByRole("button", { name: "Chat" });

    firePointer(bubble, "pointerdown", { clientX: 128, clientY: 128 });
    firePointer(window, "pointermove", { clientX: 228, clientY: 178 });
    firePointer(window, "pointerup", { clientX: 228, clientY: 178 });

    expect(window.localStorage.getItem("test-pos")).toBe(JSON.stringify({ x: 200, y: 150 }));

    unmount();
    render(
      <ChatLauncher endpoint="https://example.test/messages" fetchFn={mockFetchOk()} positionStorageKey="test-pos" />,
    );
    const restoredBubble = screen.getByRole("button", { name: "Chat" });
    expect(restoredBubble).toHaveStyle({ left: "200px", top: "150px" });
  });

  it("supports controlled open state via the open/onOpenChange props", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ChatLauncher
        endpoint="https://example.test/messages"
        fetchFn={mockFetchOk()}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    const bubble = screen.getByRole("button", { name: "Chat" });
    fireEvent.click(bubble);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(bubble).toHaveAttribute("aria-expanded", "false");

    rerender(
      <ChatLauncher
        endpoint="https://example.test/messages"
        fetchFn={mockFetchOk()}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Chat" })).toHaveAttribute("aria-expanded", "true");
  });
});
