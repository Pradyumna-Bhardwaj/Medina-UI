# Medina-ai-agent

Embeddable chat widget for **MidenMultiSig** — a floating chat bubble that talks to a single backend endpoint, renders replies, and surfaces suggested actions back to the host app.

> The package is currently named `ai-agent` as a placeholder. Renaming it later is a one-line change in `package.json` — nothing in the code depends on the string.

## What this is

A standalone, publishable npm package, not an app. It's meant to be installed into the MidenMultiSig coordinator-frontend (or any host app) as a chat client:

- Sends messages to one backend endpoint, renders the conversation, and shows a button when the backend suggests an action (send funds, receive funds, add/remove signer, change threshold).
- Does **not** handle wallet keys, signing, or on-chain calls. It has no idea what "the wallet" is beyond what you tell it via props.
- Does **not** decide what happens when an action is suggested — it reports it via an `onAction` callback and lets the host app decide.
- Makes no assumptions about the host app's routes, file structure, or state — everything it needs (the endpoint URL, an `onAction` handler) is passed in as props.

## Install

```bash
npm install ai-agent
```

Peer dependencies: `react` and `react-dom`, `^18` or `^19`.

## Quick start

```tsx
import { ChatLauncher } from "ai-agent";
import "ai-agent/styles.css";

function App() {
  return (
    <ChatLauncher
      endpoint="https://your-backend.example.com/messages"
      onAction={(actionType, message) => {
        // actionType: "send_funds" | "receive_funds" | "add_signer" | "remove_signer" | "change_threshold"
        // Decide what happens next — open your own modal, navigate, etc.
        console.log("suggested action:", actionType, message);
      }}
    />
  );
}
```

That's it — `ChatLauncher` renders a self-positioning floating bubble (pick a corner with the `position` prop, defaults to bottom-right) that expands into the chat panel. No other wiring required.

## The backend contract

This library talks to exactly one endpoint you provide:

```
POST /messages
  request:  { sessionId: string | null, message: string }
  response: {
    sessionId: string,
    reply: string,
    expiresAt: string,       // ISO 8601, informational — no client-side expiry timer
    sessionReset: boolean,
    actionType:
      | "send_funds"
      | "receive_funds"
      | "add_signer"
      | "remove_signer"
      | "change_threshold"
      | null
  }
```

No auth payload is ever sent — the backend is expected to be IP-whitelisted at the network level.

**Session behavior:**
- Every page refresh starts a brand-new conversation (`sessionId: null` on the first message of a fresh page load) — session id, expiry, and the visible transcript live in memory only, nothing is written to `sessionStorage`/`localStorage` for the chat itself.
- If a response comes back with `sessionReset: true`, the widget clears the visible history, shows a small "Started a new conversation" system note, and renders the reply as the first message of the new session.
- `actionType` is only ever acted on when the user explicitly clicks the action button under a reply — `onAction` never fires automatically just because a message arrived.

Nothing about the widget's own position persists across visits either — the bubble sits in a fixed corner (see `position` below), not a location a user can move.

## Components

### `ChatLauncher` (primary integration)

Self-contained floating widget: a bubble in a fixed corner that expands into the panel, no host-side placement code needed. The bubble stays visible while the panel is open too — clicking it again closes the panel, same as the header's close button.

