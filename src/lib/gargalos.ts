import { Gargalo } from '@/types';

export const GARGALOS: Gargalo[] = [
  {
    slug: 'agilidade-processual',
    titulo: 'Agilidade Processual',
    provocacao:
      'A justiça tarda, mas não precisa falhar. Como a tecnologia pode nos ajudar a ler, classificar e julgar processos mais rápido?',
    foco: 'Convidar ideias sobre IA, automação e triagem de dados.',
    icone: '⚡',
  },
  {
    slug: 'acessibilidade-inclusao',
    titulo: 'Acessibilidade e Inclusão',
    provocacao:
      'Juridiquês não! Se a justiça é para todos, como a tecnologia pode tornar nossa linguagem e nossos canais (como o Balcão Virtual) mais fáceis para você?',
    foco: 'Convidar ideias sobre Legal Design, interfaces mais amigáveis, chatbots empáticos e acessibilidade para pessoas com deficiência ou baixa fluência digital.',
    icone: '🤝',
  },
  {
    slug: 'sustentabilidade-administrativa',
    titulo: 'Sustentabilidade Administrativa',
    provocacao:
      'Mais eficiência, menos papel, zero desperdício. Como a tecnologia pode tornar os fóruns da Paraíba mais verdes e sustentáveis?',
    foco: 'Convidar ideias sobre eficiência administrativa, digitalização e sustentabilidade.',
    icone: '🌱',
  },
];

export function getGargaloBySlug(slug: string): Gargalo | undefined {
  return GARGALOS.find((g) => g.slug === slug);
}
