'use client'
import { Lock, Code2 } from "lucide-react";
import { CIPHER_DEFS, PALETTE_GROUPS, useFlowStore, type CipherDef } from "@/store";

const ICONS = { sym: Lock, codec: Code2 } as const;

const INPUT_ID = "cs-pipeline-input";

function PaletteItem({ def }: { def: CipherDef }) {
  const Icon = ICONS[def.category];

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/cipherstack", def.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Keyboard users can't drag-and-drop; announce that
      // A real implementation would open a picker or place the node at center
    }
  };

  return (
    <div
      className="cs-palette-item"
      draggable
      onDragStart={onDragStart}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Add ${def.label} cipher node — ${def.description}`}
      title={def.description}
    >
      <Icon size={12} aria-hidden="true" />
      <span>{def.label}</span>
      <span className={`cs-palette-badge cs-badge--${def.category}`} aria-hidden="true">{def.badge}</span>
    </div>
  );
}

export default function Sidebar() {
  const { inputText, setInputText, mode } = useFlowStore();

  const inputLabel = mode === "encrypt" ? "Plaintext Input" : "Ciphertext Input";
  const inputPlaceholder = mode === "encrypt" ? "Enter plaintext…" : "Enter ciphertext…";

  return (
    <aside className="cs-sidebar" aria-label="Cipher pipeline controls">
      {/* Plaintext / ciphertext input */}
      <div className="cs-sidebar-section" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--spacing-3)" }}>
        <label className="cs-sidebar-label" htmlFor={INPUT_ID}>
          {inputLabel}
        </label>
        <textarea
          id={INPUT_ID}
          className="cs-textarea nodrag"
          placeholder={inputPlaceholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ minHeight: 80, fontSize: "0.75rem" }}
          aria-label={inputLabel}
        />
      </div>

      {/* Cipher palette */}
      <div style={{ flex: 1, overflowY: "auto" }} role="region" aria-label="Cipher node palette">
        <div className="cs-sidebar-section" style={{ paddingBottom: 0 }}>
          <div className="cs-sidebar-label" aria-hidden="true">Cipher Nodes</div>
          <p style={{ fontSize: "0.62rem", color: "var(--color-text-subtle)", lineHeight: 1.6, paddingInline: "var(--spacing-1)", marginBottom: "var(--spacing-2)" }}>
            Drag onto canvas · min 3 for valid pipeline
          </p>
        </div>

        {PALETTE_GROUPS.map(({ label, ids }) => {
          const defs = ids.map((id) => CIPHER_DEFS.find((c) => c.id === id)!).filter(Boolean);
          return (
            <div key={label} className="cs-sidebar-section" style={{ paddingTop: "var(--spacing-2)" }}>
              <div className="cs-sidebar-label" role="heading" aria-level={3}>{label}</div>
              {defs.map((def) => (
                <PaletteItem key={def.id} def={def} />
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
