'use client'
import { Trash2, Info, ArrowRight, ArrowLeft, Copy } from "lucide-react";
import { useFlowStore, getCipher, MIN_CIPHER_NODES, getChainLength, formatCipherTextForDisplay, type NodeData } from "@/store";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function IORow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const labelId = `io-label-${label.toLowerCase()}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        id={labelId}
        style={{ fontSize: "0.62rem", color: "var(--color-text-subtle)", letterSpacing: "0.06em", textTransform: "uppercase" }}
      >
        {label}
      </span>
      <div
        className="cs-code-block"
        role="region"
        aria-labelledby={labelId}
        style={{ minHeight: 32, wordBreak: "break-all", fontSize: "0.68rem", lineHeight: 1.6, color: accent ? "var(--color-teal-600)" : undefined }}
      >
        {value || <span aria-label="empty" style={{ opacity: 0.35 }}>—</span>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-3)", padding: "var(--spacing-6) var(--spacing-4)", textAlign: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-lg)", background: "var(--color-surface-1)", border: "1px solid var(--color-border)", display: "grid", placeItems: "center", color: "var(--color-text-subtle)" }}>
        <Info size={16} aria-hidden="true" />
      </div>
      <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", lineHeight: 1.6, margin: 0 }}>
        Click a node to inspect its configuration and intermediate output.
      </p>
    </div>
  );
}

export default function Inspector() {
  const { nodes, edges, selectedNodeId, mode, outputText, intermediates, updateNodeData, updateNodeParam, removeNode } = useFlowStore();
  const chainLength = getChainLength(nodes, edges);
  const pipelineReady = chainLength >= MIN_CIPHER_NODES;
  const node = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const d = node?.data as NodeData | undefined;
  const cipher = d ? getCipher(d.algorithm) : null;
  const inter = node ? intermediates[node.id] : null;

  const ModeIcon = mode === "encrypt" ? ArrowRight : ArrowLeft;
  const modeLabel = mode === "encrypt" ? "encrypt (left to right)" : "decrypt (right to left)";
  const outputSectionLabel = mode === "encrypt" ? "Ciphertext output" : "Recovered plaintext";

  return (
    <aside className="cs-panel" aria-label="Node inspector" style={{ display: "flex", flexDirection: "column" }}>
      <div className="cs-panel-header">
        <span>Inspector</span>
        {d && (
          <span className={`cs-badge cs-badge--${d.category}`} aria-label={`Cipher: ${cipher?.label ?? d.algorithm}`}>
            {cipher?.label ?? d.algorithm}
          </span>
        )}
      </div>

      {/* Node editor — scrollable middle */}
      <div className="cs-panel-body" style={{ flex: 1, overflowY: "auto" }}>
        {!node || !d ? (
          <EmptyState />
        ) : (
          <>
            <div className="cs-field">
              <label className="cs-label" htmlFor="node-label">Label</label>
              <input
                id="node-label"
                className="cs-input"
                value={String(d.label)}
                onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
              />
            </div>

            {cipher?.configFields.map((field) => (
              <div key={field.key} className="cs-field">
                <label className="cs-label" htmlFor={`param-${field.key}`}>{field.label}</label>
                {field.type === "select" ? (
                  <select
                    id={`param-${field.key}`}
                    className="cs-select"
                    value={String(d.params?.[field.key] ?? field.defaultValue)}
                    onChange={(e) => updateNodeParam(node.id, field.key, e.target.value)}
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`param-${field.key}`}
                    className="cs-input"
                    type={field.type}
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder}
                    value={String(d.params?.[field.key] ?? field.defaultValue)}
                    onChange={(e) => updateNodeParam(node.id, field.key, e.target.value)}
                  />
                )}
              </div>
            ))}

            {/* Intermediate I/O */}
            {inter ? (
              <section aria-label="Intermediate input and output" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", paddingTop: "var(--spacing-2)", borderTop: "1px solid var(--color-border)" }}>
                <div className="cs-panel-header" style={{ padding: 0, border: 0, marginBottom: 0 }}>
                  <span>Intermediate I/O</span>
                  <ModeIcon size={12} aria-label={`Direction: ${modeLabel}`} style={{ color: "var(--color-text-subtle)" }} />
                </div>
                <IORow label="Received" value={formatCipherTextForDisplay(inter.input)} />
                <IORow label="Produced" value={formatCipherTextForDisplay(inter.output)} accent />
              </section>
            ) : (
              <div className="cs-alert cs-alert--info" role="status" style={{ fontSize: "0.7rem" }}>
                Enter text in the input panel to see intermediate values.
              </div>
            )}

            <div style={{ marginTop: "auto", paddingTop: "var(--spacing-2)" }}>
              <button
                className="cs-btn cs-btn--danger cs-btn--sm"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => removeNode(node.id)}
                aria-label={`Delete node: ${d.label}`}
              >
                <Trash2 size={12} aria-hidden="true" />
                Delete Node
              </button>
            </div>
          </>
        )}
      </div>

      {/* Final output — only rendered when chain has ≥ MIN_CIPHER_NODES linked nodes */}
      {pipelineReady && (
        <section
          aria-label={outputSectionLabel}
          aria-live="polite"
          aria-atomic="false"
          style={{ borderTop: "1px solid var(--color-border)", padding: "var(--spacing-3) var(--spacing-4)", flexShrink: 0 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                {mode === "encrypt" ? "Ciphertext" : "Plaintext"}
              </span>
              <span className={`cs-badge cs-badge--${mode === "encrypt" ? "hash" : "io"}`} aria-hidden="true">
                {mode === "encrypt" ? "OUT" : "RECOVERED"}
              </span>
            </div>
            {outputText && (
              <button
                className="cs-btn cs-btn--ghost cs-btn--sm cs-btn--icon"
                aria-label="Copy output to clipboard (raw, control characters preserved)"
                title="Copy raw output (control characters preserved)"
                onClick={() => copyToClipboard(outputText)}
              >
                <Copy size={12} aria-hidden="true" />
              </button>
            )}
          </div>
          <div
            className="cs-code-block"
            role="output"
            style={{ minHeight: 52, maxHeight: 120, overflowY: "auto", wordBreak: "break-all", fontSize: "0.7rem", lineHeight: 1.6, color: "var(--color-teal-600)" }}
          >
            {outputText ? formatCipherTextForDisplay(outputText) : <span aria-label="empty" style={{ opacity: 0.35 }}>—</span>}
          </div>
        </section>
      )}
    </aside>
  );
}
