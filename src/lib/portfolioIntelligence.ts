import { GOOGLE_TOOLS } from "@/data/googleToolsRegistry";
import { VERTICALS } from "@/data/verticalDefinitions";
import { calculateReadinessScore, generateRecommendations, type Project } from "./commercializationEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InsightType = "synergy" | "bottleneck" | "opportunity" | "risk" | "resource" | "strategic";
export type InsightSeverity = "critical" | "high" | "medium" | "info";

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  context: string; // why this matters
  action: string; // what to do
  relatedProjects: string[]; // project ids
  tags: string[];
}

export interface SynergyLink {
  sourceId: string;
  targetId: string;
  reason: string;
  strength: "strong" | "medium" | "weak";
  sharedAssets: string[]; // what they can share
}

export interface VerticalCluster {
  vertical: string;
  label: string;
  projects: Project[];
  avgScore: number;
  stageDistribution: Record<string, number>;
  totalPriority: number;
  topGap: string | null;
  revenueProjects: number;
}

export interface GeographicCluster {
  country: string;
  label: string;
  projects: Project[];
  avgScore: number;
  stages: Record<string, number>;
}

export interface PipelineStage {
  stage: string;
  label: string;
  count: number;
  projects: Project[];
  avgScore: number;
  blockers: string[]; // common missing tools
}

export interface PortfolioIntelligence {
  insights: Insight[];
  synergies: SynergyLink[];
  verticalClusters: VerticalCluster[];
  geoClusters: GeographicCluster[];
  pipeline: PipelineStage[];
  concentrationIndex: number; // 0-100: how concentrated effort is
  portfolioHealth: number; // 0-100
  topStrategicActions: string[];
}

// ─── Synergy Detection ───────────────────────────────────────────────────────

