"use client";

import { useState } from "react";
import TypingTest from "@/components/TypingTest";
import PomodoroTimer from "@/components/PomodoroTimer";
import ColorPalette from "@/components/ColorPalette";

const tabs = [
  { id: "typing", label: "⌨️ Typing Test", desc: "Test your speed" },
  { id: "pomodoro", label: "🍅 Pomodoro", desc: "Focus timer" },
  { id: "colors", label: "🎨 Color Palette", desc: "Generate schemes" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Home() {
  const [active, setActive] = useState<TabId>("typing");

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-[var(--accent-light)]">⚡</span> Playground
          </h1>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            v1.0
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-white/[0.08] px-6">
        <div className="max-w-5xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                px-5 py-3 text-sm font-medium rounded-t-lg transition-all relative
                ${
                  active === tab.id
                    ? "text-white bg-white/[0.06]"
                    : "text-[var(--text-muted)] hover:text-white/70 hover:bg-white/[0.03]"
                }
              `}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              {active === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--accent)] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto animate-fade-in" key={active}>
          {active === "typing" && <TypingTest />}
          {active === "pomodoro" && <PomodoroTimer />}
          {active === "colors" && <ColorPalette />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-6 py-4 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          Built with Next.js + Tailwind •{" "}
          <a
            href="https://github.com/Alifanethotspot"
            target="_blank"
            className="text-[var(--accent-light)] hover:underline"
          >
            @Alifanethotspot
          </a>
        </p>
      </footer>
    </main>
  );
}