| Prop | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | — | Full URL to POST messages to. Required. |
| `fetchFn` | `typeof fetch` | `fetch` | Injectable transport — useful for tests or a custom backend client. |
| `onAction` | `(actionType, message) => void` | — | Fires only when the user clicks a surfaced action button. |
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"bottom-right"` | Which screen corner the bubble sits in. The panel opens from that same corner (upward from a bottom corner, downward from a top corner) — plain CSS, no drag, no runtime positioning math. |
| `title` | `string` | `"Assistant"` | Panel header title. |
| `suggestions` | `string[]` | `[]` | Conversation-starter chips shown before the first message. No defaults — supply your own copy. |
| `label` | `string` | `"Chat"` | Accessible label for the (icon-only) bubble button. |
| `className` / `bubbleClassName` / `panelClassName` | `string` | — | Extra classes on the wrapper / bubble / panel. |
| `zIndex` | `number` | `2147483000` | Override if it clashes with other overlays in your app. |
| `defaultOpen` | `boolean` | `false` | Starting open state. There's only one opening pattern for now — click the bubble; a controlled `open`/`onOpenChange` pair may come later if a host needs to trigger it externally. |

### `ChatWidget` (manual placement)

The bare panel — header, messages, input — with no positioning of its own. Fills its parent container. Use this if you want to place the chat inline, in a modal, or in your own custom layout instead of a floating bubble.

Same `endpoint` / `fetchFn` / `onAction` / `title` / `suggestions` / `className` props as above, plus `onClose?: () => void` (shows a close button in the header if provided — `ChatLauncher` wires this to its own close automatically).

### `useChatSession` (fully custom UI)

The state machine underneath both components above, exported standalone for anyone building a custom layout:

```ts
const { messages, isLoading, error, sessionId, expiresAt, sendMessage, resetSession } =
  useChatSession({ endpoint, fetchFn });
```

### Everything else

`MessageList`, `MessageBubble`, `ActionPrompt`, `ChatInput`, `ChatHeader`, `SystemNotice`, `TypingIndicator`, and `SuggestionChips` are all exported individually too, so you can compose your own layout out of the same primitives `ChatWidget` uses internally instead of taking the whole thing as-is.

## Theming

The whole visual theme lives in `ai-agent/styles.css`, scoped under a `.miden-chat-theme` class and driven entirely by prefixed CSS custom properties so it can't leak into or collide with your app's own styles:

| Variable | Default | Used for |
|---|---|---|
| `--miden-chat-accent` | `#e8632a` | Primary accent — bubble, buttons, focus states |
| `--miden-chat-accent-soft` | `#fdeee6` | Accent-tinted backgrounds (action cards, header mark) |
| `--miden-chat-accent-hover` | `#d2551e` | Hover state for accent buttons |
| `--miden-chat-bg` | `#ffffff` | Panel background |
| `--miden-chat-ink` | `#1a1a1a` | Primary text |
| `--miden-chat-ink-soft` | `#6b6b6b` | Secondary text |
| `--miden-chat-ink-faint` | `#9a9a9a` | Placeholder / faint text |
| `--miden-chat-line` | `#ececec` | Light borders |
| `--miden-chat-line-strong` | `#e0e0e0` | Input borders |
| `--miden-chat-user-bubble` | `#f5f5f4` | User message bubble background |
| `--miden-chat-sans` | system font stack | Font family |

Override any of these on your own wrapper element to retheme without touching the library's CSS:

```css
.my-app .miden-chat-theme {
  --miden-chat-accent: #6c5ce7;
}
```

Every element also carries a stable `miden-chat-*` class name if you need to target something CSS variables don't cover.

## Development

```bash
npm install          # installs the library + the demo app (npm workspaces)
npm run demo         # starts the demo at localhost:5173 — a live playground with a mock backend, no real server needed
npm test             # vitest
npm run typecheck    # tsc, covers both src/ and demo/
npm run build        # builds dist/ (ESM + CJS + types + CSS)
```

The `demo/` app isn't published — it's a local-only Vite+React page for visually exercising the widget. It talks to an in-memory mock backend (`demo/src/mockBackend.ts`) via the same `fetchFn` injection point used in tests, so there's nothing to run or configure to try it out.

## Project structure

```
src/
  index.ts              # public exports
  types.ts               # ActionType, ChatMessage, hook option/result types
  api/                    # postMessage client + ChatApiError
  hooks/
    useChatSession.ts      # session state machine
  components/              # ChatLauncher, ChatWidget, and all sub-components
  styles/index.css          # the theme
demo/                     # local dev playground, not published
test/                     # vitest + React Testing Library
```
