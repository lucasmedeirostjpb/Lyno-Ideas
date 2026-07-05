-- Tabela para armazenar as reações de satisfação
CREATE TABLE satisfacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 10),
  comentario TEXT
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE satisfacao ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público/anônimo
CREATE POLICY "Qualquer pessoa pode enviar satisfacao"
  ON satisfacao FOR INSERT
  WITH CHECK (true);
