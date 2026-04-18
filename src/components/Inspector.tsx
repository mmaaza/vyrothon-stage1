'use client'
import { Trash2, Info } from "lucide-react";
import { useFlowStore, type NodeData } from "@/store";

const CATEGORY_LABELS = {
  sym:   "Symmetric Cipher",
  asym:  "Asymmetric Cipher",
  hash:  "Hash Function",
  kdf:   "Key Derivation",
  codec: "Codec",
  io:    "I/O Node",
};

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--spacing-3)",
        padding: "var(--spacing-8) var(--spacing-4)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          display: "grid",
          placeItems: "center",
          color: "var(--color-text-subtle)",
        }}
      >
        <Info size={18} />
      </div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-text-subtle)", lineHeight: 1.6, margin: 0 }}>
        Select a node to inspect and configure it.
      </p>
    </div>
  );
}

export default function Inspector() {
  const { nodes, selectedNodeId, updateNodeData, removeNode } = useFlowStore();
  const node = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const d = node?.data as NodeData | undefined;

  return (
    <aside className="cs-panel">
      <div className="cs-panel-header">
        <span>Inspector</span>
        {d && (
          <span className={`cs-badge cs-badge--${d.category}`}>
            {CATEGORY_LABELS[d.category]}
          </span>
        )}
      </div>

      <div className="cs-panel-body">
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

            <div className="cs-field">
              <label className="cs-label">Algorithm</label>
              <input
                className="cs-input"
                value={String(d.algorithm)}
                readOnly
                style={{ opacity: 0.55, cursor: "default" }}
              />
            </div>

            {d.category !== "io" && (
              <div className="cs-field">
                <label className="cs-label" htmlFor="node-key">Secret Key</label>
                <input
                  id="node-key"
                  className="cs-input"
                  type="password"
                  placeholder="Enter key..."
                  value={String(d.key ?? "")}
                  onChange={(e) => updateNodeData(node.id, { key: e.target.value })}
                />
              </div>
            )}

            <div
              style={{
                marginTop: "var(--spacing-2)",
                padding: "var(--spacing-3)",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-text-subtle)", margin: 0, lineHeight: 1.6 }}>
                ID: <span style={{ color: "var(--color-text-muted)" }}>{node.id}</span>
              </p>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "var(--spacing-4)" }}>
              <button
                className="cs-btn cs-btn--danger cs-btn--sm"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => removeNode(node.id)}
              >
                <Trash2 size={12} />
                Delete Node
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
