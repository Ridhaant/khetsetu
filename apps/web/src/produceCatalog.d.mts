export type ProduceGroupId =
  | 'all'
  | 'fruits'
  | 'vegetables'
  | 'gourds'
  | 'leafy'
  | 'exotic'
  | 'staples';

export type ProduceItem = {
  id: string;
  name: string;
  nameHi: string;
  group: Exclude<ProduceGroupId, 'all'>;
  category: string;
  varieties: string[];
  origins: string[];
  season: string;
  unit: 'kg' | 'quintal' | 'tonne' | 'crate' | 'box';
  typicalMoq: number;
  accent: string;
};

export const PRODUCE_GROUPS: { id: ProduceGroupId; en: string; hi: string }[];
export const SEASONS: { id: string; en: string; hi: string }[];
export const produceCatalog: ProduceItem[];

export function filterProduceCatalog(
  items: ProduceItem[],
  options?: { group?: string; season?: string; search?: string },
): ProduceItem[];

export function catalogSummaryCounts(items?: ProduceItem[]): {
  total: number;
  fruits: number;
  vegetables: number;
  staples: number;
};
