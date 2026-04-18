'use client'
import { Lock, Key, Hash, Layers, Code2, ArrowRightLeft } from "lucide-react";
import { ALGORITHMS, CATEGORY_GROUPS, type NodeCategory, type AlgorithmDef } from "@/store";

const ICONS: Record<NodeCategory, React.ElementType> = {
  sym:   Lock,
  asym:  Key,
  hash:  Hash,
  kdf:   Layers,
  codec: Code2,
  io:    ArrowRightLeft,
};

function PaletteItem({ algo }: { algo: AlgorithmDef }) {
  const Icon = ICONS[algo.category];

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/cipherstack", algo.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="cs-palette-item" draggable onDragStart={onDragStart}>
      <Icon size={12} />
      <span>{algo.label}</span>
      <span className={`cs-palette-badge cs-badge--${algo.category}`}>
        {algo.badge}
      </span>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="cs-sidebar">
      <div style={{ padding: "var(--spacing-3) var(--spacing-3) var(--spacing-2)", borderBottom: "1px solid var(--color-border)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-text-subtle)", lineHeight: 1.6 }}>
          Drag nodes onto the canvas to build your encryption pipeline.
        </p>
      </div>

      {CATEGORY_GROUPS.map(({ label, category }) => {
        const algos = ALGORITHMS.filter((a) => a.category === category);
        return (
          <div key={category} className="cs-sidebar-section">
            <div className="cs-sidebar-label">{label}</div>
            {algos.map((algo) => (
              <PaletteItem key={algo.id} algo={algo} />
            ))}
          </div>
        );
      })}
    </aside>
  );
}
