import { useCallback, useRef } from "react";
import { ChatLauncher, type ActionType } from "ai-agent";
import { createMockFetch } from "./mockBackend";

export default function App() {
  const fetchFnRef = useRef<typeof fetch | null>(null);
  if (!fetchFnRef.current) fetchFnRef.current = createMockFetch();

  const handleAction = useCallback((actionType: ActionType) => {
    console.log("[demo] onAction fired:", actionType);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 640 }}>
      <h1>ai-agent demo</h1>
      <p>
        This page has no real backend — <code>ChatLauncher</code> is wired to an in-memory mock via the{" "}
        <code>fetchFn</code> prop. Drag the bubble anywhere on screen and reload to confirm it remembers where you
        left it. Chat for a few turns to see action buttons appear and cycle, and to see the simulated session
        reset (every 4 turns) show its system notice.
      </p>
      <ChatLauncher
        endpoint="mock://messages"
        fetchFn={fetchFnRef.current}
        onAction={handleAction}
        suggestions={["Send funds", "Add a signer", "What is a guardian?"]}
      />
    </div>
  );
}
