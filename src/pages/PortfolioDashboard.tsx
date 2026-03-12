import { useState, useMemo, useCallback } from "react";
// standalone project — no router links needed
import { Search, Plus, ArrowRight, ExternalLink, ChevronDown, ChevronRight, LayoutGrid, List, AlertTriangle, CheckCircle2, Clock, Zap, Filter, Brain, TrendingUp, Globe, Link2, Target, Activity, ArrowUpRight, Shield, Lightbulb, Network } from "lucide-react";
import { GOOGLE_TOOLS } from "@/data/googleToolsRegistry";
import { VERTICALS, STAGES } from "@/data/verticalDefinitions";
import { PROJECTS_SEED } from "@/data/projectsSeed";
import { calculateReadinessScore, generateRecommendations, getPortfolioStats, type Project, type ProjectToolStatus, type ToolStatus } from "@/lib/commercializationEngine";
import { analyzePortfolio, type InsightType, type InsightSeverity } from "@/lib/portfolioIntelligence";

// localStorage persistence
const STORAGE_KEY = "cortex3_portfolio";

function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // Initialize from seed
  const projects: Project[] = PROJECTS_SEED.map((p) => ({ ...p, toolStatuses: [] }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects;
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

const PRIORITY_COLORS = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const STATUS_CONFIG: Record<ToolStatus, { label: string; color: string; bg: string }> = {
  not_applicable: { label: "N/A", color: "text-muted-foreground", bg: "bg-muted/30" },
  not_started: { label: "Pendente", color: "text-muted-foreground", bg: "bg-muted/50" },
  in_progress: { label: "Em andamento", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  configured: { label: "Configurado", color: "text-blue-500", bg: "bg-blue-500/10" },
  active: { label: "Ativo", color: "text-green-500", bg: "bg-green-500/10" },
  issue: { label: "Problema", color: "text-red-500", bg: "bg-red-500/10" },
};

const STAGE_COLORS: Record<string, string> = {
  idea: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  mvp: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  live: "bg-green-500/10 text-green-400 border-green-500/20",
  scaling: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function PortfolioDashboard() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [search, setSearch] = useState("");
  const [filterVertical, setFilterVertical] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"grid" | "recommendations" | "matrix" | "intelligence">("grid");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return projects
      .filter((p) => !p.archived)
      .filter((p) => filterVertical === "all" || p.vertical === filterVertical)
      .filter((p) => filterStage === "all" || p.stage === filterStage)
      .filter((p) => search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.includes(search.toLowerCase())))
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return calculateReadinessScore(b) - calculateReadinessScore(a);
      });
  }, [projects, search, filterVertical, filterStage]);

  const stats = useMemo(() => getPortfolioStats(projects), [projects]);
  const intelligence = useMemo(() => analyzePortfolio(projects), [projects]);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const allRecommendations = useMemo(() => {
    const recs: { project: Project; rec: ReturnType<typeof generateRecommendations>[0] }[] = [];
    for (const p of projects.filter((p) => !p.archived)) {
      for (const r of generateRecommendations(p)) {
        recs.push({ project: p, rec: r });
      }
    }
    return recs.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.rec.priority] - order[b.rec.priority];
    });
  }, [projects]);

  const updateToolStatus = useCallback((projectId: string, toolId: string, status: ToolStatus) => {
    setProjects((prev) => {
      const next = prev.map((p) => {
        if (p.id !== projectId) return p;
        const existing = p.toolStatuses.find((ts) => ts.toolId === toolId);
        if (existing) {
          return { ...p, toolStatuses: p.toolStatuses.map((ts) => ts.toolId === toolId ? { ...ts, status } : ts) };
        }
        return { ...p, toolStatuses: [...p.toolStatuses, { toolId, status }] };
      });
      saveProjects(next);
      return next;
    });
  }, []);

  const updateStage = useCallback((projectId: string, stage: string) => {
    setProjects((prev) => {
      const next = prev.map((p) => p.id === projectId ? { ...p, stage } : p);
      saveProjects(next);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">CORTEX3 Portfolio Command Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Google Ecosystem + Presenca Comercial</p>
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-mono">v1.0</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          <div className="rounded-xl border border-border/30 bg-card/40 p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Projetos ativos</p>
          </div>
          <div className="rounded-xl border border-border/30 bg-card/40 p-4">
            <p className="text-2xl font-bold text-primary">{stats.avgScore}<span className="text-sm text-muted-foreground">/100</span></p>
            <p className="text-xs text-muted-foreground">Score medio</p>
          </div>
          {STAGES.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/30 bg-card/40 p-4">
              <p className="text-2xl font-bold">{stats.byStage[s.id as keyof typeof stats.byStage] || 0}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top Gaps */}
        {stats.topGaps.length > 0 && (
          <div className="mb-8 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <p className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Maiores lacunas no portfolio
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.topGaps.map((gap) => (
                <span key={gap.toolId} className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs text-orange-300">
                  {gap.toolName}: {gap.count} projetos sem
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar projeto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-lg border border-border/40 bg-card/40 pl-9 pr-3 text-sm outline-none focus:border-primary/50 w-48"
              />
            </div>
            <select
              value={filterVertical}
              onChange={(e) => setFilterVertical(e.target.value)}
              className="h-9 rounded-lg border border-border/40 bg-card/40 px-3 text-sm outline-none focus:border-primary/50"
            >
              <option value="all">Todas verticais</option>
              {Object.entries(VERTICALS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="h-9 rounded-lg border border-border/40 bg-card/40 px-3 text-sm outline-none focus:border-primary/50"
            >
              <option value="all">Todos estagios</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 bg-card/40 rounded-lg border border-border/30 p-0.5">
            <button onClick={() => setActiveTab("grid")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-3.5 w-3.5 inline mr-1" />Projetos
            </button>
            <button onClick={() => setActiveTab("recommendations")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "recommendations" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Zap className="h-3.5 w-3.5 inline mr-1" />Acoes ({allRecommendations.length})
            </button>
            <button onClick={() => setActiveTab("intelligence")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "intelligence" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Brain className="h-3.5 w-3.5 inline mr-1" />Inteligencia
            </button>
            <button onClick={() => setActiveTab("matrix")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "matrix" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-3.5 w-3.5 inline mr-1" />Matrix
            </button>
          </div>
        </div>

        {/* Grid View */}
        {activeTab === "grid" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => {
              const score = calculateReadinessScore(project);
              const recs = generateRecommendations(project);
              const topRec = recs[0];
              const vertical = VERTICALS[project.vertical];
              const isExpanded = expandedProject === project.id;

              return (
                <div key={project.id} className="rounded-xl border border-border/30 bg-card/40 overflow-hidden hover:border-primary/20 transition-colors">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
                      </div>
                      {/* Score ring */}
                      <div className="relative h-11 w-11 shrink-0 ml-3">
                        <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/20" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${score * 0.975} 100`} className={score >= 60 ? "text-green-500" : score >= 30 ? "text-yellow-500" : "text-red-500"} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{score}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STAGE_COLORS[project.stage]}`}>
                        {STAGES.find((s) => s.id === project.stage)?.label}
                      </span>
                      <span className="rounded-full bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                        {vertical?.label}
                      </span>
                      {project.priority >= 2 && <span className="rounded-full bg-red-500/10 text-red-400 px-2 py-0.5 text-[10px] font-medium">Prioridade</span>}
                    </div>

                    {topRec && (
                      <div className={`mt-3 rounded-lg border px-3 py-2 text-[11px] ${PRIORITY_COLORS[topRec.priority]}`}>
                        <span className="font-medium">{topRec.priority.toUpperCase()}:</span> {topRec.title}
                      </div>
                    )}
                  </div>

                  {/* Expandable tools */}
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                    className="w-full flex items-center justify-between px-4 py-2 border-t border-border/20 text-[11px] text-muted-foreground hover:bg-muted/10 transition-colors"
                  >
                    <span>{recs.length} acoes pendentes</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/20 p-4 space-y-3">
                      {/* Stage changer */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] text-muted-foreground">Estagio:</span>
                        {STAGES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => updateStage(project.id, s.id)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border transition-all ${project.stage === s.id ? STAGE_COLORS[s.id] : "border-border/20 text-muted-foreground hover:border-primary/30"}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {/* Tool statuses */}
                      <p className="text-[11px] text-muted-foreground font-medium">Google Tools:</p>
                      <div className="space-y-1.5">
                        {GOOGLE_TOOLS.slice(0, 10).map((tool) => {
                          const ts = project.toolStatuses.find((t) => t.toolId === tool.id);
                          const currentStatus = ts?.status || "not_started";
                          return (
                            <div key={tool.id} className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-foreground truncate flex-1">{tool.name}</span>
                              <select
                                value={currentStatus}
                                onChange={(e) => updateToolStatus(project.id, tool.id, e.target.value as ToolStatus)}
                                className={`h-6 rounded border text-[10px] px-1.5 outline-none ${STATUS_CONFIG[currentStatus].bg} ${STATUS_CONFIG[currentStatus].color} border-border/20`}
                              >
                                <option value="not_started">Pendente</option>
                                <option value="in_progress">Em andamento</option>
                                <option value="configured">Configurado</option>
                                <option value="active">Ativo</option>
                                <option value="not_applicable">N/A</option>
                                <option value="issue">Problema</option>
                              </select>
                            </div>
                          );
                        })}
                      </div>

                      {/* Recommendations */}
                      {recs.length > 0 && (
                        <>
                          <p className="text-[11px] text-muted-foreground font-medium mt-3">Proximas acoes:</p>
                          <div className="space-y-1.5">
                            {recs.slice(0, 3).map((r) => (
                              <a
                                key={r.toolId}
                                href={r.setupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] hover:bg-muted/10 transition-colors ${PRIORITY_COLORS[r.priority]}`}
                              >
                                <div className="flex-1">
                                  <span className="font-medium">{r.title}</span>
                                  <p className="text-muted-foreground mt-0.5">{r.reason}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                                  <Clock className="h-3 w-3" />{r.estimatedTime}
                                </div>
                              </a>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Recommendations View */}
        {activeTab === "recommendations" && (
          <div className="space-y-2">
            {allRecommendations.slice(0, 50).map(({ project, rec }, i) => (
              <a
                key={`${project.id}-${rec.toolId}-${i}`}
                href={rec.setupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-muted/10 transition-colors ${PRIORITY_COLORS[rec.priority]}`}
              >
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_COLORS[rec.priority]}`}>
                  {rec.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{project.name} — {rec.reason}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />{rec.estimatedTime}
                  <ExternalLink className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Intelligence View */}
        {activeTab === "intelligence" && (
          <div className="space-y-6">
            {/* Health + Concentration + Pipeline Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/30 bg-card/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saude do Portfolio</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-bold ${intelligence.portfolioHealth >= 60 ? "text-green-500" : intelligence.portfolioHealth >= 35 ? "text-yellow-500" : "text-red-500"}`}>
                    {intelligence.portfolioHealth}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1">/100</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {intelligence.portfolioHealth >= 60 ? "Portfolio saudavel. Foco em escalar o que funciona." : intelligence.portfolioHealth >= 35 ? "Precisa de atencao. Muitas lacunas nos projetos ativos." : "Critico. Projetos sem infraestrutura basica."}
                </p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Concentracao</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-foreground">{intelligence.concentrationIndex}</span>
                  <span className="text-sm text-muted-foreground mb-1">/100</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {intelligence.concentrationIndex >= 70 ? "Foco concentrado. Poucos projetos recebem prioridade." : intelligence.concentrationIndex >= 40 ? "Foco moderado. Equilibrio entre projetos." : "Esforco disperso. Muitos projetos com prioridade alta."}
                </p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {intelligence.pipeline.map((stage, si) => (
                    <div key={stage.stage} className="flex items-center gap-1">
                      <div className="text-center">
                        <span className="text-lg font-bold">{stage.count}</span>
                        <p className="text-[9px] text-muted-foreground">{stage.label}</p>
                      </div>
                      {si < intelligence.pipeline.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 mx-1" />}
                    </div>
                  ))}
                </div>
                {intelligence.pipeline.find((p) => p.blockers.length > 0) && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Gargalo: {intelligence.pipeline.filter((p) => p.blockers.length > 0).map((p) => `${p.label} (falta ${p.blockers[0]})`).join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Strategic Actions */}
            {intelligence.topStrategicActions.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Acoes Estrategicas Prioritarias</span>
                </div>
                <div className="space-y-2">
                  {intelligence.topStrategicActions.map((action, i) => (
                    <div key={i} className="flex gap-3 text-[12px] text-foreground leading-relaxed">
                      <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">{i + 1}</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" /> Insights Cruzados ({intelligence.insights.length})
              </h3>
              <div className="space-y-2">
                {intelligence.insights.map((insight) => {
                  const isOpen = expandedInsight === insight.id;
                  const severityColors: Record<InsightSeverity, string> = {
                    critical: "border-red-500/20 bg-red-500/5",
                    high: "border-orange-500/20 bg-orange-500/5",
                    medium: "border-yellow-500/20 bg-yellow-500/5",
                    info: "border-blue-500/20 bg-blue-500/5",
                  };
                  const severityBadge: Record<InsightSeverity, string> = {
                    critical: "bg-red-500/10 text-red-500",
                    high: "bg-orange-500/10 text-orange-500",
                    medium: "bg-yellow-500/10 text-yellow-500",
                    info: "bg-blue-500/10 text-blue-500",
                  };
                  const typeIcons: Record<InsightType, typeof Brain> = {
                    synergy: Link2,
                    bottleneck: AlertTriangle,
                    opportunity: ArrowUpRight,
                    risk: Shield,
                    resource: Target,
                    strategic: Lightbulb,
                  };
                  const TypeIcon = typeIcons[insight.type];
                  const relatedNames = insight.relatedProjects
                    .map((id) => projects.find((p) => p.id === id)?.name)
                    .filter(Boolean);

                  return (
                    <div key={insight.id} className={`rounded-xl border overflow-hidden ${severityColors[insight.severity]}`}>
                      <button
                        onClick={() => setExpandedInsight(isOpen ? null : insight.id)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/5 transition-colors"
                      >
                        <TypeIcon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${severityBadge[insight.severity]}`}>
                              {insight.severity}
                            </span>
                            <span className="rounded-full bg-muted/30 px-2 py-0.5 text-[9px] text-muted-foreground">
                              {insight.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{insight.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{insight.description}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-inherit space-y-3">
                          <div className="mt-3">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contexto</p>
                            <p className="text-[12px] text-foreground leading-relaxed">{insight.context}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Acao Recomendada</p>
                            <p className="text-[12px] text-foreground leading-relaxed font-medium">{insight.action}</p>
                          </div>
                          {relatedNames.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Projetos Envolvidos</p>
                              <div className="flex flex-wrap gap-1">
                                {relatedNames.map((name) => (
                                  <span key={name} className="rounded-full bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">{name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {insight.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {insight.tags.map((tag) => (
                                <span key={tag} className="text-[9px] text-muted-foreground/60">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vertical Clusters */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Clusters por Vertical
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {intelligence.verticalClusters.map((cluster) => (
                  <div key={cluster.vertical} className="rounded-xl border border-border/30 bg-card/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{cluster.label}</span>
                      <span className={`text-xs font-bold ${cluster.avgScore >= 50 ? "text-green-500" : cluster.avgScore >= 25 ? "text-yellow-500" : "text-red-500"}`}>
                        {cluster.avgScore} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                      <span>{cluster.projects.length} projetos</span>
                      <span>|</span>
                      <span>{cluster.revenueProjects} com receita</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {Object.entries(cluster.stageDistribution).map(([stage, count]) => (
                        <span key={stage} className={`rounded-full px-1.5 py-0.5 text-[9px] ${STAGE_COLORS[stage]}`}>
                          {count} {STAGES.find((s) => s.id === stage)?.label}
                        </span>
                      ))}
                    </div>
                    {cluster.topGap && (
                      <p className="text-[10px] text-orange-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Maior lacuna: {cluster.topGap}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic View */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" /> Distribuicao Geografica
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {intelligence.geoClusters.map((geo) => (
                  <div key={geo.country} className="rounded-xl border border-border/30 bg-card/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{geo.label}</span>
                      <span className="text-xs text-muted-foreground">{geo.country}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{geo.projects.length} projetos | Score medio: {geo.avgScore}</p>
                    <div className="space-y-1">
                      {geo.projects.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-[11px]">
                          <span className="truncate">{p.name}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${STAGE_COLORS[p.stage]}`}>
                            {STAGES.find((s) => s.id === p.stage)?.label}
                          </span>
                        </div>
                      ))}
                      {geo.projects.length > 5 && (
                        <p className="text-[10px] text-muted-foreground">+{geo.projects.length - 5} mais</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synergies */}
            {intelligence.synergies.filter((s) => s.strength !== "weak").length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4" /> Sinergias Detectadas
                </h3>
                <div className="space-y-2">
                  {intelligence.synergies
                    .filter((s) => s.strength !== "weak")
                    .slice(0, 15)
                    .map((syn, i) => {
                      const source = projects.find((p) => p.id === syn.sourceId);
                      const target = projects.find((p) => p.id === syn.targetId);
                      if (!source || !target) return null;
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-border/20 bg-card/30 px-4 py-2.5">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${syn.strength === "strong" ? "bg-green-500" : "bg-yellow-500"}`} />
                          <div className="flex-1 min-w-0 text-[12px]">
                            <span className="font-medium">{source.name}</span>
                            <span className="text-muted-foreground mx-2">↔</span>
                            <span className="font-medium">{target.name}</span>
                            <span className="text-muted-foreground ml-2">— {syn.reason}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 shrink-0">
                            {syn.sharedAssets.slice(0, 3).map((asset) => (
                              <span key={asset} className="rounded-full bg-muted/30 px-1.5 py-0.5 text-[9px] text-muted-foreground">{asset}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Matrix View */}
        {activeTab === "matrix" && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground sticky left-0 bg-background min-w-[160px]">Projeto</th>
                  <th className="py-2 px-1 font-medium text-muted-foreground">Stage</th>
                  <th className="py-2 px-1 font-medium text-muted-foreground">Score</th>
                  {GOOGLE_TOOLS.slice(0, 12).map((t) => (
                    <th key={t.id} className="py-2 px-1 font-medium text-muted-foreground text-center" title={t.name}>
                      {t.name.replace("Google ", "").slice(0, 6)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const score = calculateReadinessScore(p);
                  return (
                    <tr key={p.id} className="border-b border-border/10 hover:bg-muted/5">
                      <td className="py-2 px-2 font-medium sticky left-0 bg-background">{p.name}</td>
                      <td className="py-2 px-1 text-center">
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${STAGE_COLORS[p.stage]}`}>
                          {STAGES.find((s) => s.id === p.stage)?.label}
                        </span>
                      </td>
                      <td className="py-2 px-1 text-center font-bold">
                        <span className={score >= 60 ? "text-green-500" : score >= 30 ? "text-yellow-500" : "text-red-500"}>
                          {score}
                        </span>
                      </td>
                      {GOOGLE_TOOLS.slice(0, 12).map((tool) => {
                        const ts = p.toolStatuses.find((s) => s.toolId === tool.id);
                        const status = ts?.status || "not_started";
                        const dot = status === "active" ? "bg-green-500" : status === "configured" ? "bg-blue-500" : status === "in_progress" ? "bg-yellow-500" : status === "issue" ? "bg-red-500" : status === "not_applicable" ? "bg-muted/30" : "bg-muted/50";
                        return (
                          <td key={tool.id} className="py-2 px-1 text-center">
                            <div className={`h-2.5 w-2.5 rounded-full mx-auto ${dot}`} title={`${tool.name}: ${STATUS_CONFIG[status].label}`} />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> Ativo</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-500" /> Configurado</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-yellow-500" /> Em andamento</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500" /> Problema</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-muted/50" /> Pendente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
