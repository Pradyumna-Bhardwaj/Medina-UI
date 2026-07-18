import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useDraggable, type DraggablePosition } from "../hooks/useDraggable";
import { readPosition, writePosition } from "../storage/position";
import { cx } from "../utils/cx";
import { ChatBubbleIcon } from "./icons";
import { ChatWidget } from "./ChatWidget";
import type { ActionHandler, UseChatSessionOptions } from "../types";

export interface ChatLauncherProps extends UseChatSessionOptions {
  onAction?: ActionHandler;
  /** Class applied to the outer wrapper (bubble + panel). */
  className?: string;
  /** Class applied to the bubble button. */
  bubbleClassName?: string;
  /** Class applied to the expanded panel's container. */
  panelClassName?: string;
  /** Accessible label for the bubble button (it's icon-only). */
  label?: string;
  /** Panel header title. Defaults to "Assistant". */
  title?: string;
  /** Conversation-starter chips shown before the first message. None by default. */
  suggestions?: string[];
  /** localStorage key the dropped position is saved under. */
  positionStorageKey?: string;
  /** Set false to disable remembering the dragged position across visits. */
  persistPosition?: boolean;
  zIndex?: number;
  /** Starting open state. There's only one opening pattern for now — click the bubble. */
  defaultOpen?: boolean;
}

const DEFAULT_POSITION_KEY = "miden-chat-widget-position";
const EDGE_MARGIN = 8;
// Must match the CSS: bubble size/corner-inset, and the breakpoint where the
// panel goes fullscreen (at which point CSS positions it, not this component).
const BUBBLE_SIZE = 56;
const BUBBLE_CORNER_MARGIN = 28;
const MOBILE_BREAKPOINT = 440;

/**
 * Self-contained floating widget: a draggable bubble that expands into the
 * chat panel. This is the one component in the library that owns its own
 * position/z-index — everywhere else (ChatWidget and its children) stays
 * layout-agnostic. Drop this in once; no host-side placement code required.
 */
export function ChatLauncher({
  onAction,
  className,
  bubbleClassName,
  panelClassName,
  label = "Chat",
  title,
  suggestions,
  positionStorageKey = DEFAULT_POSITION_KEY,
  persistPosition = false,
  zIndex = 2147483000,
  defaultOpen = false,
  endpoint,
  fetchFn,
}: ChatLauncherProps) {
  // Only one opening pattern for now: self-managed, click-to-toggle. A
  // controlled open/onOpenChange pair can be added back later if a host
  // ever needs to trigger it from outside the bubble.
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const [seedPosition] = useState<DraggablePosition | null>(() =>
    persistPosition ? readPosition(positionStorageKey) : null,
  );

  const handleDragEnd = useCallback(
    (dropped: DraggablePosition) => {
      if (persistPosition) writePosition(positionStorageKey, dropped);
    },
    [persistPosition, positionStorageKey],
  );

  const { position, isDragging, onPointerDown, wasDragged } = useDraggable({
    initialPosition: seedPosition,
    onDragEnd: handleDragEnd,
  });

  const handleBubbleClick = useCallback(() => {
    if (wasDragged()) return;
    setIsOpen((prev) => !prev);
  }, [wasDragged]);

  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current) return;
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setPanelStyle({});
      return;
    }

    // The bubble may be hidden (display:none) while the panel is open, so its
    // rect can't be measured live — derive it instead from the same position
    // state/CSS-default-corner math the bubble itself renders with.
    const bubbleRect = position
      ? { left: position.x, top: position.y, right: position.x + BUBBLE_SIZE, bottom: position.y + BUBBLE_SIZE }
      : {
          left: window.innerWidth - BUBBLE_CORNER_MARGIN - BUBBLE_SIZE,
          top: window.innerHeight - BUBBLE_CORNER_MARGIN - BUBBLE_SIZE,
          right: window.innerWidth - BUBBLE_CORNER_MARGIN,
          bottom: window.innerHeight - BUBBLE_CORNER_MARGIN,
        };
    const panelRect = panelRef.current.getBoundingClientRect();

    const opensUp = bubbleRect.bottom + panelRect.height + EDGE_MARGIN > window.innerHeight;
    const opensLeft = bubbleRect.left + panelRect.width + EDGE_MARGIN > window.innerWidth;

    const top = opensUp
      ? Math.max(EDGE_MARGIN, bubbleRect.top - panelRect.height - EDGE_MARGIN)
      : Math.min(bubbleRect.bottom + EDGE_MARGIN, window.innerHeight - panelRect.height - EDGE_MARGIN);
    const left = opensLeft
      ? Math.max(EDGE_MARGIN, bubbleRect.right - panelRect.width)
      : Math.min(bubbleRect.left, window.innerWidth - panelRect.width - EDGE_MARGIN);

    setPanelStyle({ position: "fixed", top, left });
  }, [isOpen, position]);

  const bubbleStyle: CSSProperties = position
    ? { position: "fixed", left: position.x, top: position.y }
    : {};

  return (
    <div className={cx("miden-chat-launcher", "miden-chat-theme", className)} style={{ zIndex }}>
      <button
        type="button"
        className={cx(
          "miden-chat-launcher-bubble",
          isOpen && "miden-chat-launcher-bubble--open",
          isDragging && "miden-chat-launcher-bubble--dragging",
          bubbleClassName,
        )}
        style={bubbleStyle}
        onPointerDown={onPointerDown}
        onClick={handleBubbleClick}
        aria-expanded={isOpen}
        aria-label={label}
      >
        <ChatBubbleIcon className="miden-chat-launcher-bubble-icon" />
      </button>
      <div
        ref={panelRef}
        className={cx("miden-chat-launcher-panel", isOpen && "miden-chat-launcher-panel--open", panelClassName)}
        style={panelStyle}
        aria-hidden={!isOpen}
      >
        <ChatWidget
          endpoint={endpoint}
          fetchFn={fetchFn}
          onAction={onAction}
          title={title}
          suggestions={suggestions}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
