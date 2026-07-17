import { cx } from "../utils/cx";
import type { ChatMessage } from "../types";

export interface SystemNoticeProps {
  message: ChatMessage;
  className?: string;
}

export function SystemNotice({ message, className }: SystemNoticeProps) {
  return (
    <div className={cx("miden-chat-system-notice", className)} role="status">
      {message.content}
    </div>
  );
}
