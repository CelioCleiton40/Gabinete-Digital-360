
-- 7. TRANSAÇÕES FINANCEIRAS (GESTÃO DE CAIXA)
CREATE TABLE IF NOT EXISTS transacoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_id UUID REFERENCES mandatos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL, -- Suporta valores até 99.999.999,99
  tipo TEXT CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT, -- Verba Indenizatória, Pessoal, Infra, etc.
  data DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para transacoes_financeiras
ALTER TABLE transacoes_financeiras ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'transacoes_financeiras'
        AND policyname = 'Isolamento por Mandato Financeiro'
    ) THEN
        CREATE POLICY "Isolamento por Mandato Financeiro" ON transacoes_financeiras
        FOR ALL USING (
          mandato_id IN (
            SELECT mandato_id FROM usuarios WHERE id = auth.uid()
          )
        );
    END IF;
END
$$;
