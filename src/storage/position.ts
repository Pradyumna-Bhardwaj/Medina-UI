export interface WidgetPosition {
  x: number;
  y: number;
}

function isWidgetPosition(value: unknown): value is WidgetPosition {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as WidgetPosition).x === "number" &&
    typeof (value as WidgetPosition).y === "number"
  );
}

export function readPosition(key: string): WidgetPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isWidgetPosition(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writePosition(key: string, position: WidgetPosition): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(position));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — position just won't persist.
  }
}

export function clearPosition(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
