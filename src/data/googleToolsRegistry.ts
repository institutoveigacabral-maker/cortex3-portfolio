export type GoogleToolCategory = "seo" | "analytics" | "ads" | "local" | "content" | "infra" | "ai" | "productivity" | "commerce";

export interface GoogleToolDef {
  id: string;
  name: string;
  category: GoogleToolCategory;
  setupUrl: string;
  docsUrl?: string;
  description: string;
  requiresDomain: boolean;
  requiresApp: boolean;
  applicableStages: string[];
  applicableVerticals: string[] | null; // null = all
  sortOrder: number;
}

export const GOOGLE_TOOLS: GoogleToolDef[] = [
  {
    id: "search_console",
    name: "Google Search Console",
    category: "seo",
    setupUrl: "https://search.google.com/search-console",
    description: "Indexacao, performance organica, erros de rastreamento",
    requiresDomain: true,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 1,
  },
  {
    id: "analytics_4",
    name: "Google Analytics 4",
    category: "analytics",
    setupUrl: "https://analytics.google.com",
    description: "Trafego, conversoes, comportamento de usuarios",
    requiresDomain: true,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 2,
  },
  {
    id: "tag_manager",
    name: "Google Tag Manager",
    category: "analytics",
    setupUrl: "https://tagmanager.google.com",
    description: "Gerenciamento de tags e pixels sem codigo",
    requiresDomain: true,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 3,
  },
  {
    id: "ads",
    name: "Google Ads",
    category: "ads",
    setupUrl: "https://ads.google.com",
    description: "Aquisicao paga: Search, Display, Shopping, YouTube",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["live", "scaling"],
    applicableVerticals: null,
    sortOrder: 4,
  },
  {
    id: "merchant_center",
    name: "Google Merchant Center",
    category: "commerce",
    setupUrl: "https://merchants.google.com",
    description: "Listagem de produtos no Google Shopping",
    requiresDomain: true,
    requiresApp: false,
    applicableStages: ["live", "scaling"],
    applicableVerticals: ["food", "retail", "tech", "product"],
    sortOrder: 5,
  },
  {
    id: "business_profile",
    name: "Google Business Profile",
    category: "local",
    setupUrl: "https://business.google.com",
    description: "Presenca local no Google Maps e busca",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: ["food", "retail", "wellness", "education", "real_estate", "sports"],
    sortOrder: 6,
  },
  {
    id: "maps_platform",
    name: "Google Maps Platform",
    category: "local",
    setupUrl: "https://console.cloud.google.com/google/maps-apis",
    description: "APIs de mapas, geocoding, rotas e places",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: ["food", "logistics", "real_estate"],
    sortOrder: 7,
  },
  {
    id: "youtube",
    name: "YouTube Channel",
    category: "content",
    setupUrl: "https://studio.youtube.com",
    description: "Canal de video, shorts, lives, monetizacao",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["idea", "mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 8,
  },
  {
    id: "workspace",
    name: "Google Workspace",
    category: "productivity",
    setupUrl: "https://workspace.google.com",
    description: "Email profissional, Drive, Calendar, Meet",
    requiresDomain: true,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 9,
  },
  {
    id: "looker_studio",
    name: "Looker Studio",
    category: "analytics",
    setupUrl: "https://lookerstudio.google.com",
    description: "Dashboards e relatorios visuais conectados a dados",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["live", "scaling"],
    applicableVerticals: null,
    sortOrder: 10,
  },
  {
    id: "firebase",
    name: "Firebase",
    category: "infra",
    setupUrl: "https://console.firebase.google.com",
    description: "Hosting, auth, push notifications, Firestore",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 11,
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    category: "infra",
    setupUrl: "https://console.cloud.google.com",
    description: "Compute, storage, Cloud Functions, Cloud Run",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["live", "scaling"],
    applicableVerticals: null,
    sortOrder: 12,
  },
  {
    id: "ai_studio",
    name: "Google AI Studio / Gemini",
    category: "ai",
    setupUrl: "https://aistudio.google.com",
    description: "API Gemini, prototipagem de IA, fine-tuning",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["idea", "mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 13,
  },
  {
    id: "sheets_api",
    name: "Google Sheets API",
    category: "productivity",
    setupUrl: "https://console.cloud.google.com/apis/library/sheets.googleapis.com",
    description: "Automacao de planilhas como banco de dados leve",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["idea", "mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 14,
  },
  {
    id: "calendar_api",
    name: "Google Calendar API",
    category: "productivity",
    setupUrl: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com",
    description: "Agendamentos automaticos, integracoes de calendario",
    requiresDomain: false,
    requiresApp: false,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 15,
  },
  {
    id: "play_console",
    name: "Google Play Console",
    category: "infra",
    setupUrl: "https://play.google.com/console",
    description: "Publicacao e gestao de apps Android",
    requiresDomain: false,
    requiresApp: true,
    applicableStages: ["mvp", "live", "scaling"],
    applicableVerticals: null,
    sortOrder: 16,
  },
];

export const PARTNER_TOOLS = [
  { id: "stripe", name: "Stripe", category: "payments", setupUrl: "https://dashboard.stripe.com", description: "Pagamentos, assinaturas, checkout" },
  { id: "supabase", name: "Supabase", category: "backend", setupUrl: "https://supabase.com/dashboard", description: "Banco de dados, auth, edge functions" },
  { id: "vercel", name: "Vercel", category: "hosting", setupUrl: "https://vercel.com/dashboard", description: "Deploy, hosting, serverless functions" },
  { id: "cloudflare", name: "Cloudflare", category: "cdn", setupUrl: "https://dash.cloudflare.com", description: "CDN, DNS, protecao DDoS, Workers" },
  { id: "resend", name: "Resend", category: "email", setupUrl: "https://resend.com", description: "Email transacional e marketing" },
] as const;

export function getToolById(id: string): GoogleToolDef | undefined {
  return GOOGLE_TOOLS.find((t) => t.id === id);
}

export function getToolsForVertical(vertical: string, stage: string): GoogleToolDef[] {
  return GOOGLE_TOOLS.filter((t) => {
    const stageOk = t.applicableStages.includes(stage);
    const verticalOk = t.applicableVerticals === null || t.applicableVerticals.includes(vertical);
    return stageOk && verticalOk;
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}
