export type ConfigField = {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  min?: number;
  max?: number;
  defaultValue: string;
  options?: { label: string; value: string }[];
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
