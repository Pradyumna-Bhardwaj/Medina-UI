import type { ActionType, SendMessageRequest, SendMessageResponse } from "ai-agent";

// Stands in for the real backend so the demo works with no server at all.
// Reuses the same `fetchFn` injection seam the library exposes for tests.

const ACTION_CYCLE: Array<ActionType | null> = [
  null,
  "send_funds",
  null,
  "receive_funds",
  "add_signer",
  "remove_signer",
  "change_threshold",
];

const REPLY_TEXT: Record<ActionType | "default", string> = {
  default: "Hi! I can help you send or receive funds, manage signers, or adjust your threshold — what would you like to do?",
  send_funds: "Looks like you'd like to send funds. I've prepared that action for you below.",
  receive_funds: "Here's how to receive funds into this wallet.",
  add_signer: "I can help add a new signer to this multisig.",
  remove_signer: "I can help remove a signer from this multisig.",
  change_threshold: "I can help update the signing threshold for this wallet.",
};

const EXPIRE_AFTER_TURNS = 4;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A `fetch`-shaped mock: simulates latency, session turns, and a periodic sessionReset. */
export function createMockFetch(): typeof fetch {
  const sessions = new Map<string, number>();
  let counter = 0;

  return async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    await wait(400 + Math.random() * 400);

    const body = JSON.parse(String(init?.body ?? "{}")) as SendMessageRequest;
    const sentId = body.sessionId;
    const hadKnownSession = sentId !== null && sessions.has(sentId);
    const sessionReset = sentId !== null && !hadKnownSession;

    const sessionId = hadKnownSession ? sentId! : `mock-${++counter}`;
    const turn = hadKnownSession ? (sessions.get(sessionId) ?? 0) + 1 : 0;

    if (turn >= EXPIRE_AFTER_TURNS) {
      // Simulate expiry: drop it now, so the *next* message with this id looks unknown.
      sessions.delete(sessionId);
    } else {
      sessions.set(sessionId, turn);
    }

    const actionType = ACTION_CYCLE[turn % ACTION_CYCLE.length] ?? null;
    const reply = actionType ? REPLY_TEXT[actionType] : REPLY_TEXT.default;

    const payload: SendMessageResponse = {
      sessionId,
      reply: sessionReset ? `Welcome back! ${reply}` : reply,
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      sessionReset,
      actionType,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}
