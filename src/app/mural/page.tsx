import { createServerSupabaseClient } from '@/lib/supabase/server';
import MuralCanvas from '@/components/MuralCanvas';
import { IdeiaPublica } from '@/types';

// Always server-render on demand — never statically cache Supabase data
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mural de Ideias · 15ª Fetech',
  description: 'Mural público e interativo com as propostas enviadas para os gargalos do Judiciário.',
};

async function getIdeias(): Promise<{ ideias: IdeiaPublica[]; total: number }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If environment variables are missing, return empty array for development preview
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url')) {
      console.warn('Supabase URL or Key not set. Returning offline default ideas.');
      const mock = getMockIdeias();
      return { ideias: mock, total: mock.length };
    }

    const supabase = createServerSupabaseClient();
    
    // Fetch last 50 ideas and total count in parallel
    const [listResult, countResult] = await Promise.all([
      supabase
        .from('ideias')
        .select('id, nome, titulo, gargalo, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('ideias')
        .select('id', { count: 'exact', head: true }),
    ]);

    if (listResult.error) {
      console.error('Failed to fetch ideas from Supabase:', listResult.error.message);
      const mock = getMockIdeias();
      return { ideias: mock, total: mock.length };
    }

    return {
      ideias: (listResult.data || []) as IdeiaPublica[],
      total: countResult.count ?? listResult.data?.length ?? 0,
    };
  } catch (error) {
    console.error('Error fetching ideas:', error);
    const mock = getMockIdeias();
    return { ideias: mock, total: mock.length };
  }
}

// Static fallback mockup ideas to showcase dynamic bouncing when offline/development without Supabase config
function getMockIdeias(): IdeiaPublica[] {
  return [
    {
      id: 'mock-1',
      titulo: 'Triagem inteligente de petições iniciais com LLMs locais',
      nome: 'José da Silva',
      gargalo: 'agilidade-processual',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      titulo: 'Simplificação de mandados usando Legal Design e ícones informativos',
      nome: 'Maria Souza',
      gargalo: 'acessibilidade-inclusao',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-3',
      titulo: 'Sensores de presença IoT para otimização de iluminação nos fóruns',
      nome: 'Carlos Oliveira',
      gargalo: 'sustentabilidade-administrativa',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-4',
      titulo: 'Dashboard de conciliação automática pré-processual',
      nome: 'Ana Santos',
      gargalo: 'agilidade-processual',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-5',
      titulo: 'Balcão Virtual em Libras por Inteligência Artificial',
      nome: 'Lucas Lima',
      gargalo: 'acessibilidade-inclusao',
      created_at: new Date().toISOString(),
    },
  ];
}

export default async function MuralPage() {
  const { ideias, total } = await getIdeias();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="animate-fade-in">
      <MuralCanvas ideias={ideias} initialTotal={total} />
    </div>
  );
}
