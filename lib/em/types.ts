export type EmBomLine = {
  quantity: number;
  catalogNumber: string;
  description: string;
};

export type SpecRow = [label: string, value: string];

export type Option<T extends string | number = string> = {
  value: T;
  label: string;
};
