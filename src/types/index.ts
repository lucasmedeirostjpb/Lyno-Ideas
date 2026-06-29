export type GargaloSlug =
  | 'agilidade-processual'
  | 'acessibilidade-inclusao'
  | 'sustentabilidade-administrativa';

export type Perfil =
  | 'estudante'
  | 'empreendedor-startup'
  | 'pesquisador'
  | 'outro';

export interface Ideia {
  id: string;
  created_at: string;
  gargalo: GargaloSlug;
  nome: string;
  email?: string;
  telefone?: string;
  perfil: Perfil;
  titulo: string;
  descricao: string;
}

export interface IdeiaPublica {
  id: string;
  titulo: string;
  nome: string;
  gargalo: GargaloSlug;
  created_at: string;
}

export interface Gargalo {
  slug: GargaloSlug;
  titulo: string;
  provocacao: string;
  foco: string;
  icone: string;
}

export const PERFIL_OPTIONS: { value: Perfil; label: string }[] = [
  { value: 'estudante', label: 'Estudante' },
  { value: 'empreendedor-startup', label: 'Empreendedor / Startup' },
  { value: 'pesquisador', label: 'Pesquisador' },
  { value: 'outro', label: 'Outro' },
];
