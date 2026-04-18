export type ConfigField = {
  key: string;
  label: string;
  type: "text" | "number";
  placeholder?: string;
  min?: number;
  max?: number;
  defaultValue: string;
};

export type CipherDef = {
  id: string;
  label: string;
  category: "sym" | "codec";
  badge: string;
  description: string;
  configFields: ConfigField[];
  encrypt: (input: string, params: Record<string, string>) => string;
  decrypt: (input: string, params: Record<string, string>) => string;
};

const rot13 = (s: string) =>
  s.replace(/[a-zA-Z]/g, (c) => {
    const b = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
  });

const xorStr = (s: string, key: string) => {
  if (!key) return s;
  return [...s].map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join("");
};

export const CIPHER_DEFS: CipherDef[] = [
  {
    id: "caesar",
    label: "Caesar",
    category: "sym",
    badge: "SYM",
    description: "Shift every character by N positions",
    configFields: [{ key: "shift", label: "Shift", type: "number", min: 1, max: 255, defaultValue: "3" }],
    encrypt: (s, p) => {
      const n = ((parseInt(p.shift ?? "3") % 256) + 256) % 256;
      return [...s].map((c) => String.fromCharCode((c.charCodeAt(0) + n) % 256)).join("");
    },
    decrypt: (s, p) => {
      const n = ((parseInt(p.shift ?? "3") % 256) + 256) % 256;
      return [...s].map((c) => String.fromCharCode((c.charCodeAt(0) - n + 256) % 256)).join("");
    },
  },
  {
    id: "xor",
    label: "XOR",
    category: "sym",
    badge: "SYM",
    description: "XOR each character against a repeating key",
    configFields: [{ key: "key", label: "Key", type: "text", placeholder: "secret", defaultValue: "key" }],
    encrypt: (s, p) => xorStr(s, p.key ?? "key"),
    decrypt: (s, p) => xorStr(s, p.key ?? "key"),
  },
  {
    id: "vigenere",
    label: "Vigenère",
    category: "sym",
    badge: "SYM",
    description: "Polyalphabetic substitution cipher",
    configFields: [{ key: "keyword", label: "Keyword", type: "text", placeholder: "KEYWORD", defaultValue: "KEY" }],
    encrypt: (s, p) => {
      const kw = (p.keyword ?? "KEY").toUpperCase().replace(/[^A-Z]/g, "") || "A";
      let ki = 0;
      return [...s].map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) { const r = String.fromCharCode(((code - 65 + kw.charCodeAt(ki % kw.length) - 65) % 26) + 65); ki++; return r; }
        if (code >= 97 && code <= 122) { const r = String.fromCharCode(((code - 97 + kw.charCodeAt(ki % kw.length) - 65) % 26) + 97); ki++; return r; }
        return c;
      }).join("");
    },
    decrypt: (s, p) => {
      const kw = (p.keyword ?? "KEY").toUpperCase().replace(/[^A-Z]/g, "") || "A";
      let ki = 0;
      return [...s].map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) { const r = String.fromCharCode(((code - 65 - (kw.charCodeAt(ki % kw.length) - 65) + 26) % 26) + 65); ki++; return r; }
        if (code >= 97 && code <= 122) { const r = String.fromCharCode(((code - 97 - (kw.charCodeAt(ki % kw.length) - 65) + 26) % 26) + 97); ki++; return r; }
        return c;
      }).join("");
    },
  },
  {
    id: "rot13",
    label: "ROT13",
    category: "codec",
    badge: "ENC",
    description: "Rotate letters by 13 positions (self-inverse)",
    configFields: [],
    encrypt: (s) => rot13(s),
    decrypt: (s) => rot13(s),
  },
  {
    id: "base64",
    label: "Base64",
    category: "codec",
    badge: "ENC",
    description: "Base64 encode / decode",
    configFields: [],
    encrypt: (s) => { try { return btoa(unescape(encodeURIComponent(s))); } catch { return s; } },
    decrypt: (s) => { try { return decodeURIComponent(escape(atob(s))); } catch { return s; } },
  },
  {
    id: "reverse",
    label: "Reverse",
    category: "codec",
    badge: "ENC",
    description: "Reverse the entire string (self-inverse)",
    configFields: [],
    encrypt: (s) => [...s].reverse().join(""),
    decrypt: (s) => [...s].reverse().join(""),
  },
];

export const PALETTE_GROUPS: { label: string; ids: string[] }[] = [
  { label: "Substitution", ids: ["caesar", "vigenere"] },
  { label: "Binary",       ids: ["xor"] },
  { label: "Transform",    ids: ["rot13", "base64", "reverse"] },
];

export function getCipher(id: string): CipherDef | undefined {
  return CIPHER_DEFS.find((c) => c.id === id);
}

export function executePipeline(
  nodes: { id: string; position: { x: number }; data: { algorithm: string; params: Record<string, string> } }[],
  input: string,
  mode: "encrypt" | "decrypt"
): { intermediates: Record<string, { input: string; output: string }>; output: string } {
  const pipeline = [...nodes]
    .sort((a, b) => a.position.x - b.position.x);

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
