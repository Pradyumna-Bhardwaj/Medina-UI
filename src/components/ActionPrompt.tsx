import { cx } from "../utils/cx";
import type { ActionHandler, ActionType, ChatMessage } from "../types";

const DEFAULT_LABELS: Record<ActionType, string> = {
  send_funds: "Send funds",
  receive_funds: "Receive funds",
  add_signer: "Add signer",
  remove_signer: "Remove signer",
  change_threshold: "Change threshold",
};

export function getActionLabel(actionType: ActionType): string {
  return DEFAULT_LABELS[actionType];
}

export interface ActionPromptProps {
  actionType: ActionType;
  message: ChatMessage;
  onAction?: ActionHandler;
  className?: string;
  /** Override the default human-readable label for the action button. */
  label?: string;
}

export function ActionPrompt({ actionType, message, onAction, className, label }: ActionPromptProps) {
  return (
    <button
      type="button"
      className={cx("miden-chat-action-prompt", className)}
      onClick={() => onAction?.(actionType, message)}
    >
      {label ?? `Open ${getActionLabel(actionType)}`}
    </button>
  );
}
