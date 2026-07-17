import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface DraggablePosition {
  x: number;
  y: number;
}

export interface UseDraggableOptions {
  /** Starting position. Pass `null` to leave placement to CSS until the first drag. */
  initialPosition: DraggablePosition | null;
  /** Called once a drag gesture ends, with the final clamped position. */
  onDragEnd?: (position: DraggablePosition) => void;
  /** Pointer movement (px) before a gesture counts as a drag rather than a click. */
  threshold?: number;
}

export interface UseDraggableResult {
  /** Current position, or null while no drag has happened yet and none was seeded. */
  position: DraggablePosition | null;
  isDragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  /** True if the gesture that just ended (pointerup) moved past the threshold. */
  wasDragged: () => boolean;
}

interface DragStart {
  pointerX: number;
  pointerY: number;
  originX: number;
  originY: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampToViewport(position: DraggablePosition, size: { width: number; height: number }): DraggablePosition {
  const maxX = Math.max(0, window.innerWidth - size.width);
  const maxY = Math.max(0, window.innerHeight - size.height);
  return { x: clamp(position.x, 0, maxX), y: clamp(position.y, 0, maxY) };
}

export function useDraggable({ initialPosition, onDragEnd, threshold = 5 }: UseDraggableOptions): UseDraggableResult {
  const [position, setPosition] = useState<DraggablePosition | null>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const draggedRef = useRef(false);
  const startRef = useRef<DragStart | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    sizeRef.current = { width: rect.width, height: rect.height };
    startRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    draggedRef.current = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      const dx = moveEvent.clientX - start.pointerX;
      const dy = moveEvent.clientY - start.pointerY;

      if (!draggedRef.current && Math.hypot(dx, dy) >= threshold) {
        draggedRef.current = true;
        setIsDragging(true);
      }

      if (draggedRef.current) {
        const next = clampToViewport({ x: start.originX + dx, y: start.originY + dy }, sizeRef.current);
        setPosition(next);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      startRef.current = null;
      if (draggedRef.current) {
        setIsDragging(false);
        setPosition((current) => {
          if (current) onDragEnd?.(current);
          return current;
        });
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [onDragEnd, threshold]);

  // Re-clamp on resize so the element can't be stranded off-screen.
  useEffect(() => {
    function handleResize() {
      setPosition((current) => (current ? clampToViewport(current, sizeRef.current) : current));
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const wasDragged = useCallback(() => draggedRef.current, []);

  return { position, isDragging, onPointerDown, wasDragged };
}
