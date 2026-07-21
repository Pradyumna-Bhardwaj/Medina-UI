export { useChatSession } from "./hooks/useChatSession";

export { ChatLauncher } from "./components/ChatLauncher";
export type { ChatLauncherProps, LauncherPosition } from "./components/ChatLauncher";

export { ChatWidget } from "./components/ChatWidget";
export type { ChatWidgetProps } from "./components/ChatWidget";

export { MessageList } from "./components/MessageList";
export type { MessageListProps } from "./components/MessageList";

export { MessageBubble } from "./components/MessageBubble";
export type { MessageBubbleProps } from "./components/MessageBubble";

export { ActionPrompt } from "./components/ActionPrompt";
export type { ActionPromptProps } from "./components/ActionPrompt";

export { ChatInput } from "./components/ChatInput";
export type { ChatInputProps } from "./components/ChatInput";

export { SystemNotice } from "./components/SystemNotice";
export type { SystemNoticeProps } from "./components/SystemNotice";

export { ChatHeader } from "./components/ChatHeader";
export type { ChatHeaderProps } from "./components/ChatHeader";

export { TypingIndicator } from "./components/TypingIndicator";
export type { TypingIndicatorProps } from "./components/TypingIndicator";

export { SuggestionChips } from "./components/SuggestionChips";
export type { SuggestionChipsProps } from "./components/SuggestionChips";

export { getActionLabel } from "./components/ActionPrompt";

export { ChatApiError } from "./api/errors";

export type {
  ActionHandler,
  ActionType,
  ChatMessage,
  ChatRole,
  SendMessageRequest,
  SendMessageResponse,
  UseChatSessionOptions,
  UseChatSessionResult,
} from "./types";
