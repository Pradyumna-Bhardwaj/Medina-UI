import { cx } from "../utils/cx";
import { CloseIcon, MarkIcon } from "./icons";

export interface ChatHeaderProps {
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function ChatHeader({ title = "Assistant", onClose, className }: ChatHeaderProps) {
  return (
    <div className={cx("miden-chat-header", className)}>
      <div className="miden-chat-header-mark">
        <MarkIcon className="miden-chat-header-mark-icon" />
      </div>
      <div className="miden-chat-header-title">
        <h1>{title}</h1>
      </div>
      {onClose && (
        <button type="button" className="miden-chat-header-close" onClick={onClose} aria-label="Close">
          <CloseIcon className="miden-chat-header-close-icon" />
        </button>
      )}
    </div>
  );
}
