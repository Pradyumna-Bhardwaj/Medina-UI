import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { cx } from "../utils/cx";
import { SendIcon } from "./icons";

export interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const MAX_TEXTAREA_HEIGHT = 90;

export function ChatInput({ onSend, disabled, className, placeholder = "Ask or type a command…" }: ChatInputProps) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setDraft("");
    requestAnimationFrame(resize);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form className={cx("miden-chat-input", className)} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        rows={1}
        className="miden-chat-input-field"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          resize();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Chat message"
      />
      <button
        type="submit"
        className="miden-chat-input-send"
        disabled={disabled || !draft.trim()}
        aria-label="Send"
      >
        <SendIcon className="miden-chat-input-send-icon" />
      </button>
    </form>
  );
}
