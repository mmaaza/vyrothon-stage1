'use client'
import { Lock, Code2 } from "lucide-react";
import { CIPHER_DEFS, PALETTE_GROUPS, useFlowStore, type CipherDef } from "@/store";

const ICONS = { sym: Lock, codec: Code2 } as const;

function PaletteItem({ def }: { def: CipherDef }) {
  const Icon = ICONS[def.category];

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/cipherstack", def.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="cs-palette-item"
      draggable
      onDragStart={onDragStart}
      title={def.description}
    >
      <Icon size={12} />
      <span>{def.label}</span>
      <span className={`cs-palette-badge cs-badge--${def.category}`}>{def.badge}</span>
    </div>
  );
}

export default function Sidebar() {
  const { inputText, setInputText, mode } = useFlowStore();

  return (
    <aside className="cs-sidebar">
      {/* Plaintext / ciphertext input */}
      <div className="cs-sidebar-section" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--spacing-3)" }}>
        <div className="cs-sidebar-label">
          {mode === "encrypt" ? "Plaintext Input" : "Ciphertext Input"}
        </div>
        <textarea
          className="cs-textarea nodrag"
          placeholder={mode === "encrypt" ? "Enter plaintext…" : "Enter ciphertext…"}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ minHeight: 80, fontSize: "0.75rem" }}
        />
      </div>

      {/* Cipher palette */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="cs-sidebar-section" style={{ paddingBottom: 0 }}>
          <div className="cs-sidebar-label">Cipher Nodes</div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--color-text-subtle)", lineHeight: 1.6, paddingInline: "var(--spacing-1)", marginBottom: "var(--spacing-2)" }}>
            Drag onto canvas · min 3 for valid pipeline
          </p>
        </div>

        {PALETTE_GROUPS.map(({ label, ids }) => {
          const defs = ids.map((id) => CIPHER_DEFS.find((c) => c.id === id)!).filter(Boolean);
          return (
            <div key={label} className="cs-sidebar-section" style={{ paddingTop: "var(--spacing-2)" }}>
              <div className="cs-sidebar-label">{label}</div>
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
