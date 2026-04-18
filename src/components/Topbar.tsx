'use client'
import { Lock, RotateCcw, ArrowDown, ArrowUp, AlertCircle } from "lucide-react";
import { useFlowStore, getChainLength, MIN_CIPHER_NODES } from "@/store";

export default function Topbar() {
  const { nodes, edges, mode, setMode, reset } = useFlowStore();
  const chainLength = getChainLength(nodes, edges);
  const tooFew = nodes.length > 0 && chainLength < MIN_CIPHER_NODES;

  return (
    <header className="cs-topbar" role="banner">
      <span className="cs-wordmark" aria-label="CipherStack">
        <Lock size={14} aria-hidden="true" />
        Cipher<span className="cs-wordmark-accent">Stack</span>
      </span>

      <span
        style={{ fontSize: "0.62rem", color: "var(--color-text-subtle)", marginLeft: "var(--spacing-3)" }}
        aria-hidden="true"
      >
        Cascade Encryption Builder
      </span>

      <div style={{ flex: 1 }} />

      <div role="status" aria-live="polite" aria-atomic="true">
        {tooFew && (
          <span className="cs-badge cs-badge--warn" style={{ gap: "var(--spacing-1)", display: "inline-flex", alignItems: "center" }}>
            <AlertCircle size={10} aria-hidden="true" />
            Pipeline needs at least {MIN_CIPHER_NODES} linked nodes
          </span>
        )}
      </div>

      <div role="separator" className="cs-toolbar-sep" aria-orientation="vertical" />

      {/* Mode toggle */}
      <div
        role="group"
        aria-label="Pipeline mode"
        style={{
          display: "flex",
          gap: 2,
          background: "var(--color-surface-1)",
          padding: 2,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
        }}
      >
        <button
          className={`cs-btn cs-btn--sm ${mode === "encrypt" ? "cs-btn--primary" : "cs-btn--ghost"}`}
          onClick={() => setMode("encrypt")}
          aria-pressed={mode === "encrypt"}
          style={{ gap: "var(--spacing-1)" }}
        >
          <ArrowDown size={11} aria-hidden="true" />
          Encrypt
        </button>
        <button
          className={`cs-btn cs-btn--sm ${mode === "decrypt" ? "cs-btn--primary" : "cs-btn--ghost"}`}
          onClick={() => setMode("decrypt")}
          aria-pressed={mode === "decrypt"}
          style={{ gap: "var(--spacing-1)" }}
        >
          <ArrowUp size={11} aria-hidden="true" />
          Decrypt
        </button>
      </div>

      <div role="separator" className="cs-toolbar-sep" aria-orientation="vertical" />

      <button
        className="cs-btn cs-btn--ghost cs-btn--sm cs-btn--icon"
        aria-label="Reset canvas"
        title="Reset canvas"
        onClick={reset}
      >
        <RotateCcw size={14} aria-hidden="true" />
      </button>
    </header>
  );
}
