import { ChatApiError } from "./errors";
import type { SendMessageRequest, SendMessageResponse } from "../types";

export async function postMessage(
  endpoint: string,
  body: SendMessageRequest,
  fetchFn: typeof fetch = fetch,
): Promise<SendMessageResponse> {
  const response = await fetchFn(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ChatApiError(`Request to ${endpoint} failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as SendMessageResponse;
}
