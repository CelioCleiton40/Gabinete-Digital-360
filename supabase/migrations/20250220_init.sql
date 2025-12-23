-- HABILITAR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. MANDATOS (TENANTS)
CREATE TABLE IF NOT EXISTS mandatos (
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
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  mandato_id UUID REFERENCES mandatos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  nivel_acesso TEXT DEFAULT 'assessor', -- admin (chefe), assessor, campo (liderança)
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ELEITORES (BASE DE DADOS)
CREATE TABLE IF NOT EXISTS eleitores (
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
CREATE TABLE IF NOT EXISTS demandas (
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
CREATE TABLE IF NOT EXISTS oficios (
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
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_id UUID REFERENCES mandatos(id),
  usuario_id UUID REFERENCES usuarios(id),
  acao TEXT, -- EXPORT_BASE, DELETE_ELEITOR, VIEW_SENSITIVE
  detalhes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE eleitores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'eleitores'
        AND policyname = 'Isolamento por Mandato'
    ) THEN
        CREATE POLICY "Isolamento por Mandato" ON eleitores
        FOR ALL USING (
          mandato_id IN (
            SELECT mandato_id FROM usuarios WHERE id = auth.uid()
          )
        );
    END IF;
END
$$;
