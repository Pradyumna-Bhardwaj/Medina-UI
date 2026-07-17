import { useChatSession } from "../hooks/useChatSession";
import { cx } from "../utils/cx";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { SuggestionChips } from "./SuggestionChips";
import type { ActionHandler, UseChatSessionOptions } from "../types";

export interface ChatWidgetProps extends UseChatSessionOptions {
  onAction?: ActionHandler;
  className?: string;
  /** Header title. Defaults to "Assistant" — override for your own branding. */
  title?: string;
  /** Shows a close button in the header when provided. Omit for standalone/inline use with nothing to close to. */
  onClose?: () => void;
  /**
   * Conversation-starter chips shown only before the first message is sent.
   * No defaults are provided — supply your own, host-specific starters if you want this.
   */
  suggestions?: string[];
}

/**
 * The chat panel itself — header + message list + input, wired to `useChatSession`.
 * Deliberately layout-agnostic: it fills its parent container and never sets
 * its own position, so a host can place it however it needs to (inline,
 * inside a modal, etc). See `ChatLauncher` for the self-positioning,
 * draggable floating widget built on top of this.
 */
export function ChatWidget({
  onAction,
  className,
  title,
  onClose,
  suggestions = [],
  endpoint,
  fetchFn,
}: ChatWidgetProps) {
  const { messages, isLoading, error, sendMessage } = useChatSession({ endpoint, fetchFn });

  return (
    <div className={cx("miden-chat-widget", "miden-chat-theme", className)}>
      <ChatHeader title={title} onClose={onClose} />
      <MessageList messages={messages} onAction={onAction} isLoading={isLoading} />
      {messages.length === 0 && <SuggestionChips suggestions={suggestions} onSelect={sendMessage} />}
      {error && (
        <div className="miden-chat-error" role="alert">
          {error.message}
        </div>
      )}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
