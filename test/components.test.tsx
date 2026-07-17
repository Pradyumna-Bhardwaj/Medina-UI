import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActionPrompt } from "../src/components/ActionPrompt";
import { ChatInput } from "../src/components/ChatInput";
import type { ChatMessage } from "../src/types";

const message: ChatMessage = {
  id: "m1",
  role: "assistant",
  content: "I can help with that.",
  actionType: "send_funds",
  createdAt: new Date().toISOString(),
};

describe("ActionPrompt", () => {
  it("does not call onAction on render", () => {
    const onAction = vi.fn();
    render(<ActionPrompt actionType="send_funds" message={message} onAction={onAction} />);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("calls onAction with the actionType and message only when clicked", async () => {
    const onAction = vi.fn();
    render(<ActionPrompt actionType="send_funds" message={message} onAction={onAction} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("send_funds", message);
  });
});

describe("ChatInput", () => {
  it("calls onSend with trimmed text and clears the field", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "  hello  ");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).toHaveBeenCalledWith("hello");
    expect(input).toHaveValue("");
  });

  it("disables the input and send button while loading", () => {
    render(<ChatInput onSend={vi.fn()} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("does not submit blank input", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
