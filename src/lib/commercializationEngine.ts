import { GOOGLE_TOOLS, getToolsForVertical } from "@/data/googleToolsRegistry";

export type ToolStatus = "not_applicable" | "not_started" | "in_progress" | "configured" | "active" | "issue";

export interface ProjectToolStatus {
  toolId: string;
  status: ToolStatus;
  accountEmail?: string;
  propertyId?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  vertical: string;
  stage: string;
  primaryUrl?: string;
  country: string;
  revenueRange: string;
  tags: string[];
  priority: number;
  archived: boolean;
  toolStatuses: ProjectToolStatus[];
}

// Score weights per dimension
const DIMENSIONS = [
  { id: "foundation", label: "Fundacao", weight: 0.25, toolIds: ["workspace", "firebase", "gcp"] },
  { id: "discoverability", label: "Descoberta", weight: 0.25, toolIds: ["search_console", "analytics_4", "business_profile", "youtube"] },
  { id: "monetization", label: "Monetizacao", weight: 0.20, toolIds: ["merchant_center", "ads"] },
  { id: "content", label: "Conteudo & Engajamento", weight: 0.15, toolIds: ["youtube", "maps_platform", "ai_studio"] },
  { id: "operations", label: "Operacoes & Escala", weight: 0.15, toolIds: ["tag_manager", "looker_studio", "sheets_api", "calendar_api", "gcp"] },
];

const STATUS_SCORE: Record<ToolStatus, number> = {
  not_applicable: -1, // excluded
  not_started: 0,
  in_progress: 0.5,
  configured: 0.8,
  active: 1.0,
  issue: 0.2,
};

