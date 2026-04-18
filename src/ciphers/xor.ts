import type { CipherDef } from "./types";

function parseKeyBytes(key: string, encoding: string): number[] {
  if (encoding === "hex") {
    const clean = key.replace(/[^0-9a-fA-F]/g, "").padEnd(2, "0");
    const bytes: number[] = [];
    for (let i = 0; i < clean.length; i += 2)
      bytes.push(parseInt(clean.slice(i, i + 2), 16));
    return bytes.length ? bytes : [0];
  }
  return key ? [...key].map((c) => c.charCodeAt(0)) : [0];
}

function xorBytes(s: string, keyBytes: number[]): string {
  return [...s].map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length])
  ).join("");
}

const xorDef: CipherDef = {
  id: "xor",
  label: "XOR",
  category: "sym",
  badge: "SYM",
  description: "XOR every byte against a repeating key (self-inverse)",
  configFields: [
    {
      key: "key",
      label: "Key",
      type: "text",
      placeholder: "secret key",
      defaultValue: "key",
    },
    {
      key: "keyEncoding",
      label: "Key Encoding",
      type: "select",
      defaultValue: "utf8",
      options: [
        { label: "UTF-8 string", value: "utf8" },
        { label: "Hex bytes (e.g. deadbeef)", value: "hex" },
      ],
    },
  ],
  encrypt: (s, p) => xorBytes(s, parseKeyBytes(p.key ?? "key", p.keyEncoding ?? "utf8")),
  decrypt: (s, p) => xorBytes(s, parseKeyBytes(p.key ?? "key", p.keyEncoding ?? "utf8")),
};

export default xorDef;
