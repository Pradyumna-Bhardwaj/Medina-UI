import "@testing-library/jest-dom/vitest";

// This jsdom build has no PointerEvent constructor, which means React's synthetic
// pointer-event plugin never registers onPointerDown/Move/Up listeners at all.
// A minimal polyfill (before any component renders) is enough for React to treat
// pointer events like mouse events for testing purposes.
if (typeof globalThis.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
    }
  }
  // @ts-expect-error -- polyfilling a missing jsdom global for tests only
  globalThis.PointerEvent = PointerEventPolyfill;
}
