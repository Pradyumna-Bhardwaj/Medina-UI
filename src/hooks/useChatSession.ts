import { useCallback, useState } from "react";
import { postMessage } from "../api/client";
import { createId } from "../utils/id";
import type { ChatMessage, UseChatSessionOptions, UseChatSessionResult } from "../types";

function now(): string {
  return new Date().toISOString();
}

/**
 * Encapsulates the /messages session state machine: sends a message, tracks the
 * sliding-expiry session id in memory, and handles the backend's silent
 * session-reset signal. Nothing here is persisted across a refresh — a fresh
 * page load always starts a fresh session by design.
 */
export function useChatSession({ endpoint, fetchFn }: UseChatSessionOptions): UseChatSessionResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);
      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await postMessage(endpoint, { sessionId, message: trimmed }, fetchFn);

        setSessionId(response.sessionId);
        setExpiresAt(response.expiresAt);

        const replyMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: response.reply,
          actionType: response.actionType ?? undefined,
          createdAt: now(),
        };

        if (response.sessionReset) {
          const systemNotice: ChatMessage = {
            id: createId(),
            role: "system",
            content: "Started a new conversation",
            createdAt: now(),
          };
          setMessages([systemNotice, replyMessage]);
        } else {
          setMessages((prev) => [...prev, replyMessage]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to send message"));
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, fetchFn, isLoading, sessionId],
  );

  const resetSession = useCallback(() => {
    setSessionId(null);
    setExpiresAt(null);
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sessionId, expiresAt, sendMessage, resetSession };
}
