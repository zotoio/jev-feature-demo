import type { ReactNode } from "react";

export type TabId = "session" | "playground" | "scenarios" | "raw";

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
  modeLabel: string;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "session", label: "Session" },
  { id: "playground", label: "Playground" },
  { id: "scenarios", label: "Scenarios" },
  { id: "raw", label: "Raw / Advanced" },
];

export function Layout({ activeTab, onTabChange, children, modeLabel }: LayoutProps) {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="app-header">
        <div>
          <h1>Jev Playground</h1>
          <p>Typesafe System One — explorer for Noul, Choice, Score, gates, and fixtures.</p>
        </div>
        <div className="mode-pill" role="status" aria-live="polite">
          <span className="visually-hidden">Current mode: </span>
          {modeLabel}
        </div>
      </header>

      <nav className="tab-nav" aria-label="Main navigation">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "active" : ""}
            aria-current={activeTab === tab.id ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="app-main">{children}</main>

      <footer className="app-footer">
        <p>
          Jev proposes; your code promotes. Keys stay on localhost — never auto-execute side effects.
        </p>
      </footer>
    </div>
  );
}
