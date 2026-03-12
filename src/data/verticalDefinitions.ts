export interface VerticalDef {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const VERTICALS: Record<string, VerticalDef> = {
  food: { id: "food", label: "Food & Delivery", icon: "UtensilsCrossed", color: "orange" },
  tech: { id: "tech", label: "Tech & SaaS", icon: "Code", color: "blue" },
  retail: { id: "retail", label: "Retail & Commerce", icon: "ShoppingCart", color: "green" },
  content: { id: "content", label: "Content & Media", icon: "BookOpen", color: "purple" },
  wellness: { id: "wellness", label: "Wellness & Health", icon: "Heart", color: "rose" },
  logistics: { id: "logistics", label: "Logistics", icon: "Truck", color: "amber" },
  real_estate: { id: "real_estate", label: "Real Estate", icon: "Building", color: "slate" },
  finance: { id: "finance", label: "Finance & Investments", icon: "TrendingUp", color: "emerald" },
  international: { id: "international", label: "International", icon: "Globe", color: "cyan" },
  product: { id: "product", label: "Physical Products", icon: "Package", color: "indigo" },
  sports: { id: "sports", label: "Sports & Entertainment", icon: "Trophy", color: "yellow" },
  other: { id: "other", label: "Other", icon: "Layers", color: "gray" },
};

export const STAGES = [
  { id: "idea", label: "Ideia", color: "gray", description: "Conceito inicial, sem produto" },
  { id: "mvp", label: "MVP", color: "blue", description: "Produto minimo viavel em desenvolvimento" },
  { id: "live", label: "Live", color: "green", description: "No ar, com usuarios reais" },
  { id: "scaling", label: "Scaling", color: "purple", description: "Crescendo, otimizando, expandindo" },
] as const;

export type Stage = typeof STAGES[number]["id"];
export type Vertical = keyof typeof VERTICALS;
