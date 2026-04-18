export type { ConfigField, CipherDef } from "./types";

import caesarDef       from "./caesar";
import xorDef          from "./xor";
import vigenereDef     from "./vigenere";
import railFenceDef    from "./railfence";
import substitutionDef from "./substitution";

export const CIPHER_DEFS = [
  caesarDef,
  xorDef,
  vigenereDef,
  railFenceDef,
  substitutionDef,
];

export const PALETTE_GROUPS: { label: string; ids: string[] }[] = [
  { label: "Classical",  ids: ["caesar", "vigenere", "substitution"] },
  { label: "Binary",     ids: ["xor"] },
  { label: "Geometric",  ids: ["railfence"] },
];

export function getCipher(id: string) {
  return CIPHER_DEFS.find((c) => c.id === id);
}

export function executePipeline(
  nodes: { id: string; position: { x: number }; data: { algorithm: string; params: Record<string, string> } }[],
  input: string,
  mode: "encrypt" | "decrypt"
): { intermediates: Record<string, { input: string; output: string }>; output: string } {
  const pipeline = [...nodes].sort((a, b) => a.position.x - b.position.x);
  if (mode === "decrypt") pipeline.reverse();

  const intermediates: Record<string, { input: string; output: string }> = {};
  let current = input;

  for (const node of pipeline) {
    const cipher = getCipher(node.data.algorithm);
    if (!cipher) continue;
    const nodeIn = current;
    current = mode === "encrypt"
      ? cipher.encrypt(current, node.data.params)
      : cipher.decrypt(current, node.data.params);
    intermediates[node.id] = { input: nodeIn, output: current };
  }

  return { intermediates, output: current };
}
