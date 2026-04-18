'use client'
import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Lock, Key, Hash, Layers, Code2, ArrowRightLeft } from "lucide-react";
import type { NodeCategory, NodeData } from "@/store";

const ICONS: Record<NodeCategory, React.ElementType> = {
  sym:   Lock,
  asym:  Key,
  hash:  Hash,
  kdf:   Layers,
  codec: Code2,
  io:    ArrowRightLeft,
};

const BADGES: Record<NodeCategory, string> = {
  sym:   "SYM",
  asym:  "ASYM",
  hash:  "HASH",
  kdf:   "KDF",
  codec: "ENC",
  io:    "I/O",
};

const handleBase: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  border: "2px solid var(--color-surface)",
};

function CipherNode({ data, selected }: NodeProps) {
  const d = data as NodeData;
  const category = d.category ?? "io";
  const Icon = ICONS[category];

  return (
    <div
      className={`cs-node cs-node--${category}${selected ? " cs-node--selected" : ""}`}
      style={{ position: "relative", minWidth: 180 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ ...handleBase, left: -6, background: "var(--color-border-strong)" }}
      />

      <div className="cs-node-header">
        <div className="cs-node-icon">
          <Icon size={11} />
        </div>
        <span className="cs-node-title">{d.label}</span>
        <span className={`cs-badge cs-badge--${category}`}>
          {BADGES[category]}
        </span>
      </div>

      <div className="cs-node-body">
        <span style={{ fontSize: "0.65rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-mono)" }}>
          {d.algorithm}
        </span>
        {d.key && (
          <span style={{ fontSize: "0.65rem", color: "var(--color-cipher-400)", fontFamily: "var(--font-mono)" }}>
            key: {String(d.key).slice(0, 8)}•••
          </span>
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
