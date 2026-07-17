import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDraggable } from "../src/hooks/useDraggable";
import type { PointerEvent as ReactPointerEvent } from "react";

// jsdom in this environment has no PointerEvent constructor, and React's synthetic
// pointer-event plugin doesn't dispatch onPointerDown for a plain `Event` typed
// "pointerdown" (verified separately). So the "down" phase is invoked directly
// against the hook's returned handler with a minimal fake event/target, exactly
// what a real PointerEvent would provide (clientX/clientY + currentTarget.getBoundingClientRect).
// The "move"/"up" phases are real `window` listeners the hook attaches itself via
// addEventListener, so those are exercised with real dispatched events.
function fakePointerDownEvent(clientX: number, clientY: number): ReactPointerEvent<HTMLElement> {
  const target = document.createElement("button");
  target.getBoundingClientRect = () =>
    ({ x: 100, y: 100, left: 100, top: 100, right: 156, bottom: 156, width: 56, height: 56, toJSON: () => ({}) }) as DOMRect;
  return { clientX, clientY, currentTarget: target } as unknown as ReactPointerEvent<HTMLElement>;
}

function firePointer(target: EventTarget, type: "pointermove" | "pointerup", clientX: number, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { clientX, clientY, pointerId: 1 });
  target.dispatchEvent(event);
}

function drag(
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  act(() => {
    onPointerDown(fakePointerDownEvent(from.x, from.y));
  });
  act(() => {
    firePointer(window, "pointermove", to.x, to.y);
  });
  act(() => {
    firePointer(window, "pointerup", to.x, to.y);
  });
}

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 800 });
  Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 600 });
});

describe("useDraggable", () => {
  it("does not move or fire onDragEnd for a movement below the threshold", () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() => useDraggable({ initialPosition: { x: 100, y: 100 }, onDragEnd, threshold: 5 }));

    drag(result.current.onPointerDown, { x: 128, y: 128 }, { x: 130, y: 130 });

    expect(onDragEnd).not.toHaveBeenCalled();
    expect(result.current.position).toEqual({ x: 100, y: 100 });
    expect(result.current.isDragging).toBe(false);
  });

  it("updates position and fires onDragEnd once past the threshold", () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() => useDraggable({ initialPosition: { x: 100, y: 100 }, onDragEnd, threshold: 5 }));

    drag(result.current.onPointerDown, { x: 128, y: 128 }, { x: 178, y: 148 });

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledWith({ x: 150, y: 120 });
    expect(result.current.position).toEqual({ x: 150, y: 120 });
    expect(result.current.isDragging).toBe(false); // false again once the gesture ends
  });

  it("clamps position to the viewport", () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() => useDraggable({ initialPosition: { x: 100, y: 100 }, onDragEnd, threshold: 5 }));

    drag(result.current.onPointerDown, { x: 128, y: 128 }, { x: 5000, y: 5000 });

    // viewport 800x600, bubble 56x56 (from the mocked rect) → max left 744, max top 544
    expect(onDragEnd).toHaveBeenCalledWith({ x: 744, y: 544 });
  });

  it("re-clamps position on window resize", () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() => useDraggable({ initialPosition: { x: 100, y: 100 }, onDragEnd, threshold: 5 }));

    drag(result.current.onPointerDown, { x: 128, y: 128 }, { x: 700, y: 500 });

    act(() => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 400 });
      Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 300 });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.position?.x).toBeLessThanOrEqual(400 - 56);
    expect(result.current.position?.y).toBeLessThanOrEqual(300 - 56);
  });
});