export function calculateReadinessScore(project: Project): number {
  const applicableTools = getToolsForVertical(project.vertical, project.stage);
  const applicableIds = new Set(applicableTools.map((t) => t.id));

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const dim of DIMENSIONS) {
    const dimTools = dim.toolIds.filter((id) => applicableIds.has(id));
    if (dimTools.length === 0) continue;

    let dimScore = 0;
    let dimCount = 0;

    for (const toolId of dimTools) {
      const status = project.toolStatuses.find((ts) => ts.toolId === toolId);
      const score = status ? STATUS_SCORE[status.status] : 0;
      if (score === -1) continue; // not_applicable
      dimScore += score;
      dimCount++;
    }

    if (dimCount > 0) {
      totalWeightedScore += (dimScore / dimCount) * dim.weight;
      totalWeight += dim.weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((totalWeightedScore / totalWeight) * 100);
}

export interface Recommendation {
  priority: "critical" | "high" | "medium" | "low";
  toolId: string;
  toolName: string;
  title: string;
  reason: string;
  setupUrl: string;
  estimatedTime: string;
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export function generateRecommendations(project: Project): Recommendation[] {
  const statusMap = new Map(project.toolStatuses.map((ts) => [ts.toolId, ts.status]));
  const has = (id: string) => statusMap.get(id) === "active" || statusMap.get(id) === "configured";
  const missing = (id: string) => !has(id) && statusMap.get(id) !== "not_applicable";
  const applicableTools = getToolsForVertical(project.vertical, project.stage);
  const applicableIds = new Set(applicableTools.map((t) => t.id));
  const tool = (id: string) => GOOGLE_TOOLS.find((t) => t.id === id);

  const recs: Recommendation[] = [];

  // Critical: live without basic tracking
  if ((project.stage === "live" || project.stage === "scaling") && missing("search_console") && applicableIds.has("search_console")) {
    recs.push({ priority: "critical", toolId: "search_console", toolName: "Search Console", title: "Configurar Google Search Console", reason: "Projeto no ar sem Search Console = invisivel no Google. Voce nao sabe se esta indexado.", setupUrl: tool("search_console")!.setupUrl, estimatedTime: "15 min" });
  }

  if ((project.stage === "live" || project.stage === "scaling") && missing("analytics_4") && applicableIds.has("analytics_4")) {
    recs.push({ priority: "critical", toolId: "analytics_4", toolName: "Analytics 4", title: "Configurar Google Analytics 4", reason: "Sem GA4 voce nao tem nenhum dado de trafego, conversao ou comportamento.", setupUrl: tool("analytics_4")!.setupUrl, estimatedTime: "20 min" });
  }

  // Critical: food/retail without Business Profile
  if ((project.stage === "live" || project.stage === "scaling") && missing("business_profile") && applicableIds.has("business_profile")) {
    recs.push({ priority: "critical", toolId: "business_profile", toolName: "Business Profile", title: "Criar Google Business Profile", reason: "Negocio fisico sem perfil no Google Maps perde ate 70% das buscas locais.", setupUrl: tool("business_profile")!.setupUrl, estimatedTime: "30 min" });
  }

  // High: retail without Merchant Center
  if (["retail", "food", "product"].includes(project.vertical) && missing("merchant_center") && applicableIds.has("merchant_center")) {
    recs.push({ priority: "high", toolId: "merchant_center", toolName: "Merchant Center", title: "Configurar Google Merchant Center", reason: "E-commerce/produto sem Merchant Center nao aparece no Google Shopping.", setupUrl: tool("merchant_center")!.setupUrl, estimatedTime: "1 hora" });
  }

  // High: no Workspace for live projects
  if ((project.stage === "live" || project.stage === "scaling") && missing("workspace") && applicableIds.has("workspace")) {
    recs.push({ priority: "high", toolId: "workspace", toolName: "Workspace", title: "Configurar Google Workspace", reason: "Email profissional (@suaempresa) passa mais credibilidade e centraliza comunicacao.", setupUrl: tool("workspace")!.setupUrl, estimatedTime: "30 min" });
  }

  // High: scaling without Ads
  if (project.stage === "scaling" && missing("ads") && applicableIds.has("ads")) {
    recs.push({ priority: "high", toolId: "ads", toolName: "Google Ads", title: "Criar conta Google Ads", reason: "Projeto em scaling sem Ads = crescimento limitado a organico. Ads acelera.", setupUrl: tool("ads")!.setupUrl, estimatedTime: "45 min" });
  }

  // High: food/logistics without Maps
  if (["food", "logistics"].includes(project.vertical) && missing("maps_platform") && applicableIds.has("maps_platform")) {
    recs.push({ priority: "high", toolId: "maps_platform", toolName: "Maps Platform", title: "Ativar Google Maps Platform", reason: "Delivery/logistica sem Maps perde rastreamento e experiencia do cliente.", setupUrl: tool("maps_platform")!.setupUrl, estimatedTime: "30 min" });
  }

  // Medium: has GA4 but no GTM
  if (has("analytics_4") && missing("tag_manager") && applicableIds.has("tag_manager")) {
    recs.push({ priority: "medium", toolId: "tag_manager", toolName: "Tag Manager", title: "Configurar Google Tag Manager", reason: "GA4 sem GTM limita tracking de conversoes e eventos customizados.", setupUrl: tool("tag_manager")!.setupUrl, estimatedTime: "30 min" });
  }

  // Medium: has data tools but no Looker
  if ((has("analytics_4") || has("search_console")) && missing("looker_studio") && applicableIds.has("looker_studio")) {
    recs.push({ priority: "medium", toolId: "looker_studio", toolName: "Looker Studio", title: "Criar dashboard no Looker Studio", reason: "Dados coletados mas sem dashboard visual = insights perdidos.", setupUrl: tool("looker_studio")!.setupUrl, estimatedTime: "1 hora" });
  }

  // Medium: no YouTube for any live project
  if ((project.stage === "live" || project.stage === "scaling") && missing("youtube") && applicableIds.has("youtube")) {
    recs.push({ priority: "medium", toolId: "youtube", toolName: "YouTube", title: "Criar canal no YouTube", reason: "YouTube e o 2o maior buscador do mundo. Conteudo em video gera autoridade.", setupUrl: tool("youtube")!.setupUrl, estimatedTime: "20 min" });
  }

  // Low: AI Studio for tech projects
  if (["tech"].includes(project.vertical) && missing("ai_studio") && applicableIds.has("ai_studio")) {
    recs.push({ priority: "low", toolId: "ai_studio", toolName: "AI Studio", title: "Explorar Google AI Studio", reason: "Projeto tech pode usar Gemini API pra features de IA sem custo inicial.", setupUrl: tool("ai_studio")!.setupUrl, estimatedTime: "15 min" });
  }

  // Low: Sheets API for automation
  if (missing("sheets_api") && applicableIds.has("sheets_api") && (project.stage === "live" || project.stage === "scaling")) {
    recs.push({ priority: "low", toolId: "sheets_api", toolName: "Sheets API", title: "Usar Google Sheets como integracao", reason: "Sheets API serve como banco de dados leve pra automacoes e reports.", setupUrl: tool("sheets_api")!.setupUrl, estimatedTime: "30 min" });
  }

  return recs.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

// Aggregate stats
export function getPortfolioStats(projects: Project[]) {
  const active = projects.filter((p) => !p.archived);
  const byStage = { idea: 0, mvp: 0, live: 0, scaling: 0 };
  let totalScore = 0;

  for (const p of active) {
    byStage[p.stage as keyof typeof byStage] = (byStage[p.stage as keyof typeof byStage] || 0) + 1;
    totalScore += calculateReadinessScore(p);
  }

  const avgScore = active.length > 0 ? Math.round(totalScore / active.length) : 0;

  // Top gaps: most common missing tools across all projects
  const toolGaps: Record<string, number> = {};
  for (const p of active) {
    const recs = generateRecommendations(p);
    for (const r of recs) {
      toolGaps[r.toolId] = (toolGaps[r.toolId] || 0) + 1;
    }
  }
  const topGaps = Object.entries(toolGaps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([toolId, count]) => ({ toolId, toolName: GOOGLE_TOOLS.find((t) => t.id === toolId)?.name || toolId, count }));

  return { total: active.length, byStage, avgScore, topGaps };
}
