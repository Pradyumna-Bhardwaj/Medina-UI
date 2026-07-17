import { useEffect, useRef } from "react";
import { cx } from "../utils/cx";
import { MessageBubble } from "./MessageBubble";
import { SystemNotice } from "./SystemNotice";
import { TypingIndicator } from "./TypingIndicator";
import type { ActionHandler, ChatMessage } from "../types";

export interface MessageListProps {
  messages: ChatMessage[];
  onAction?: ActionHandler;
  isLoading?: boolean;
  className?: string;
}

export function MessageList({ messages, onAction, isLoading, className }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className={cx("miden-chat-message-list", className)}>
      {messages.map((message) =>
        message.role === "system" ? (
          <SystemNotice key={message.id} message={message} />
        ) : (
          <MessageBubble key={message.id} message={message} onAction={onAction} />
        ),
      )}
      {isLoading && <TypingIndicator />}
    </div>
  );
}
