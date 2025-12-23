# 🏛️ Gabinete Digital 360

![Status](https://img.shields.io/badge/Status-Concluído-success)
![Versão](https://img.shields.io/badge/Versão-1.2.0-blue)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Supabase-blueviolet)
![License](https://img.shields.io/badge/License-MIT-green)

> **A revolução na gestão de mandatos políticos.**
> Um sistema SaaS completo para Vereadores, Prefeitos e Deputados modernizarem seus gabinetes.

---

## 📋 Sobre o Projeto

O **Gabinete Digital 360** é uma plataforma desenvolvida para otimizar a rotina legislativa e executiva. O sistema centraliza a gestão de eleitores, o acompanhamento de demandas da população e a organização da equipe do gabinete, substituindo planilhas e papéis por uma interface moderna, responsiva e inteligente.

### 🎯 Objetivo
Facilitar a tomada de decisão política através de dados, garantindo que nenhuma solicitação do cidadão fique sem resposta.

---

## 🚀 Funcionalidades

### 📊 Dashboard Inteligente
*   **KPIs em Tempo Real:** Total de eleitores, demandas abertas e atendimentos realizados no dia (dados reais do banco).
*   **Filtro de Cidades:** Visualize métricas específicas por município selecionado.
*   **Gráficos Interativos:** Distribuição de demandas por categoria e ranking de bairros.

### 🗺️ Mapa Eleitoral Interativo (Mossoró/RN)
*   **Georreferenciamento:** Mapa detalhado com polígonos dos bairros de Mossoró.
*   **Mapa de Calor (Heatmap):** Visualização de densidade eleitoral com gradiente de cores (Penetração %).
*   **Filtros de Bairro:** Dropdown interativo para focar em regiões específicas.
*   **Dados Detalhados:** Tooltips com contagem de eleitores cadastrados vs. total oficial estimado.

### 👥 Gestão de Eleitores (CRM Político)
*   **Cadastro Completo:** Armazenamento seguro de dados dos cidadãos com integração ao banco de dados.
*   **Integração WhatsApp:** Botão "Click-to-Chat" direto na lista de eleitores.
*   **Histórico:** Vínculo automático de todas as demandas solicitadas por cada eleitor.

### 📝 Controle de Demandas (Kanban)
*   **Fluxo Visual:** Quadro Kanban (Aberto → Em Trâmite → Concluído) para gestão ágil.
*   **Priorização:** Classificação por urgência (Alta, Média, Baixa).
*   **Integração Total:** Todas as demandas são salvas e persistidas no Supabase.

### 🤖 Redator Inteligente (IA)
*   **Geração de Documentos:** Criação automática de Ofícios, Moções e Projetos de Lei usando modelos inteligentes.
*   **Histórico de Documentos:** Salvamento automático de todos os documentos gerados para consulta futura.
*   **Exportação PDF:** Geração instantânea de PDFs oficiais formatados.

### 💰 Gestão Financeira Completa
*   **Controle de Caixa:** Monitoramento de Receitas (Doações, Verbas) e Despesas (Pessoal, Material).
*   **Gráficos de Balanço:** Comparativo visual de Entradas vs. Saídas no mês.
*   **Gestão de Transações:** CRUD completo de lançamentos financeiros com categorias personalizadas.
*   **KPIs Financeiros:** Saldo atual em tempo real e indicadores de saúde financeira.

### ⚖️ Prestação de Contas (Compliance)
*   **Gestão de Cota Parlamentar (CEAP):** Monitoramento visual do limite de gastos mensais.
*   **Status de Regularidade:** Alertas sobre pendências e análise de documentação.
*   **Auditoria:** Registro detalhado de fornecedores e categorias de despesa para prestação de contas oficial.

### 📈 Relatórios Gerenciais
*   **Exportação Personalizada:** Geração de relatórios em PDF baseados em dados reais.
*   **Módulos Suportados:** Relatórios de Eleitores, Demandas e Financeiro.

### 🔐 Segurança e Acesso
*   **Níveis de Permissão:** Controle granular para Administradores, Assessores e Lideranças de Campo.
*   **Autenticação Robusta:** Sistema de login seguro via Supabase Auth.
*   **Multi-Tenancy:** Cada usuário vê apenas os dados do seu próprio mandato (RLS - Row Level Security).

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando as melhores práticas de desenvolvimento web moderno:

*   **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estática rigorosa)
*   **Mapas:** [React Leaflet](https://react-leaflet.js.org/) + [Leaflet](https://leafletjs.com/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
*   **Backend (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
*   **Visualização de Dados:** [Recharts](https://recharts.org/)
*   **Geração de Documentos:** [@react-pdf/renderer](https://react-pdf.org/)
*   **Testes:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

---

## 📂 Estrutura do Projeto

```bash
src/
├── components/        # Componentes Reutilizáveis (UI, Layout, PDF, Mapa)
├── contexts/          # Context API (AuthContext)
├── data/              # Dados Estáticos (GeoJSON Mossoró)
├── lib/               # Configurações de bibliotecas (Supabase, Utils)
├── pages/             # Páginas da Aplicação (Rotas)
│   ├── Demandas.tsx       # Módulo Kanban
│   ├── Eleitores.tsx      # Módulo CRM
│   ├── Financeiro.tsx     # Módulo Financeiro
│   ├── Documentos.tsx     # Módulo IA/Redator
│   ├── PrestacaoContas.tsx # Módulo Compliance
│   ├── Home.tsx           # Dashboard Principal
│   └── ...
└── App.tsx            # Roteamento Principal
```

---

## 📦 Instalação e Execução

### Pré-requisitos
*   Node.js (v18+)
*   NPM ou Yarn

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/gabinete-digital-360.git
    cd gabinete-digital-360
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente:**
    Crie um arquivo `.env` na raiz com suas chaves do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima
    ```

4.  **Inicie o Servidor (Desenvolvimento):**
    ```bash
    npm run dev
    # Para expor na rede local (mobile):
    npm run dev -- --host
    ```
    O sistema estará acessível em `http://localhost:5173`.

---

## 🧪 Testes e Qualidade

Para garantir a estabilidade do sistema, execute os comandos de verificação:

*   **Testes Unitários:** `npm test` (Executa Vitest)
*   **Verificação de Tipos:** `npm run check` (TypeScript Check)
*   **Linting:** `npm run lint`

---

## 💡 Dica de Demonstração (Seed)

O sistema possui um **Gerador de Dados Fictícios** integrado para facilitar apresentações e testes de carga:

1.  Faça login no sistema.
2.  Acesse o menu **Configurações**.
3.  Clique no botão **"Gerar Dados Fictícios (Seed)"**.
4.  O sistema populará automaticamente o banco de dados com:
    *   Eleitores com endereços em bairros reais de Mossoró (para teste do mapa).
    *   Demandas e Transações Financeiras para popular os gráficos.

---

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

---
<p align="center">
  Desenvolvido com foco em soluções tecnológicas para transformar a política. <br />
  <b>Célio Cleiton - Eng. de Software</b>
</p>
