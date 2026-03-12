import type { Project } from "@/lib/commercializationEngine";

// Seed data for all projects
export const PROJECTS_SEED: Omit<Project, "toolStatuses">[] = [
  // FOOD & DELIVERY
  { id: "1", name: "Grupo Rao", slug: "grupo-rao", description: "Maior rede de delivery do Brasil. 20+ marcas, 200+ unidades, 10 estados + Portugal.", vertical: "food", stage: "scaling", primaryUrl: "https://mundorao.com.br", country: "BR", revenueRange: "50m_plus", tags: ["franquia", "delivery", "super-app"], priority: 2, archived: false },
  { id: "2", name: "Rob Food", slug: "rob-food", description: "Holding de hamburgueres: Rao Burger, Ogro Steaks, Bob Beef, Zenha. Dark kitchen compartilhada.", vertical: "food", stage: "live", primaryUrl: "", country: "BR", revenueRange: "1m_10m", tags: ["hamburgueres", "dark-kitchen"], priority: 1, archived: false },
  { id: "3", name: "FM&Kitchens", slug: "fm-kitchens", description: "Equipamentos para cozinhas profissionais do ecossistema Rao.", vertical: "food", stage: "live", primaryUrl: "", country: "BR", revenueRange: "1m_10m", tags: ["equipamentos", "b2b"], priority: 0, archived: false },
  { id: "4", name: "Hunters Cookie", slug: "hunters-cookie", description: "Marca de cookies artesanais.", vertical: "food", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["cookies", "marca-propria"], priority: 0, archived: false },
  { id: "5", name: "Oliver's Pizza", slug: "olivers-pizza", description: "Marca parceira de pizza com memorando de entendimentos.", vertical: "food", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["pizza", "parceiro"], priority: 0, archived: false },
  { id: "6", name: "NBA Burguer", slug: "nba-burguer", description: "Marca de hamburgueres.", vertical: "food", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["hamburgueres"], priority: 0, archived: false },
  { id: "7", name: "Cozinheiro Amador", slug: "cozinheiro-amador", description: "Livro e curso de culinaria com IA.", vertical: "content", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["livro", "curso", "ia"], priority: 0, archived: false },
  { id: "8", name: "Delivery Sem Prejuizo", slug: "delivery-sem-prejuizo", description: "Conteudo e livro sobre delivery lucrativo.", vertical: "content", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["livro", "conteudo"], priority: 0, archived: false },

  // TECH & SAAS
  { id: "10", name: "NaiA", slug: "naia", description: "Infraestrutura agent-ready para e-commerce. Diagnostico + implementacao.", vertical: "tech", stage: "live", primaryUrl: "https://naia.com.br", country: "BR", revenueRange: "pre_revenue", tags: ["ai", "e-commerce", "agent-ready"], priority: 2, archived: false },
  { id: "11", name: "Sales Brain AI", slug: "sales-brain-ai", description: "CRM com IA: pipeline visual, scoring de leads, analytics.", vertical: "tech", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["crm", "ia", "saas"], priority: 1, archived: false },
  { id: "12", name: "ajuda.ai", slug: "ajuda-ai", description: "Secretaria particular com IA.", vertical: "tech", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["ia", "assistente"], priority: 0, archived: false },
  { id: "13", name: "Fundier Systems", slug: "fundier-systems", description: "Metodo AE, automacao, manifesto interno.", vertical: "tech", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["automacao", "metodo"], priority: 0, archived: false },
  { id: "14", name: "Cortex3", slug: "cortex3", description: "Livro + framework: empresas que pensam como redes neurais.", vertical: "tech", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["livro", "framework", "neural"], priority: 1, archived: false },
  { id: "15", name: "Pernin.IA", slug: "pernin-ia", description: "Projeto IA.", vertical: "tech", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["ia"], priority: 0, archived: false },

  // RETAIL & COMMERCE
  { id: "20", name: "Peggo Market", slug: "peggo-market", description: "Marketplace e e-commerce.", vertical: "retail", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["marketplace", "e-commerce"], priority: 1, archived: false },
  { id: "21", name: "Rao Supply & ComEx", slug: "rao-supply", description: "Importacao da China para o ecossistema Rao.", vertical: "retail", stage: "live", primaryUrl: "", country: "BR", revenueRange: "1m_10m", tags: ["importacao", "china", "supply"], priority: 1, archived: false },
  { id: "22", name: "MACRO BOX", slug: "macro-box", description: "Produto/conceito de embalagem ou kit.", vertical: "retail", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["produto"], priority: 0, archived: false },
  { id: "23", name: "Repasse360", slug: "repasse360", description: "Plataforma de repasse de negocios.", vertical: "retail", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["marketplace", "repasse"], priority: 0, archived: false },

  // WELLNESS & HEALTH
  { id: "30", name: "Bruk Tech Wellness", slug: "bruk-tech-wellness", description: "Plataforma de bem-estar digital.", vertical: "wellness", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["wellness", "tech"], priority: 0, archived: false },
  { id: "31", name: "The Circle", slug: "the-circle", description: "Clube de performance, conceito Soho House do esporte de praia.", vertical: "sports", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["clube", "esporte", "praia"], priority: 0, archived: false },
  { id: "32", name: "Dra Erika", slug: "dra-erika", description: "Projeto de saude.", vertical: "wellness", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["saude"], priority: 0, archived: false },
  { id: "33", name: "Circle Wellness Hub", slug: "circle-wellness", description: "Hub de bem-estar.", vertical: "wellness", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["wellness"], priority: 0, archived: false },

  // LOGISTICS
  { id: "40", name: "Last Mile", slug: "last-mile", description: "Projeto de logistica/delivery.", vertical: "logistics", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["logistica", "delivery"], priority: 0, archived: false },
  { id: "41", name: "+1 km", slug: "mais-1km", description: "Projeto logistico.", vertical: "logistics", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["logistica"], priority: 0, archived: false },

  // FINANCE & INVESTMENTS
  { id: "50", name: "Long View", slug: "long-view", description: "Venture com FAQ institucional, contexto para parceiros.", vertical: "finance", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["venture", "institucional"], priority: 1, archived: false },
  { id: "51", name: "Capital Sphere", slug: "capital-sphere", description: "Projeto financeiro/investimentos.", vertical: "finance", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["financeiro"], priority: 0, archived: false },
  { id: "52", name: "Lav Hub", slug: "lav-hub", description: "Franquia de lavanderia autonoma, roadmap para BEE4.", vertical: "finance", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["franquia", "lavanderia", "bee4"], priority: 1, archived: false },

  // INTERNATIONAL
  { id: "60", name: "Grupo +351", slug: "grupo-351", description: "Operacoes e portfolio em Portugal.", vertical: "international", stage: "live", primaryUrl: "", country: "PT", revenueRange: "1m_10m", tags: ["portugal", "expansao"], priority: 1, archived: false },
  { id: "61", name: "Conexao LATAM", slug: "conexao-latam", description: "Plataforma de estruturacao empresarial no Paraguai.", vertical: "international", stage: "idea", primaryUrl: "", country: "PY", revenueRange: "pre_revenue", tags: ["paraguai", "latam"], priority: 0, archived: false },
  { id: "62", name: "Hidden USA", slug: "hidden-usa", description: "Projeto nos EUA.", vertical: "international", stage: "idea", primaryUrl: "", country: "US", revenueRange: "pre_revenue", tags: ["eua"], priority: 0, archived: false },
  { id: "63", name: "Rao Pt", slug: "rao-pt", description: "Operacao Rao em Portugal.", vertical: "international", stage: "live", primaryUrl: "", country: "PT", revenueRange: "1m_10m", tags: ["portugal", "rao"], priority: 1, archived: false },
  { id: "64", name: "THALAMUS", slug: "thalamus", description: "Cerebro de sourcing: conecta China ao ecossistema.", vertical: "international", stage: "mvp", primaryUrl: "", country: "CN", revenueRange: "pre_revenue", tags: ["china", "sourcing"], priority: 1, archived: false },

  // PHYSICAL PRODUCTS
  { id: "70", name: "Grid BackPack / Axis", slug: "grid-backpack", description: "Mochila com design inovador.", vertical: "product", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["mochila", "produto-fisico"], priority: 0, archived: false },
  { id: "71", name: "Forge & Flow 3D", slug: "forge-flow-3d", description: "Impressao 3D.", vertical: "product", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["3d", "impressao"], priority: 0, archived: false },

  // SPORTS
  { id: "80", name: "Cortex FC", slug: "cortex-fc", description: "Sistema de analytics futebolistico com IA.", vertical: "sports", stage: "mvp", primaryUrl: "http://localhost:3000", country: "BR", revenueRange: "pre_revenue", tags: ["futebol", "analytics", "ia"], priority: 1, archived: false },
  { id: "81", name: "Voa Canarinho", slug: "voa-canarinho", description: "Projeto com tema patriotico.", vertical: "sports", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["patriotico"], priority: 0, archived: false },

  // OTHER
  { id: "90", name: "Innova SA", slug: "innova-sa", description: "Empresa com acordo de socios, parceiro Valter.", vertical: "other", stage: "mvp", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["sociedade"], priority: 0, archived: false },
  { id: "91", name: "VENHA", slug: "venha", description: "Projeto com documento mestre de contexto.", vertical: "other", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: [], priority: 0, archived: false },
  { id: "92", name: "Guard", slug: "guard", description: "Projeto de seguranca.", vertical: "other", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["seguranca"], priority: 0, archived: false },
  { id: "93", name: "Go By Tesla", slug: "go-by-tesla", description: "Projeto de mobilidade.", vertical: "other", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["mobilidade", "tesla"], priority: 0, archived: false },
  { id: "94", name: "Imovel Now", slug: "imovel-now", description: "Projeto imobiliario.", vertical: "real_estate", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["imobiliario"], priority: 0, archived: false },
  { id: "95", name: "Casarao", slug: "casarao", description: "Espaco ou marca.", vertical: "real_estate", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: [], priority: 0, archived: false },
  { id: "96", name: "Escola da Saidera", slug: "escola-da-saidera", description: "Projeto educacional.", vertical: "content", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["educacao"], priority: 0, archived: false },
  { id: "97", name: "Payroll App", slug: "payroll-app", description: "App de folha de pagamento.", vertical: "tech", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["rh", "payroll"], priority: 0, archived: false },
  { id: "98", name: "Cultura Builder", slug: "cultura-builder", description: "Cultura empresarial.", vertical: "other", stage: "idea", primaryUrl: "", country: "BR", revenueRange: "pre_revenue", tags: ["cultura"], priority: 0, archived: false },
];
