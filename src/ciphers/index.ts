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
  edges: { source: string; target: string }[],
  input: string,
  mode: "encrypt" | "decrypt"
): { intermediates: Record<string, { input: string; output: string }>; output: string } {
  // Build adjacency from edges
  const successors = new Map<string, string>();
  const inDegree = new Map<string, number>();
  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const n of nodes) inDegree.set(n.id, 0);
  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
    successors.set(e.source, e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  // Find chain head: in-degree 0 AND has an outgoing edge (not a lone dangling node)
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const head = nodes.find((n) => inDegree.get(n.id) === 0 && successors.has(n.id));

  // Walk the linked chain from head
  const chain: typeof nodes = [];
  if (head) {
    let cur: string | undefined = head.id;
    const visited = new Set<string>();
    while (cur && !visited.has(cur)) {
      visited.add(cur);
      const node = nodeMap.get(cur);
      if (node) chain.push(node);
      cur = successors.get(cur);
    }
  }

  if (mode === "decrypt") chain.reverse();

  const intermediates: Record<string, { input: string; output: string }> = {};
  let current = input;

  for (const node of chain) {
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