function detectSynergies(projects: Project[]): SynergyLink[] {
  const links: SynergyLink[] = [];
  const active = projects.filter((p) => !p.archived);

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];

      // Same vertical = shared audience, suppliers, brand
      if (a.vertical === b.vertical) {
        const shared: string[] = [];
        if (a.vertical === "food") shared.push("fornecedores", "cozinhas", "delivery", "cardapio");
        else if (a.vertical === "tech") shared.push("stack", "devs", "infra cloud");
        else if (a.vertical === "retail") shared.push("logistica", "fornecedores", "marketplace");
        else shared.push("audiencia", "canais");

        // Stronger if both are live+
        const strength = (a.stage === "live" || a.stage === "scaling") && (b.stage === "live" || b.stage === "scaling") ? "strong" : "medium";
        links.push({ sourceId: a.id, targetId: b.id, reason: `Mesma vertical: ${VERTICALS[a.vertical]?.label}`, strength, sharedAssets: shared });
      }

      // Shared tags
      const commonTags = a.tags.filter((t) => b.tags.includes(t));
      if (commonTags.length >= 2 && a.vertical !== b.vertical) {
        links.push({ sourceId: a.id, targetId: b.id, reason: `Tags em comum: ${commonTags.join(", ")}`, strength: "medium", sharedAssets: commonTags });
      }

      // Same country (non-BR) = shared local ops
      if (a.country === b.country && a.country !== "BR") {
        links.push({ sourceId: a.id, targetId: b.id, reason: `Mesma operacao: ${a.country}`, strength: "strong", sharedAssets: ["escritorio", "contabilidade", "conta bancaria", "equipe local"] });
      }

      // Supply chain: one produces, other distributes
      if ((a.vertical === "logistics" || a.vertical === "retail") && b.vertical === "food") {
        links.push({ sourceId: a.id, targetId: b.id, reason: "Cadeia de suprimento: logistica + food", strength: "medium", sharedAssets: ["transporte", "armazem", "rastreamento"] });
      }

      // Tech serving other verticals
      if (a.vertical === "tech" && b.vertical !== "tech" && (a.stage === "mvp" || a.stage === "live")) {
        const techTags = a.tags.filter((t) => ["ia", "ai", "crm", "automacao", "analytics"].includes(t));
        if (techTags.length > 0) {
          links.push({ sourceId: a.id, targetId: b.id, reason: `${a.name} pode servir ${b.name}`, strength: "weak", sharedAssets: techTags });
        }
      }
    }
  }

  // Deduplicate (keep strongest)
  const seen = new Set<string>();
  return links.filter((l) => {
    const key = [l.sourceId, l.targetId].sort().join("-") + l.reason;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Vertical Clustering ─────────────────────────────────────────────────────

function clusterByVertical(projects: Project[]): VerticalCluster[] {
  const active = projects.filter((p) => !p.archived);
  const groups: Record<string, Project[]> = {};

  for (const p of active) {
    if (!groups[p.vertical]) groups[p.vertical] = [];
    groups[p.vertical].push(p);
  }

  return Object.entries(groups)
    .map(([vertical, projs]) => {
      const scores = projs.map(calculateReadinessScore);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const stageDistribution: Record<string, number> = {};
      for (const p of projs) stageDistribution[p.stage] = (stageDistribution[p.stage] || 0) + 1;

      // Find top gap in this vertical
      const gapCount: Record<string, number> = {};
      for (const p of projs) {
        const recs = generateRecommendations(p);
        for (const r of recs) gapCount[r.toolId] = (gapCount[r.toolId] || 0) + 1;
      }
      const topGapEntry = Object.entries(gapCount).sort((a, b) => b[1] - a[1])[0];
      const topGap = topGapEntry ? GOOGLE_TOOLS.find((t) => t.id === topGapEntry[0])?.name || null : null;

      const revenueProjects = projs.filter((p) => p.revenueRange !== "pre_revenue").length;

      return {
        vertical,
        label: VERTICALS[vertical]?.label || vertical,
        projects: projs,
        avgScore,
        stageDistribution,
        totalPriority: projs.reduce((sum, p) => sum + p.priority, 0),
        topGap,
        revenueProjects,
      };
    })
    .sort((a, b) => b.totalPriority - a.totalPriority || b.revenueProjects - a.revenueProjects);
}

// ─── Geographic Clustering ───────────────────────────────────────────────────

function clusterByGeo(projects: Project[]): GeographicCluster[] {
  const active = projects.filter((p) => !p.archived);
  const groups: Record<string, Project[]> = {};

  const COUNTRY_LABELS: Record<string, string> = { BR: "Brasil", PT: "Portugal", US: "Estados Unidos", CN: "China", PY: "Paraguai" };

  for (const p of active) {
    if (!groups[p.country]) groups[p.country] = [];
    groups[p.country].push(p);
  }

  return Object.entries(groups)
    .map(([country, projs]) => {
      const scores = projs.map(calculateReadinessScore);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const stages: Record<string, number> = {};
      for (const p of projs) stages[p.stage] = (stages[p.stage] || 0) + 1;
      return { country, label: COUNTRY_LABELS[country] || country, projects: projs, avgScore, stages };
    })
    .sort((a, b) => b.projects.length - a.projects.length);
}

// ─── Pipeline Analysis ───────────────────────────────────────────────────────

function analyzePipeline(projects: Project[]): PipelineStage[] {
  const active = projects.filter((p) => !p.archived);
  const STAGE_LABELS: Record<string, string> = { idea: "Ideia", mvp: "MVP", live: "Live", scaling: "Scaling" };

  return ["idea", "mvp", "live", "scaling"].map((stage) => {
    const projs = active.filter((p) => p.stage === stage);
    const scores = projs.map(calculateReadinessScore);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Common blockers
    const blockerCount: Record<string, number> = {};
    for (const p of projs) {
      const recs = generateRecommendations(p).filter((r) => r.priority === "critical" || r.priority === "high");
      for (const r of recs) blockerCount[r.toolName] = (blockerCount[r.toolName] || 0) + 1;
    }
    const blockers = Object.entries(blockerCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);

    return { stage, label: STAGE_LABELS[stage], count: projs.length, projects: projs, avgScore, blockers };
  });
}

// ─── Insight Generation ──────────────────────────────────────────────────────

function generateInsights(projects: Project[], synergies: SynergyLink[], verticalClusters: VerticalCluster[], pipeline: PipelineStage[]): Insight[] {
  const active = projects.filter((p) => !p.archived);
  const insights: Insight[] = [];
  let idx = 0;
  const id = () => `insight-${++idx}`;

  // 1. Too many projects in "idea" stage
  const ideaCount = active.filter((p) => p.stage === "idea").length;
  const ideaRatio = ideaCount / active.length;
  if (ideaRatio > 0.5) {
    insights.push({
      id: id(), type: "bottleneck", severity: "critical",
      title: `${ideaCount} projetos parados em "Ideia" (${Math.round(ideaRatio * 100)}%)`,
      description: `Mais da metade do portfolio esta na fase de ideia sem execucao. Isso dilui foco e energia.`,
      context: "Portfolio com muitas ideias e poucas execucoes indica falta de priorizacao. O risco e nenhum projeto ganhar tracao suficiente.",
      action: "Selecione os 3 projetos com maior potencial de receita e mova para MVP. Archive ou pause os demais ate ter bandwidth.",
      relatedProjects: active.filter((p) => p.stage === "idea").map((p) => p.id),
      tags: ["priorizacao", "foco"],
    });
  }

  // 2. High-priority projects with low score
  const highPrioLowScore = active.filter((p) => p.priority >= 1 && calculateReadinessScore(p) < 30);
  if (highPrioLowScore.length > 0) {
    insights.push({
      id: id(), type: "risk", severity: "critical",
      title: `${highPrioLowScore.length} projetos prioritarios com score abaixo de 30`,
      description: `Projetos marcados como prioridade mas sem infraestrutura basica configurada.`,
      context: "Projeto prioritario sem ferramentas = investimento de tempo sem retorno mensuravel. Voce esta voando cego nesses projetos.",
      action: "Para cada um, configure pelo menos Search Console + Analytics + Workspace. Isso leva ~1 hora por projeto e ja muda o jogo.",
      relatedProjects: highPrioLowScore.map((p) => p.id),
      tags: ["urgente", "infraestrutura"],
    });
  }

  // 3. Revenue-generating projects without full stack
  const revenueNoStack = active.filter((p) => p.revenueRange !== "pre_revenue" && calculateReadinessScore(p) < 50);
  if (revenueNoStack.length > 0) {
    insights.push({
      id: id(), type: "opportunity", severity: "high",
      title: `${revenueNoStack.length} projetos com receita mas sem presenca digital completa`,
      description: `Projetos que ja faturam mas nao tem visibilidade, tracking ou otimizacao configurados.`,
      context: "Esses projetos ja provaram product-market fit. Cada ferramenta configurada aqui tem ROI imediato porque ja existe receita pra otimizar.",
      action: "Priorize a configuracao completa desses projetos. O retorno e mais rapido porque ja tem clientes pagantes.",
      relatedProjects: revenueNoStack.map((p) => p.id),
      tags: ["receita", "roi-rapido"],
    });
  }

  // 4. Vertical concentration risk
  for (const cluster of verticalClusters) {
    if (cluster.projects.length >= 5 && cluster.revenueProjects <= 1) {
      insights.push({
        id: id(), type: "risk", severity: "medium",
        title: `Vertical "${cluster.label}" tem ${cluster.projects.length} projetos mas so ${cluster.revenueProjects} gera receita`,
        description: `Muitos projetos na mesma vertical sem monetizacao indica dispersao de esforco.`,
        context: "Ter varios projetos na mesma vertical pode ser estrategico (dominio de mercado) ou desperdicio (competindo consigo mesmo).",
        action: `Avalie se esses projetos sao complementares ou concorrentes. Consolide os que competem entre si.`,
        relatedProjects: cluster.projects.map((p) => p.id),
        tags: ["consolidacao", cluster.vertical],
      });
    }
  }

  // 5. Synergy opportunities not exploited
  const strongSynergies = synergies.filter((s) => s.strength === "strong");
  if (strongSynergies.length > 0) {
    const projectNames = new Map(active.map((p) => [p.id, p.name]));
    const topSynergies = strongSynergies.slice(0, 3);
    for (const syn of topSynergies) {
      insights.push({
        id: id(), type: "synergy", severity: "medium",
        title: `Sinergia forte: ${projectNames.get(syn.sourceId)} + ${projectNames.get(syn.targetId)}`,
        description: `${syn.reason}. Podem compartilhar: ${syn.sharedAssets.join(", ")}.`,
        context: "Projetos com sinergia forte podem reduzir custos e acelerar crescimento compartilhando recursos.",
        action: `Verifique se ${projectNames.get(syn.sourceId)} e ${projectNames.get(syn.targetId)} ja compartilham ${syn.sharedAssets[0]}. Se nao, comece por ai.`,
        relatedProjects: [syn.sourceId, syn.targetId],
        tags: ["sinergia", "eficiencia"],
      });
    }
  }

  // 6. International operations need more structure
  const intlProjects = active.filter((p) => p.country !== "BR");
  const intlLive = intlProjects.filter((p) => p.stage === "live" || p.stage === "scaling");
  if (intlLive.length > 0) {
    const intlLowScore = intlLive.filter((p) => calculateReadinessScore(p) < 40);
    if (intlLowScore.length > 0) {
      insights.push({
        id: id(), type: "risk", severity: "high",
        title: `${intlLowScore.length} operacoes internacionais ativas sem estrutura digital`,
        description: `Projetos operando fora do Brasil sem ferramentas basicas configuradas.`,
        context: "Operacao internacional sem presenca digital local e vulneravel. Concorrentes locais ja estao configurados.",
        action: "Priorize Business Profile, Workspace e Analytics para cada operacao internacional ativa.",
        relatedProjects: intlLowScore.map((p) => p.id),
        tags: ["internacional", "urgente"],
      });
    }
  }

  // 7. Pipeline bottleneck: too many MVPs not going live
  const mvpStage = pipeline.find((p) => p.stage === "mvp");
  const liveStage = pipeline.find((p) => p.stage === "live");
  if (mvpStage && liveStage && mvpStage.count > liveStage.count * 2) {
    insights.push({
      id: id(), type: "bottleneck", severity: "high",
      title: `Pipeline travado: ${mvpStage.count} MVPs vs ${liveStage.count} Live`,
      description: `Muitos projetos em MVP que nao evoluem pra Live indica falta de execucao no lancamento.`,
      context: "O gargalo MVP→Live geralmente e falta de dominio, hosting ou medo de lancar. A maioria dos MVPs esta pronta o suficiente.",
      action: "Revise cada MVP e defina uma data de lancamento. 'Done is better than perfect' — lance com o minimo e itere.",
      relatedProjects: mvpStage.projects.map((p) => p.id),
      tags: ["pipeline", "lancamento"],
    });
  }

  // 8. Tool consolidation opportunity
  const toolUsage: Record<string, number> = {};
  for (const p of active) {
    for (const ts of p.toolStatuses) {
      if (ts.status === "active" || ts.status === "configured") {
        toolUsage[ts.toolId] = (toolUsage[ts.toolId] || 0) + 1;
      }
    }
  }
  const underusedTools = Object.entries(toolUsage).filter(([, count]) => count === 1);
  if (underusedTools.length >= 3) {
    insights.push({
      id: id(), type: "resource", severity: "info",
      title: `${underusedTools.length} ferramentas configuradas em apenas 1 projeto`,
      description: `Ferramentas ativas em um unico projeto poderiam ser reaproveitadas em outros do mesmo vertical.`,
      context: "Configurar uma ferramenta leva tempo. Se ja esta configurada em um projeto, replicar para projetos similares e rapido.",
      action: "Verifique se projetos do mesmo vertical podem reaproveitar as mesmas contas/configuracoes.",
      relatedProjects: [],
      tags: ["eficiencia", "ferramentas"],
    });
  }

  // 9. Tech projects that can serve the ecosystem
  const techProjects = active.filter((p) => p.vertical === "tech" && (p.stage === "mvp" || p.stage === "live"));
  const nonTechProjects = active.filter((p) => p.vertical !== "tech");
  for (const tech of techProjects) {
    const served: string[] = [];
    if (tech.tags.includes("crm") || tech.tags.includes("ia")) {
      for (const other of nonTechProjects) {
        if (other.stage === "live" || other.stage === "scaling") served.push(other.id);
      }
    }
    if (served.length >= 3) {
      insights.push({
        id: id(), type: "strategic", severity: "high",
        title: `${tech.name} pode servir ${served.length} projetos do ecossistema`,
        description: `Ferramenta tech interna que pode ser usada por multiplos projetos, reduzindo dependencia de terceiros.`,
        context: "Quando um projeto tech atende o proprio ecossistema, ele valida product-market fit internamente antes de vender pra fora.",
        action: `Defina ${tech.name} como ferramenta oficial do ecossistema. Comece integrando com os 3 projetos de maior receita.`,
        relatedProjects: [tech.id, ...served.slice(0, 5)],
        tags: ["ecossistema", "integracao"],
      });
    }
  }

  // 10. Shared Google account opportunity
  const workspaceActive = active.filter((p) => p.toolStatuses.some((ts) => ts.toolId === "workspace" && (ts.status === "active" || ts.status === "configured")));
  const workspaceMissing = active.filter((p) => (p.stage === "live" || p.stage === "scaling") && !p.toolStatuses.some((ts) => ts.toolId === "workspace" && (ts.status === "active" || ts.status === "configured")));
  if (workspaceActive.length > 0 && workspaceMissing.length > 0) {
    insights.push({
      id: id(), type: "resource", severity: "medium",
      title: `${workspaceMissing.length} projetos ativos poderiam usar Workspace ja configurado`,
      description: `Voce ja tem Google Workspace em ${workspaceActive.length} projeto(s). Projetos ativos sem email profissional perdem credibilidade.`,
      context: "Adicionar um alias ou subdominio no Workspace existente custa ~R$28/mes por usuario vs criar uma conta separada.",
      action: "Adicione dominios/alias no Workspace existente para os projetos ativos sem email profissional.",
      relatedProjects: workspaceMissing.map((p) => p.id),
      tags: ["workspace", "consolidacao"],
    });
  }

  return insights.sort((a, b) => {
    const order: Record<InsightSeverity, number> = { critical: 0, high: 1, medium: 2, info: 3 };
    return order[a.severity] - order[b.severity];
  });
}

// ─── Concentration Index ─────────────────────────────────────────────────────

function calculateConcentration(projects: Project[]): number {
  const active = projects.filter((p) => !p.archived);
  if (active.length === 0) return 0;

  // How concentrated is the priority across projects
  const priorities = active.map((p) => p.priority);
  const maxPriority = Math.max(...priorities);
  if (maxPriority === 0) return 0;

  const highPrio = active.filter((p) => p.priority >= 1).length;
  // 100 = all effort in few projects, 0 = totally spread
  return Math.round((1 - highPrio / active.length) * 100);
}

// ─── Portfolio Health ────────────────────────────────────────────────────────

function calculateHealth(projects: Project[], insights: Insight[]): number {
  const active = projects.filter((p) => !p.archived);
  if (active.length === 0) return 0;

  let health = 100;

  // Penalize for critical insights
  health -= insights.filter((i) => i.severity === "critical").length * 15;
  health -= insights.filter((i) => i.severity === "high").length * 8;
  health -= insights.filter((i) => i.severity === "medium").length * 3;

  // Bonus for revenue-generating projects
  const revenueProjects = active.filter((p) => p.revenueRange !== "pre_revenue").length;
  health += Math.min(revenueProjects * 5, 20);

  // Bonus for live/scaling projects
  const liveOrScaling = active.filter((p) => p.stage === "live" || p.stage === "scaling").length;
  health += Math.min(liveOrScaling * 3, 15);

  // Average readiness score contributes
  const avgScore = active.reduce((sum, p) => sum + calculateReadinessScore(p), 0) / active.length;
  health += avgScore * 0.2;

  return Math.max(0, Math.min(100, Math.round(health)));
}

// ─── Top Strategic Actions ───────────────────────────────────────────────────

function deriveStrategicActions(insights: Insight[], projects: Project[]): string[] {
  const actions: string[] = [];
  const active = projects.filter((p) => !p.archived);

  // From critical insights
  for (const insight of insights.filter((i) => i.severity === "critical").slice(0, 2)) {
    actions.push(insight.action);
  }

  // Revenue unlock
  const revenueReady = active.filter((p) => p.stage === "live" && p.revenueRange === "pre_revenue" && calculateReadinessScore(p) >= 30);
  if (revenueReady.length > 0) {
    actions.push(`${revenueReady.length} projeto(s) Live sem receita. Configure Ads + Merchant Center pra comecar a monetizar: ${revenueReady.map((p) => p.name).slice(0, 3).join(", ")}.`);
  }

  // Quick wins: projects close to next score tier
  const quickWins = active.filter((p) => {
    const score = calculateReadinessScore(p);
    return score >= 20 && score < 30 && p.priority >= 1;
  });
  if (quickWins.length > 0) {
    actions.push(`Quick wins: ${quickWins.map((p) => p.name).join(", ")} estao perto de 30 pontos. Uma ferramenta a mais muda o tier.`);
  }

  // From high insights
  for (const insight of insights.filter((i) => i.severity === "high").slice(0, 2)) {
    if (!actions.includes(insight.action)) actions.push(insight.action);
  }

  return actions.slice(0, 6);
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

export function analyzePortfolio(projects: Project[]): PortfolioIntelligence {
  const synergies = detectSynergies(projects);
  const verticalClusters = clusterByVertical(projects);
  const geoClusters = clusterByGeo(projects);
  const pipeline = analyzePipeline(projects);
  const insights = generateInsights(projects, synergies, verticalClusters, pipeline);
  const concentrationIndex = calculateConcentration(projects);
  const portfolioHealth = calculateHealth(projects, insights);
  const topStrategicActions = deriveStrategicActions(insights, projects);

  return { insights, synergies, verticalClusters, geoClusters, pipeline, concentrationIndex, portfolioHealth, topStrategicActions };
}
