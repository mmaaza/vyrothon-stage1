import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";

export type NodeCategory = "sym" | "asym" | "hash" | "kdf" | "codec" | "io";

export type NodeData = {
  label: string;
  algorithm: string;
  category: NodeCategory;
  key?: string;
  [key: string]: unknown;
};

export type AlgorithmDef = {
  id: string;
  label: string;
  category: NodeCategory;
  badge: string;
  description: string;
};

export const ALGORITHMS: AlgorithmDef[] = [
  { id: "input",    label: "Input",     category: "io",    badge: "I/O",  description: "Pipeline input" },
  { id: "output",   label: "Output",    category: "io",    badge: "I/O",  description: "Pipeline output" },
  { id: "aes-128",  label: "AES-128",   category: "sym",   badge: "SYM",  description: "128-bit AES block cipher" },
  { id: "aes-256",  label: "AES-256",   category: "sym",   badge: "SYM",  description: "256-bit AES block cipher" },
  { id: "chacha20", label: "ChaCha20",  category: "sym",   badge: "SYM",  description: "Stream cipher" },
  { id: "rsa-2048", label: "RSA-2048",  category: "asym",  badge: "ASYM", description: "2048-bit RSA" },
  { id: "ecc-p256", label: "ECC P-256", category: "asym",  badge: "ASYM", description: "Elliptic curve P-256" },
  { id: "sha-256",  label: "SHA-256",   category: "hash",  badge: "HASH", description: "256-bit hash" },
  { id: "sha-512",  label: "SHA-512",   category: "hash",  badge: "HASH", description: "512-bit hash" },
  { id: "blake2b",  label: "Blake2b",   category: "hash",  badge: "HASH", description: "High-speed hash" },
  { id: "pbkdf2",   label: "PBKDF2",    category: "kdf",   badge: "KDF",  description: "Password-based KDF" },
  { id: "argon2id", label: "Argon2id",  category: "kdf",   badge: "KDF",  description: "Memory-hard KDF" },
  { id: "base64",   label: "Base64",    category: "codec", badge: "ENC",  description: "Base64 encoding" },
  { id: "hex",      label: "Hex",       category: "codec", badge: "ENC",  description: "Hex encoding" },
];

export const CATEGORY_GROUPS: { label: string; category: NodeCategory }[] = [
  { label: "I / O",          category: "io" },
  { label: "Symmetric",      category: "sym" },
  { label: "Asymmetric",     category: "asym" },
  { label: "Hash",           category: "hash" },
  { label: "Key Derivation", category: "kdf" },
  { label: "Codec",          category: "codec" },
];

type FlowStore = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;

  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<NodeData>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  reset: () => void;
};

const initialState = { nodes: [], edges: [], selectedNodeId: null };

export const useFlowStore = create<FlowStore>((set) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  reset: () => set(initialState),
}));
