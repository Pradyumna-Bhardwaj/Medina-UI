export type ActionType =
  | "send_funds"
  | "receive_funds"
  | "add_signer"
  | "remove_signer"
  | "change_threshold";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  actionType?: ActionType;
  createdAt: string;
}

export interface SendMessageRequest {
  sessionId: string | null;
  message: string;
}

export interface SendMessageResponse {
  sessionId: string;
  reply: string;
  expiresAt: string;
  sessionReset: boolean;
  actionType: ActionType | null;
}

export interface UseChatSessionOptions {
  /** Full URL to POST messages to. Owned by the host app — never hardcoded in this library. */
  endpoint: string;
  /** Injectable transport, used by tests and the demo's mock backend. Defaults to global fetch. */
  fetchFn?: typeof fetch;
}

export interface UseChatSessionResult {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sessionId: string | null;
  expiresAt: string | null;
  sendMessage: (text: string) => Promise<void>;
  resetSession: () => void;
}

export interface ActionHandler {
  (actionType: ActionType, message: ChatMessage): void;
}
