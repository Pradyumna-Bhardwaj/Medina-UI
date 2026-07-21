import { useCallback, useRef, useState } from "react";
import { ChatLauncher, type ActionType, type LauncherPosition } from "ai-agent";
import { createMockFetch } from "./mockBackend";

export default function App() {
  const fetchFnRef = useRef<typeof fetch | null>(null);
  if (!fetchFnRef.current) fetchFnRef.current = createMockFetch();

  const [position, setPosition] = useState<LauncherPosition>("bottom-right");

  const handleAction = useCallback((actionType: ActionType) => {
    console.log("[demo] onAction fired:", actionType);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 640 }}>
      <h1>ai-agent demo</h1>
      <p>
        This page has no real backend — <code>ChatLauncher</code> is wired to an in-memory mock via the{" "}
        <code>fetchFn</code> prop. Chat for a few turns to see action buttons appear and cycle, and to see the
        simulated session reset (every 4 turns) show its system notice.
      </p>
      
      <ChatLauncher
        key={position}
        endpoint="mock://messages"
        fetchFn={fetchFnRef.current}
        onAction={handleAction}
        suggestions={["Send funds", "Add a signer", "What is a guardian?"]}
        position= "bottom-right"
      />
    </div>
  );
}
