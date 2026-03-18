# Cortex3 -- Portfolio Dashboard

![CI](https://github.com/institutoveigacabral-maker/cortex3-portfolio/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Dashboard de portfolio do ecossistema Cortex3. Visualizacao consolidada de todos os projetos e verticais de negocio do grupo, com motor de inteligencia que identifica sinergias, gargalos, oportunidades e riscos entre os projetos. Inclui engine de comercializacao com score de prontidao e recomendacoes automaticas.

## Stack Tecnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 (SWC) |
| Estilizacao | Tailwind CSS + Typography plugin |
| Roteamento | React Router 7 |
| Icones | Lucide React |
| Utilitarios CSS | clsx + tailwind-merge + class-variance-authority |
| Lint | ESLint 9 + typescript-eslint |
| Deploy | Static SPA (qualquer CDN) |

## Funcionalidades

- Dashboard consolidado com visao geral de todos os projetos do ecossistema
- Classificacao por verticais: Food, Tech, Retail, Content, Wellness, Logistics, Finance, Sports e mais
- Estagio de maturidade por projeto: Ideia, MVP, Live, Scaling
- Motor de inteligencia do portfolio (sinergias, gargalos, oportunidades, riscos)
- Engine de comercializacao com score de prontidao e recomendacoes
- Registro de ferramentas Google integradas por projeto
- Tooltips informativos em todos os cards
- Build otimizado com code splitting (vendor, router)
- CI automatizado via GitHub Actions

## Arquitetura

```
src/
├── components/         # Componentes visuais do dashboard
│   └── Tooltip.tsx     # Componente de tooltip reutilizavel
├── pages/
│   └── PortfolioDashboard.tsx  # Pagina principal do dashboard
├── data/
│   ├── projectsSeed.ts         # Base de dados dos projetos
│   ├── verticalDefinitions.ts  # Definicoes de verticais e estagios
│   └── googleToolsRegistry.ts  # Registro de ferramentas Google por projeto
├── lib/
│   ├── portfolioIntelligence.ts    # Motor de insights (sinergias, riscos, etc.)
│   └── commercializationEngine.ts  # Score de prontidao e recomendacoes
├── App.tsx             # Entry point da aplicacao com rotas
├── main.tsx            # Bootstrap do React
└── index.css           # Estilos globais (Tailwind)
```

### Motor de Inteligencia

O modulo `portfolioIntelligence.ts` analisa o portfolio e gera insights automaticos:

- **Sinergias** entre projetos com potencial de integracao
- **Gargalos** que limitam crescimento
- **Oportunidades** de mercado identificadas
- **Riscos** estrategicos e operacionais
- **Recursos** que podem ser compartilhados entre verticais

### Engine de Comercializacao

O modulo `commercializationEngine.ts` calcula:

- Score de prontidao comercial de cada projeto
- Recomendacoes priorizadas para avancar ao proximo estagio

## Setup Local

```bash
git clone https://github.com/institutoveigacabral-maker/cortex3-portfolio.git
cd cortex3-portfolio
npm install
npm run dev
```

O servidor inicia na porta 5180 com hot reload via Vite + SWC.

## Scripts

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 5180) |
| `npm run build` | Build de producao (TypeScript + Vite) |
| `npm run preview` | Preview do build de producao |
| `npm run lint` | Verifica codigo com ESLint |

## Deploy

O projeto gera um build estatico (SPA) que pode ser hospedado em qualquer CDN ou servico de hospedagem estatica:

```bash
npm run build
```

Os arquivos de producao sao gerados em `dist/`. O build inclui:
- Code splitting automatico (vendor React, router separados)
- CSS minificado
- Target ES2020 para compatibilidade ampla

O CI via GitHub Actions executa lint e build a cada push.

## Licenca

MIT -- ver [LICENSE](LICENSE).
