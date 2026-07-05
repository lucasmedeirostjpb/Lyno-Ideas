# Lyno Ideias – 15ª Fetech

Plataforma institucional e moderna de coleta de ideias para a **15ª Fetech (Feira Tecnológica de Campina Grande)**, desenvolvida sob demanda para o **Tribunal de Justiça da Paraíba (TJPB)** e o **Lyno (Laboratório de Inovação do PJPB)**.

O site permite que cidadãos, estudantes, pesquisadores e startups enviem soluções tecnológicas para três gargalos reais do judiciário paraibano. As ideias enviadas são salvas no banco de dados e exibidas instantaneamente em um mural interativo público de post-its animados (física de bouncing estilo "DVD logo"), otimizado para TVs e projetores na feira.

---

## 🎨 Identidade Visual & Design System

A aplicação foi desenvolvida seguindo diretrizes estéticas premium, combinando a sobriedade institucional do tribunal com o dinamismo de um hub de inovação:
* **Fundo Glacial Suave (`#f8f9ff`)**: Transmite um visual arejado e limpo.
* **Azul Marinho Profundo (`#0f172a`)**: Para elementos de autoridade, textos estruturais, cabeçalho e rodapé.
* **Ciano / Verde-Água Vibrante (`#2dd4bf`)**: Destaques visuais, botões de ação (CTAs) e links ativos.
* **Tipografia Atkinson Hyperlegible**: Fonte altamente legível e acessível importada do Google Fonts.

---

## 🚀 Estrutura de Rotas e Páginas

* `/` (Home): Apresentação da plataforma e grid para escolha dos 3 gargalos temáticos.
* `/gargalo/agilidade-processual`: Desafio de IA, automação e triagem de processos.
* `/gargalo/acessibilidade-inclusao`: Foco em interfaces empáticas, chatbots e acessibilidade digital.
* `/gargalo/sustentabilidade-administrativa`: Foco em eficiência energética, economia de papel e sustentabilidade nos fóruns.
* `/mural`: Mural interativo fullscreen com post-its bouncing quicando de forma fluida a 60fps (com suporte a arraste via mouse e toque em celulares).

---

## 🛡️ Proteção Anti-Spam

Para garantir a qualidade das ideias enviadas e evitar ataques automatizados na feira:
1. **Honeypot Invisível**: Um campo de formulário oculto via CSS. Robôs de spam que tentarem preencher todos os dados serão bloqueados silenciosamente.
2. **Tempo Mínimo de Preenchimento**: O servidor rejeita envios concluídos em menos de 3 segundos (tempo humanamente improvável para ler e digitar uma proposta real).
3. **Rate Limiting por IP**: Limitação básica de no máximo 1 envio a cada 10 segundos por endereço IP.

---

## 🗄️ Integração com o Banco de Dados (Supabase)

Para persistir os dados da plataforma, configure seu projeto no Supabase e execute as seguintes queries no **SQL Editor** do painel do Supabase:

### 1. Tabela de Ideias
```sql
CREATE TABLE ideias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  gargalo TEXT NOT NULL CHECK (gargalo IN (
    'agilidade-processual',
    'acessibilidade-inclusao', 
    'sustentabilidade-administrativa'
  )),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  perfil TEXT NOT NULL CHECK (perfil IN (
    'estudante', 'empreendedor-startup',
    'pesquisador', 'outro'
  )),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  aceite_lgpd BOOLEAN DEFAULT FALSE NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ideias ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público/anônimo
CREATE POLICY "Qualquer pessoa pode enviar ideia"
  ON ideias FOR INSERT
  WITH CHECK (true);

-- Permitir SELECT público (apenas para exibição no mural)
CREATE POLICY "Ideias são públicas para leitura"
  ON ideias FOR SELECT
  USING (true);
```

### 2. Tabela de Reações de Satisfação
```sql
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
```

### Configuração de variáveis de ambiente:

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seuid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

*Nota: Se as variáveis de ambiente não estiverem configuradas, o mural entrará em modo offline e carregará sugestões fictícias automaticamente para exibição e testes locais da física.*

---

## 💻 Instalação e Execução Local

### Pré-requisitos
* Node.js v18.0.0 ou superior
* npm v9.0.0 ou superior

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

O servidor iniciará localmente em `http://localhost:3000` e na rede local no IP correspondente para que outros dispositivos acessem.

3. **Gerar build de produção**:
   ```bash
   npm run build
   ```

---

## 📄 Créditos e Licença

Desenvolvido para a **15ª Fetech – Feira Tecnológica de Campina Grande**.
* **Realização**: Tribunal de Justiça da Paraíba (TJPB)
* **Organização**: Lyno — Laboratório de Inovação do PJPB
