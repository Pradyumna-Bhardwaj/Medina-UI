import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChatSession } from "../src/hooks/useChatSession";
import type { SendMessageResponse } from "../src/types";

function jsonResponse(body: SendMessageResponse): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("useChatSession", () => {
  it("sends sessionId: null on the first message and stores the returned session", async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        sessionId: "session-1",
        reply: "Hello!",
        expiresAt: "2026-01-01T00:00:00.000Z",
        sessionReset: false,
        actionType: null,
      }),
    );

    const { result } = renderHook(() => useChatSession({ endpoint: "https://example.test/messages", fetchFn }));

    await act(async () => {
      await result.current.sendMessage("hi");
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ sessionId: null, message: "hi" });
    expect(result.current.sessionId).toBe("session-1");
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "hi" });
    expect(result.current.messages[1]).toMatchObject({ role: "assistant", content: "Hello!" });
  });

  it("reuses the stored sessionId on the next message and refreshes the sliding expiry", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          sessionId: "session-1",
          reply: "first",
          expiresAt: "2026-01-01T00:00:00.000Z",
          sessionReset: false,
          actionType: null,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          sessionId: "session-1",
          reply: "second",
          expiresAt: "2026-01-01T00:05:00.000Z",
          sessionReset: false,
          actionType: null,
        }),
      );

    const { result } = renderHook(() => useChatSession({ endpoint: "https://example.test/messages", fetchFn }));

    await act(async () => {
      await result.current.sendMessage("one");
    });
    await act(async () => {
      await result.current.sendMessage("two");
    });

    const [, secondInit] = fetchFn.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(String(secondInit.body))).toEqual({ sessionId: "session-1", message: "two" });
    expect(result.current.expiresAt).toBe("2026-01-01T00:05:00.000Z");
    expect(result.current.messages).toHaveLength(4);
  });

  it("clears history and shows a system notice when sessionReset is true", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          sessionId: "session-1",
          reply: "first",
          expiresAt: "2026-01-01T00:00:00.000Z",
          sessionReset: false,
          actionType: null,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          sessionId: "session-2",
          reply: "fresh start",
          expiresAt: "2026-01-01T00:05:00.000Z",
          sessionReset: true,
          actionType: null,
        }),
      );

    const { result } = renderHook(() => useChatSession({ endpoint: "https://example.test/messages", fetchFn }));

    await act(async () => {
      await result.current.sendMessage("one");
    });
    await act(async () => {
      await result.current.sendMessage("two");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({ role: "system", content: "Started a new conversation" });
    expect(result.current.messages[1]).toMatchObject({ role: "assistant", content: "fresh start" });
    expect(result.current.sessionId).toBe("session-2");
  });

  it("surfaces actionType on the assistant message", async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        sessionId: "session-1",
        reply: "Setting up a transfer",
        expiresAt: "2026-01-01T00:00:00.000Z",
        sessionReset: false,
        actionType: "send_funds",
      }),
    );

    const { result } = renderHook(() => useChatSession({ endpoint: "https://example.test/messages", fetchFn }));

    await act(async () => {
      await result.current.sendMessage("send 10 to bob");
    });

    expect(result.current.messages[1]).toMatchObject({ actionType: "send_funds" });
  });

  it("keeps the optimistic user message and sets error on failure", async () => {
    const fetchFn = vi.fn().mockRejectedValueOnce(new TypeError("network down"));

    const { result } = renderHook(() => useChatSession({ endpoint: "https://example.test/messages", fetchFn }));

    await act(async () => {
      await result.current.sendMessage("hi");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "hi" });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.isLoading).toBe(false);
  });

  it("resetSession clears messages and session id", async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        sessionId: "session-1",
        reply: "hi",
        expiresAt: "2026-01-01T00:00:00.000Z",
        sessionReset: false,
        actionType: null,
      }),
    );

    const { result } = renderHook(() => useChatSession({ endpoint: "https://example.test/messages", fetchFn }));

    await act(async () => {
      await result.current.sendMessage("hi");
    });
    expect(result.current.sessionId).toBe("session-1");

    act(() => {
      result.current.resetSession();
    });

    expect(result.current.sessionId).toBeNull();
    expect(result.current.messages).toHaveLength(0);
  });

  it("ignores blank input and does not call fetch", async () => {
    const fetchFn = vi.fn();
    const { result } = renderHook(() => useChatSession({ endpoint: "https://example.test/messages", fetchFn }));

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(fetchFn).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });
});
