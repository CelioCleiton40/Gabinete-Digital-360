# 🏛️ Documentação de Projeto: Gabinete Digital 360

**Status:** Finalizada para Desenvolvimento | **Versão:** 3.0 | **Referência:** 2025/2026

---

## 1. Escopo e Propósito

O **Gabinete Digital 360** é um sistema de Gestão de Mandato e Relacionamento com o Eleitor (Political CRM). Ele foi desenhado para operar na "nuvem" (SaaS) com foco em segurança de dados (LGPD) e integração total com o canal oficial da política brasileira: o **WhatsApp**.

---

## 2. Arquitetura de Software (The Stack)

A escolha das tecnologias visa **baixo custo operacional** e **alta velocidade de desenvolvimento**.

*   **Frontend:** Next.js 15 (App Router) + Tailwind CSS + Shadcn/UI.
*   **Backend & DB:** Supabase (PostgreSQL) + Row Level Security (RLS).
*   **Processamento Assíncrono:** Supabase Edge Functions (Deno).
*   **Pagamentos:** Stripe (Checkout + Billing).
*   **WhatsApp API:** Evolution API (Self-hosted em Docker/VPS).
*   **Documentos (PDF):** React-pdf ou Satori (para geração de ofícios).

---

## 3. Estrutura de Banco de Dados (Schema Relacional)

```sql
-- HABILITAR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. MANDATOS (TENANTS)
CREATE TABLE mandatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_parlamentar TEXT NOT NULL,
  cargo TEXT CHECK (cargo IN ('vereador', 'deputado_estadual', 'deputado_federal', 'prefeito')),
  municipio_estado TEXT,
  stripe_customer_id TEXT UNIQUE,
  status_assinatura TEXT DEFAULT 'pendente', -- pendente, ativo, atrasado, cancelado
  config_identidade JSONB, -- Logo, cores do mandato, papel timbrado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USUÁRIOS (EQUIPE)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  mandato_id UUID REFERENCES mandatos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  nivel_acesso TEXT DEFAULT 'assessor', -- admin (chefe), assessor, campo (liderança)
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ELEITORES (BASE DE DADOS)
CREATE TABLE eleitores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_id UUID REFERENCES mandatos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf_criptografado TEXT, -- PGP_SYM_ENCRYPT
  cpf_hash TEXT, -- Para buscas rápidas (Blind Index)
  whatsapp TEXT NOT NULL,
  data_nascimento DATE,
  bairro TEXT,
  cidade TEXT,
  lideranca_id UUID REFERENCES usuarios(id),
  tags TEXT[] DEFAULT '{}', -- ex: ['Igreja', 'Oposição', 'Saúde']
  consentimento_lgpd BOOLEAN DEFAULT false,
  metadata JSONB, -- Informações extras flexíveis
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEMANDAS (GESTÃO DE TICKETS)
CREATE TABLE demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_id UUID REFERENCES mandatos(id) ON DELETE CASCADE,
  eleitor_id UUID REFERENCES eleitores(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT, -- Saúde, Infra, Educação, etc.
  status TEXT DEFAULT 'aberto', -- aberto, em_tramite, oficiado, concluido
  prioridade TEXT DEFAULT 'media',
  anexos_url TEXT[], -- Links do Supabase Storage
  protocolo_externo TEXT, -- Número gerado pela prefeitura/órgão
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data_conclusao TIMESTAMPTZ
);

-- 5. OFÍCIOS (GERADOR DE DOCUMENTOS)
CREATE TABLE oficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_id UUID REFERENCES mandatos(id),
  demanda_id UUID REFERENCES demandas(id),
  numero_oficio TEXT, -- Ex: 045/2025
  destinatario TEXT, -- Ex: Secretaria de Obras
  conteudo_html TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDITORIA (LOGS)
CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_id UUID REFERENCES mandatos(id),
  usuario_id UUID REFERENCES usuarios(id),
  acao TEXT, -- EXPORT_BASE, DELETE_ELEITOR, VIEW_SENSITIVE
  detalhes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Segurança e Isolamento (RLS Políticas)

Para que um gabinete **nunca** veja os dados de outro:

```sql
ALTER TABLE eleitores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Isolamento por Mandato" ON eleitores
FOR ALL USING (
  mandato_id IN (
    SELECT mandato_id FROM usuarios WHERE id = auth.uid()
  )
);
```

---

## 5. Fluxo de Integração Stripe (Estratégia 5k + 1.5k)

1.  **Venda Presencial/WhatsApp:** O vendedor envia o link do Stripe Checkout.
2.  **Configuração do Produto:**
    *   **Price ID 1 (Setup):** R$ 5.000,00 (One-time).
    *   **Price ID 2 (Mensal):** R$ 1.520,00 (Recurring).
3.  **Webhook Handling:**
    *   Ao receber `checkout.session.completed`, a Edge Function do Supabase cria o `mandato`, o primeiro `usuario` (admin) e dispara o e-mail de boas-vindas.
    *   Em caso de `invoice.payment_failed`, o status do mandato muda para `inativo`, bloqueando o login via RLS.

---

## 6. Módulo WhatsApp (Intelligence Gateway)

Integração com a **Evolution API**:

*   **Webhook de Entrada:** Mensagens recebidas são filtradas. Se conter palavras como "ajuda", "buraco", "asfalto", o sistema cria um alerta no dashboard.
*   **Bot de Cadastro:** Se o número não estiver no banco, o bot pergunta: *"Olá! Sou o assistente do Deputado X. Para iniciarmos seu atendimento, qual seu nome completo e bairro?"*.
*   **Envio de Ofício:** Assim que o assessor resolve uma demanda, o sistema oferece um botão: **[Enviar comprovante via WhatsApp]**.

---

## 7. Diferenciais Técnicos (O que te faz vender)

1.  **Gerador de Ofícios Automático:** Transforma uma demanda em um documento oficial PDF em 2 segundos.
2.  **Relatório de Impacto:** Gráficos que mostram quantos votos em potencial o político está "cultivando" por bairro.
3.  **Mapa de Calor:** Visualização geográfica das demandas para planejar visitas de campo.
4.  **Exportação de Auditoria:** O político tem a prova legal de que o gabinete segue a LGPD.

---

## 8. Cronograma de Desenvolvimento (Sprint 45 Dias)

*   **Semana 1:** Setup Infra (Supabase + Auth + RLS) e CRUD de Eleitores.
*   **Semana 2:** Módulo de Demandas (Kanban) e Gerenciamento de Equipe.
*   **Semana 3:** Integração Stripe e Setup do Servidor de WhatsApp (Evolution API).
*   **Semana 4:** Gerador de PDF (Ofícios) e Dashboards de métricas.
*   **Semana 5:** Testes de estresse, Segurança LGPD e Refinamento de UI.
*   **Semana 6:** Onboarding do primeiro cliente "Beta".

---

## 9. Custos Operacionais Estimados (por Cliente)

*   **Supabase (Plano Pro):** $25/mês (atende vários mandatos pequenos).
*   **VPS para Evolution API:** $10/mês (DigitalOcean/Hetzner).
*   **Stripe:** ~R$ 75,00 por mensalidade (Taxas).
*   **Margem Líquida:** > 80% de lucro sobre a mensalidade.
