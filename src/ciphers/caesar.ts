import type { CipherDef } from "./types";

const caesarDef: CipherDef = {
  id: "caesar",
  label: "Caesar",
  category: "sym",
  badge: "SYM",
  description: "Shift characters by N positions",
  configFields: [
    {
      key: "shift",
      label: "Shift",
      type: "number",
      min: 1,
      max: 255,
      defaultValue: "3",
    },
    {
      key: "charset",
      label: "Character Set",
      type: "select",
      defaultValue: "all",
      options: [
        { label: "All (256 chars)", value: "all" },
        { label: "Alpha only (a–z A–Z)", value: "alpha" },
        { label: "Alphanumeric", value: "alphanum" },
      ],
    },
  ],
  encrypt: (s, p) => {
    const n = ((parseInt(p.shift ?? "3") % 256) + 256) % 256;
    const cs = p.charset ?? "all";
    return [...s].map((c) => {
      const code = c.charCodeAt(0);
      if (cs === "alpha" || cs === "alphanum") {
        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + n) % 26) + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + n) % 26) + 97);
        if (cs === "alphanum" && code >= 48 && code <= 57)
          return String.fromCharCode(((code - 48 + n) % 10) + 48);
        return c;
      }
      return String.fromCharCode((code + n) % 256);
    }).join("");
  },
  decrypt: (s, p) => {
    const n = ((parseInt(p.shift ?? "3") % 256) + 256) % 256;
    const cs = p.charset ?? "all";
    return [...s].map((c) => {
      const code = c.charCodeAt(0);
      if (cs === "alpha" || cs === "alphanum") {
        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 - n + 26 * 10) % 26) + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 - n + 26 * 10) % 26) + 97);
        if (cs === "alphanum" && code >= 48 && code <= 57)
          return String.fromCharCode(((code - 48 - n + 10 * 10) % 10) + 48);
        return c;
      }
      return String.fromCharCode((code - n + 256) % 256);
    }).join("");
  },
};

export default caesarDef;
