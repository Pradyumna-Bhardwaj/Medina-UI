/**
 * The five actions the backend can suggest after classifying a message.
 * This library only ever reports one of these via `onAction` — it never
 * decides what the action actually does.
 */
export type ActionType =
  | "send_funds"
  | "receive_funds"
  | "add_signer"
  | "remove_signer"
  | "change_threshold";

/**
 * Who a message is "from". `system` is reserved for the one client-generated
 * message: the "Started a new conversation" notice shown on a session reset.
 */
export type ChatRole = "user" | "assistant" | "system";

/**
 * A single message in the visible conversation. This is built up entirely on
 * the client, message by message — the backend only ever returns one `reply`
 * string per request, never a full transcript.
 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** Set only on an assistant message the backend wants to surface an action button for. */
  actionType?: ActionType;
  createdAt: string;
}

/**
 * The request body sent to the backend on every message. `sessionId` is
 * `null` only for the first message of a fresh session — the backend mints
 * one in its response, and every message after that should send it back.
 */
export interface SendMessageRequest {
  sessionId: string | null;
  message: string;
}

/**
 * The response body the backend sends back for a single message. This is
 * the entire wire contract of this library — one request in, one reply out.
 */
export interface SendMessageResponse {
  sessionId: string;
  reply: string;
  /** ISO 8601. Informational only — this library never runs its own expiry timer. */
  expiresAt: string;
  /** True when the `sessionId` sent in the request was missing/expired and the backend silently started a new session instead. */
  sessionReset: boolean;
  actionType: ActionType | null;
}

/** Config passed into `useChatSession` (and, through it, `ChatWidget`/`ChatLauncher`) for where and how to talk to the backend. */
export interface UseChatSessionOptions {
  /** Full URL to POST messages to. Owned by the host app — never hardcoded in this library. */
  endpoint: string;
  /** Injectable transport, used by tests and the demo's mock backend. Defaults to global fetch. */
  fetchFn?: typeof fetch;
}

/** Everything `useChatSession` hands back to a UI: the current state, plus the two actions that can change it. */
export interface UseChatSessionResult {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sessionId: string | null;
  expiresAt: string | null;
  sendMessage: (text: string) => Promise<void>;
  /** Clears the in-memory session and messages, so the next `sendMessage` starts a brand-new conversation. */
  resetSession: () => void;
}

/** Shape of the `onAction` callback a host app passes in to react to a suggested action. */
export interface ActionHandler {
  (actionType: ActionType, message: ChatMessage): void;
}
