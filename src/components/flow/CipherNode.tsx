'use client'
import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Lock, Code2 } from "lucide-react";
import { useFlowStore, getCipher, type NodeData } from "@/store";

const ICONS = { sym: Lock, codec: Code2 } as const;
const BADGES = { sym: "SYM", codec: "ENC" } as const;

const handleBase: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  border: "2px solid var(--color-surface)",
};

function CipherNode({ id, data, selected }: NodeProps) {
  const d = data as NodeData;
  const cat = d.category ?? "codec";
  const Icon = ICONS[cat as keyof typeof ICONS] ?? Code2;

  const updateNodeParam = useFlowStore((s) => s.updateNodeParam);
  const intermediate = useFlowStore((s) => s.intermediates[id]);
  const mode = useFlowStore((s) => s.mode);

  const cipher = getCipher(d.algorithm);

  return (
    <div
      className={`cs-node cs-node--${cat}${selected ? " cs-node--selected" : ""}`}
      style={{ position: "relative", minWidth: 210 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ ...handleBase, left: -6, background: "var(--color-border-strong)" }}
      />

      <div className="cs-node-header">
        <div className="cs-node-icon"><Icon size={11} /></div>
        <span className="cs-node-title">{d.label}</span>
        <span className={`cs-badge cs-badge--${cat}`}>
          {BADGES[cat as keyof typeof BADGES] ?? cat}
        </span>
      </div>

      <div className="cs-node-body">
        {cipher?.configFields.length ? (
          cipher.configFields.map((field) => (
            <div key={field.key} className="nodrag cs-field" style={{ gap: 3 }}>
              <label className="cs-label">{field.label}</label>
              {field.type === "select" ? (
                <select
                  className="cs-select nodrag"
                  value={String(d.params?.[field.key] ?? field.defaultValue)}
                  onChange={(e) => updateNodeParam(id, field.key, e.target.value)}
                  style={{ fontSize: "0.72rem", padding: "2px 6px" }}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="cs-input nodrag"
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  placeholder={field.placeholder}
                  value={String(d.params?.[field.key] ?? field.defaultValue)}
                  onChange={(e) => updateNodeParam(id, field.key, e.target.value)}
                  style={{ fontSize: "0.72rem", padding: "2px 6px" }}
                />
              )}
            </div>
          ))
        ) : (
          <span style={{ fontSize: "0.62rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-mono)" }}>
            {cipher?.description ?? "No configuration"}
          </span>
        )}

        {intermediate && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "0.58rem", fontFamily: "var(--font-mono)", color: "var(--color-text-subtle)", display: "block", marginBottom: 2, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {mode === "encrypt" ? "▸ output" : "◂ output"}
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--color-teal-500)", fontFamily: "var(--font-mono)", wordBreak: "break-all", lineHeight: 1.4 }}>
              {intermediate.output
                ? intermediate.output.slice(0, 36) + (intermediate.output.length > 36 ? "…" : "")
                : <span style={{ opacity: 0.4 }}>—</span>}
            </span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ ...handleBase, right: -6, background: "var(--color-cipher-400)" }}
      />
    </div>
  );
}

export default memo(CipherNode);
