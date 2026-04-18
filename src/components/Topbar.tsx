'use client'
import { Lock, Play, RotateCcw } from "lucide-react";
import { useFlowStore } from "@/store";

export default function Topbar() {
  const { nodes, reset } = useFlowStore();
  const nodeCount = nodes.length;

  return (
    <header className="cs-topbar">
      <span className="cs-wordmark">
        <Lock size={14} />
        Cipher<span className="cs-wordmark-accent">Stack</span>
      </span>

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--color-text-subtle)",
          marginLeft: "var(--spacing-3)",
        }}
      >
        Node-Based Cascade Encryption Builder
      </span>

      <div style={{ flex: 1 }} />

      {nodeCount > 0 && (
        <span className="cs-badge cs-badge--io">
          {nodeCount} node{nodeCount !== 1 ? "s" : ""}
        </span>
      )}

      <div className="cs-toolbar-sep" />

      <button
        className="cs-btn cs-btn--ghost cs-btn--sm cs-btn--icon"
        title="Reset canvas"
        onClick={reset}
      >
        <RotateCcw size={14} />
      </button>

      <button
        className="cs-btn cs-btn--primary cs-btn--sm"
        disabled={nodeCount === 0}
      >
        <Play size={12} />
        Run Pipeline
      </button>
    </header>
  );
}
