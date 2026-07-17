import { cx } from "../utils/cx";
import { ActionPrompt, getActionLabel } from "./ActionPrompt";
import type { ActionHandler, ChatMessage } from "../types";

export interface MessageBubbleProps {
  message: ChatMessage;
  onAction?: ActionHandler;
  className?: string;
}

export function MessageBubble({ message, onAction, className }: MessageBubbleProps) {
  const hasAction = Boolean(message.actionType);

  return (
    <div
      className={cx(
        "miden-chat-message",
        `miden-chat-message--${message.role}`,
        hasAction && "miden-chat-message--action",
        className,
      )}
      data-role={message.role}
    >
      {message.actionType && (
        <div className="miden-chat-action-eyebrow">Action · {getActionLabel(message.actionType)}</div>
      )}
      <div className="miden-chat-message-content">{message.content}</div>
      {message.actionType && (
        <ActionPrompt actionType={message.actionType} message={message} onAction={onAction} />
      )}
    </div>
  );
}
