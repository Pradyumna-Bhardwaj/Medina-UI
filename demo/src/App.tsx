import { useCallback, useState } from "react";
import { ChatLauncher, type ActionType, type LauncherPosition } from "ai-agent";

const BACKEND_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT as string | undefined;

export default function App() {
  const [position, setPosition] = useState<LauncherPosition>("bottom-right");

  const handleAction = useCallback((actionType: ActionType) => {
    console.log("[demo] onAction fired:", actionType);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 640 }}>
      <h1>ai-agent demo</h1>
      {BACKEND_ENDPOINT ? (
        <>
          <p>
            This page talks to the real deployed backend — replies come from OpenAI via the Cloudflare Worker, not a
            mock.
          </p>
          <ChatLauncher
            key={position}
            endpoint={BACKEND_ENDPOINT}
            onAction={handleAction}
            suggestions={["Send funds", "Add a signer", "What is a guardian?"]}
            position="bottom-right"
          />
        </>
      ) : (
        <p>
          Set <code>VITE_CHAT_ENDPOINT</code> in <code>demo/.env.local</code> to your backend URL to try the demo.
        </p>
      )}
    </div>
  );
}
