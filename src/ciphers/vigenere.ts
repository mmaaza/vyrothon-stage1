import type { CipherDef } from "./types";

const vigenereDef: CipherDef = {
  id: "vigenere",
  label: "Vigenère",
  category: "sym",
  badge: "SYM",
  description: "Polyalphabetic substitution cipher",
  configFields: [
    {
      key: "keyword",
      label: "Keyword",
      type: "text",
      placeholder: "KEYWORD",
      defaultValue: "KEY",
    },
    {
      key: "mode",
      label: "Mode",
      type: "select",
      defaultValue: "standard",
      options: [
        { label: "Standard (letters only)", value: "standard" },
        { label: "Extended (all printable ASCII)", value: "extended" },
      ],
    },
  ],
  encrypt: (s, p) => {
    const kw = (p.keyword ?? "KEY").toUpperCase().replace(/[^A-Z]/g, "") || "A";
    const extended = (p.mode ?? "standard") === "extended";
    let ki = 0;
    return [...s].map((c) => {
      const code = c.charCodeAt(0);
      if (extended && code >= 32 && code <= 126) {
        const shift = kw.charCodeAt(ki++ % kw.length) - 65;
        return String.fromCharCode(((code - 32 + shift) % 95) + 32);
      }
      if (!extended) {
        if (code >= 65 && code <= 90) { const r = String.fromCharCode(((code - 65 + kw.charCodeAt(ki % kw.length) - 65) % 26) + 65); ki++; return r; }
        if (code >= 97 && code <= 122) { const r = String.fromCharCode(((code - 97 + kw.charCodeAt(ki % kw.length) - 65) % 26) + 97); ki++; return r; }
      }
      return c;
    }).join("");
  },
  decrypt: (s, p) => {
    const kw = (p.keyword ?? "KEY").toUpperCase().replace(/[^A-Z]/g, "") || "A";
    const extended = (p.mode ?? "standard") === "extended";
    let ki = 0;
    return [...s].map((c) => {
      const code = c.charCodeAt(0);
      if (extended && code >= 32 && code <= 126) {
        const shift = kw.charCodeAt(ki++ % kw.length) - 65;
        return String.fromCharCode(((code - 32 - shift + 95 * 10) % 95) + 32);
      }
      if (!extended) {
        if (code >= 65 && code <= 90) { const r = String.fromCharCode(((code - 65 - (kw.charCodeAt(ki % kw.length) - 65) + 26 * 10) % 26) + 65); ki++; return r; }
        if (code >= 97 && code <= 122) { const r = String.fromCharCode(((code - 97 - (kw.charCodeAt(ki % kw.length) - 65) + 26 * 10) % 26) + 97); ki++; return r; }
      }
      return c;
    }).join("");
  },
};

export default vigenereDef;
