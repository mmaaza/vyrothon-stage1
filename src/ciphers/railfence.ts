import type { CipherDef } from "./types";

function buildPattern(len: number, rails: number): number[] {
  const pattern = new Array<number>(len);
  let rail = 0;
  let dir = 1;
  for (let i = 0; i < len; i++) {
    pattern[i] = rail;
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return pattern;
}

const railFenceDef: CipherDef = {
  id: "railfence",
  label: "Rail Fence",
  category: "sym",
  badge: "SYM",
  description: "Write text in zigzag across N rails, read row by row",
  configFields: [
    {
      key: "rails",
      label: "Rails",
      type: "number",
      min: 2,
      max: 20,
      defaultValue: "3",
    },
  ],
  encrypt: (s, p) => {
    const rails = Math.min(Math.max(2, parseInt(p.rails ?? "3")), s.length);
    const fence: string[][] = Array.from({ length: rails }, () => []);
    const pattern = buildPattern(s.length, rails);
    for (let i = 0; i < s.length; i++) fence[pattern[i]].push(s[i]);
    return fence.flat().join("");
  },
  decrypt: (s, p) => {
    const rails = Math.min(Math.max(2, parseInt(p.rails ?? "3")), s.length);
    const n = s.length;
    const pattern = buildPattern(n, rails);

    const railLengths = new Array<number>(rails).fill(0);
    for (const r of pattern) railLengths[r]++;

    const fence: string[][] = [];
    let offset = 0;
    for (let r = 0; r < rails; r++) {
      fence.push([...s.slice(offset, offset + railLengths[r])]);
      offset += railLengths[r];
    }

    const railIdx = new Array<number>(rails).fill(0);
    let result = "";
    for (let i = 0; i < n; i++) {
      const r = pattern[i];
      result += fence[r][railIdx[r]++];
    }
    return result;
  },
};

export default railFenceDef;
