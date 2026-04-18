import type { CipherDef } from "./types";

const DEFAULT_KEY = "QWERTYUIOPASDFGHJKLZXCVBNM";

function buildReverseKey(key: string): string[] {
  const rev = new Array<string>(26).fill("");
  for (let i = 0; i < 26; i++) {
    const idx = key.charCodeAt(i) - 65;
    if (idx >= 0 && idx < 26) rev[idx] = String.fromCharCode(i + 65);
  }
  return rev;
}

function isValidKey(key: string): boolean {
  if (key.length !== 26) return false;
  return new Set(key).size === 26;
}

const substitutionDef: CipherDef = {
  id: "substitution",
  label: "Substitution",
  category: "sym",
  badge: "SYM",
  description: "Replace each letter with a mapped letter from a 26-char key",
  configFields: [
    {
      key: "key",
      label: "Key (26 unique letters)",
      type: "text",
      placeholder: "QWERTYUIOPASDFGHJKLZXCVBNM",
      defaultValue: DEFAULT_KEY,
    },
  ],
  encrypt: (s, p) => {
    const key = (p.key ?? DEFAULT_KEY).toUpperCase().replace(/[^A-Z]/g, "");
    if (!isValidKey(key)) return s;
    return [...s].map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return key[code - 65];
      if (code >= 97 && code <= 122) return key[code - 97].toLowerCase();
      return c;
    }).join("");
  },
  decrypt: (s, p) => {
    const key = (p.key ?? DEFAULT_KEY).toUpperCase().replace(/[^A-Z]/g, "");
    if (!isValidKey(key)) return s;
    const rev = buildReverseKey(key);
    return [...s].map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return rev[code - 65] || c;
      if (code >= 97 && code <= 122) return (rev[code - 97] || c).toLowerCase();
      return c;
    }).join("");
  },
};

export default substitutionDef;
