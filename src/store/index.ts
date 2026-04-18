import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import {
  executePipeline,
  getCipher,
  CIPHER_DEFS,
  PALETTE_GROUPS,
  formatCipherTextForDisplay,
} from "./ciphers";

export type { CipherDef, ConfigField } from "./ciphers";
export { CIPHER_DEFS, PALETTE_GROUPS, getCipher, formatCipherTextForDisplay };

export type NodeCategory = "sym" | "asym" | "hash" | "kdf" | "codec" | "io";

export type NodeData = {
  label: string;
  algorithm: string;
  category: "sym" | "codec";
  params: Record<string, string>;
  [key: string]: unknown;
};

export type Intermediate = { input: string; output: string };

type PipelineResult = {
  outputText: string;
  intermediates: Record<string, Intermediate>;
};

type FlowStore = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  mode: "encrypt" | "decrypt";
  inputText: string;
  outputText: string;
  intermediates: Record<string, Intermediate>;

  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<NodeData>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  updateNodeParam: (id: string, key: string, value: string) => void;
  setMode: (mode: "encrypt" | "decrypt") => void;
  setInputText: (text: string) => void;
  reset: () => void;
};

export const MIN_CIPHER_NODES = 3;

function pipeline(
  nodes: Node<NodeData>[],
  edges: Edge[],
  inputText: string,
  mode: "encrypt" | "decrypt"
): PipelineResult {
  if (nodes.length < MIN_CIPHER_NODES) {
    return { outputText: "", intermediates: {} };
  }
  const result = executePipeline(
    nodes.map((n) => ({ id: n.id, position: n.position, data: n.data })),
    edges.map((e) => ({ source: e.source, target: e.target })),
    inputText,
    mode
  );
  return { outputText: result.output, intermediates: result.intermediates };
}

const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  mode: "encrypt" as const,
  inputText: "",
  outputText: "",
  intermediates: {},
};

export const useFlowStore = create<FlowStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => {
    const { edges, inputText, mode } = get();
    set({ nodes, ...pipeline(nodes, edges, inputText, mode) });
  },

  setEdges: (edges) => {
    const { nodes, inputText, mode } = get();
    set({ edges, ...pipeline(nodes, edges, inputText, mode) });
  },

  addNode: (node) => {
    const { nodes, edges, inputText, mode } = get();
    const next = [...nodes, node];
    set({ nodes: next, ...pipeline(next, edges, inputText, mode) });
  },

  removeNode: (id) => {
    const { nodes, edges, selectedNodeId, inputText, mode } = get();
    const next = nodes.filter((n) => n.id !== id);
    const nextEdges = edges.filter((e) => e.source !== id && e.target !== id);
    set({
      nodes: next,
      edges: nextEdges,
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
      ...pipeline(next, nextEdges, inputText, mode),
    });
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => {
    const { nodes, edges, inputText, mode } = get();
    const next = nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    );
    set({ nodes: next, ...pipeline(next, edges, inputText, mode) });
  },

  updateNodeParam: (id, key, value) => {
    const { nodes, edges, inputText, mode } = get();
    const next = nodes.map((n) =>
      n.id === id
        ? { ...n, data: { ...n.data, params: { ...n.data.params, [key]: value } } }
        : n
    );
    set({ nodes: next, ...pipeline(next, edges, inputText, mode) });
  },

  setMode: (mode) => {
    const { nodes, edges, inputText } = get();
    set({ mode, ...pipeline(nodes, edges, inputText, mode) });
  },

  setInputText: (inputText) => {
    const { nodes, edges, mode } = get();
    set({ inputText, ...pipeline(nodes, edges, inputText, mode) });
  },

  reset: () => set(initialState),
}));

/** Each node may have at most one outgoing and one incoming edge (simple chain / path). */
export function withinSingleWireDegreeLimit(
  edges: Edge[],
  source: string,
  target: string,
  excludeEdgeId?: string | null
): boolean {
  if (!source || !target || source === target) return false;
  const skip = excludeEdgeId ?? undefined;
  const sourceHasOut = edges.some((e) => e.source === source && e.id !== skip);
  const targetHasIn = edges.some((e) => e.target === target && e.id !== skip);
  return !sourceHasOut && !targetHasIn;
}

export function getChainLength(nodes: Node<NodeData>[], edges: Edge[]): number {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const successors = new Map<string, string>();
  const inDegree = new Map<string, number>();
  for (const n of nodes) inDegree.set(n.id, 0);
  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
    successors.set(e.source, e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }
  const head = nodes.find((n) => inDegree.get(n.id) === 0 && successors.has(n.id));
  if (!head) return 0;
  let count = 0;
  let cur: string | undefined = head.id;
  const visited = new Set<string>();
  while (cur && !visited.has(cur)) {
    visited.add(cur);
    count++;
    cur = successors.get(cur);
  }
  return count;
}

export function makeNodeDefaults(algorithmId: string): { params: Record<string, string> } {
  const cipher = getCipher(algorithmId);
  const params: Record<string, string> = {};
  cipher?.configFields.forEach((f) => { params[f.key] = f.defaultValue; });
  return { params };
}
