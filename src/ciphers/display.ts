const C0_NAMES: Record<number, string> = {
  9: "\\t",
  10: "\\n",
  13: "\\r",
};

/** Make cipher pipeline strings readable in the UI (C0 controls, DEL, C1). Raw values stay in store / clipboard. */
export function formatCipherTextForDisplay(s: string): string {
  let out = "";
  for (const c of s) {
    const cp = c.codePointAt(0)!;
    if (cp === 0) {
      out += "\\0";
      continue;
    }
    const named = C0_NAMES[cp];
    if (named) {
      out += named;
      continue;
    }
    if (cp >= 1 && cp <= 31) {
      out += `\\x${cp.toString(16).padStart(2, "0")}`;
      continue;
    }
    if (cp === 127) {
      out += "\\x7f";
      continue;
    }
    if (cp >= 128 && cp < 160) {
      out += `\\u${cp.toString(16).padStart(4, "0")}`;
      continue;
    }
    out += c;
  }
  return out;
}
