'use client'
import { Lock, RotateCcw, ArrowDown, ArrowUp, AlertCircle } from "lucide-react";
import { useFlowStore, getChainLength, MIN_CIPHER_NODES } from "@/store";

export default function Topbar() {
  const { nodes, edges, mode, setMode, reset } = useFlowStore();
  const chainLength = getChainLength(nodes, edges);
  const tooFew = nodes.length > 0 && chainLength < MIN_CIPHER_NODES;

  return (
    <header className="cs-topbar">
      <span className="cs-wordmark">
        <Lock size={14} />
        Cipher<span className="cs-wordmark-accent">Stack</span>
      </span>

      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--color-text-subtle)", marginLeft: "var(--spacing-3)" }}>
        Cascade Encryption Builder
      </span>

      <div style={{ flex: 1 }} />

      {tooFew && (
        <span className="cs-badge cs-badge--warn" style={{ gap: "var(--spacing-1)", display: "inline-flex", alignItems: "center" }}>
          <AlertCircle size={10} />
          min 3 nodes
        </span>
      )}

      {chainLength >= MIN_CIPHER_NODES && (
        <span className="cs-badge cs-badge--success">
          {chainLength} linked
        </span>
      )}

      <div className="cs-toolbar-sep" />

      {/* Mode toggle */}
      <div style={{
        display: "flex",
        gap: 2,
        background: "var(--color-surface-1)",
        padding: 2,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
      }}>
        <button
          className={`cs-btn cs-btn--sm ${mode === "encrypt" ? "cs-btn--primary" : "cs-btn--ghost"}`}
          onClick={() => setMode("encrypt")}
          style={{ gap: "var(--spacing-1)" }}
        >
          <ArrowDown size={11} />
          Encrypt
        </button>
        <button
          className={`cs-btn cs-btn--sm ${mode === "decrypt" ? "cs-btn--primary" : "cs-btn--ghost"}`}
          onClick={() => setMode("decrypt")}
          style={{ gap: "var(--spacing-1)" }}
        >
          <ArrowUp size={11} />
          Decrypt
        </button>
      </div>

      <div className="cs-toolbar-sep" />

      <button
        className="cs-btn cs-btn--ghost cs-btn--sm cs-btn--icon"
        title="Reset canvas"
        onClick={reset}
      >
        <RotateCcw size={14} />
      </button>
    </header>
  );
}
