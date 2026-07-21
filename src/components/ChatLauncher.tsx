import { useCallback, useState } from "react";
import { cx } from "../utils/cx";
import { ChatBubbleIcon } from "./icons";
import { ChatWidget } from "./ChatWidget";
import type { ActionHandler, UseChatSessionOptions } from "../types";

export type LauncherPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

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
  zIndex?: number;
  /** Starting open state. There's only one opening pattern for now — click the bubble. */
  defaultOpen?: boolean;
  /** Which screen corner the bubble sits in, and the panel opens from. Defaults to "bottom-right". */
  position?: LauncherPosition;
}

/**
 * Self-contained floating widget: a bubble in a fixed corner that expands
 * into the chat panel. This is the one component in the library that owns
 * its own position/z-index — everywhere else (ChatWidget and its children)
 * stays layout-agnostic. Drop this in once; no host-side placement code
 * required.
 *
 * The bubble sits in one of four fixed corners (see `position`) rather than
 * being draggable — with a known, fixed corner the panel's placement relative
 * to it is fully determined ahead of time, so it's plain CSS with no runtime
 * measurement, and no edge case where it could end up overlapping the bubble.
 */
export function ChatLauncher({
  onAction,
  className,
  bubbleClassName,
  panelClassName,
  label = "Chat",
  title,
  suggestions,
  zIndex = 2147483000,
  defaultOpen = false,
  position,
  endpoint,
  fetchFn,
}: ChatLauncherProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleBubbleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className={cx("miden-chat-launcher", "miden-chat-theme", className)} style={{ zIndex }}>
      <button
        type="button"
        className={cx(
          "miden-chat-launcher-bubble",
          `miden-chat-launcher-bubble--${position}`,
          bubbleClassName,
        )}
        onClick={handleBubbleClick}
        aria-expanded={isOpen}
        aria-label={label}
      >
        <ChatBubbleIcon className="miden-chat-launcher-bubble-icon" />
      </button>
      <div
        className={cx(
          "miden-chat-launcher-panel",
          `miden-chat-launcher-panel--${position}`,
          isOpen && "miden-chat-launcher-panel--open",
          panelClassName,
        )}
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
