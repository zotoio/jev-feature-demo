import { useState } from "react";
import { Layout, type TabId } from "./components/Layout.js";
import { PlaygroundPanel } from "./components/PlaygroundPanel.js";
import { RawPanel } from "./components/RawPanel.js";
import { ScenariosPanel } from "./components/ScenariosPanel.js";
import { SessionPanel } from "./components/SessionPanel.js";
import { SessionProvider, useSession } from "./session/SessionContext.js";

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>("playground");
  const session = useSession();

  const modeLabel = session.isLive
    ? `Live · ${session.resolvedModelId}`
    : session.fixtureMode
      ? "Fixture mode"
      : "No API key — fixture fallback";

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} modeLabel={modeLabel}>
      {activeTab === "session" && <SessionPanel />}
      {activeTab === "playground" && <PlaygroundPanel />}
      {activeTab === "scenarios" && <ScenariosPanel />}
      {activeTab === "raw" && <RawPanel />}
    </Layout>
  );
}

export function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
