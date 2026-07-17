import { cx } from "../utils/cx";

export interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cx("miden-chat-message", "miden-chat-message--assistant", className)} role="status" aria-label="Assistant is typing">
      <div className="miden-chat-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
