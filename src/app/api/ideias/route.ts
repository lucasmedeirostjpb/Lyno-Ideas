import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { GargaloSlug, Perfil } from '@/types';

// Rate limiter / temporary state check (not production grade but works for basic MVP)
// Next.js runtime is serverless, so a global variable is instance-scoped, which works well enough for simple rate limiting.
const submissionsLog: { ip: string; timestamp: number }[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gargalo, nome, email, telefone, perfil, titulo, descricao, _hp, _ts } = body;

    // 1. Anti-spam: Honeypot check
    // If the hidden website input field is filled, silently discard or pretend to succeed.
    if (_hp && _hp.trim() !== '') {
      console.warn('Spam detected via Honeypot.');
      return NextResponse.json({ success: true, message: 'Seu selo foi gerado.' }, { status: 200 });
    }

    // 2. Anti-spam: Minimum form fill time check (3 seconds)
    if (_ts) {
      const timeElapsed = Date.now() - Number(_ts);
      if (timeElapsed < 3000) {
        return NextResponse.json(
          { error: 'Por favor, preencha o formulário com calma antes de enviar.' },
          { status: 400 }
        );
      }
    }

    // 3. Simple Rate Limiting: Max 1 submission per 10 seconds per IP
    const ip = request.headers.get('x-forwarded-for') || 'local';
    const now = Date.now();
    const lastSubmission = submissionsLog.find((log) => log.ip === ip);
    
    if (lastSubmission && now - lastSubmission.timestamp < 10000) {
      return NextResponse.json(
        { error: 'Aguarde 10 segundos antes de enviar outra ideia.' },
        { status: 429 }
      );
    }

    // Update submission log
    if (lastSubmission) {
      lastSubmission.timestamp = now;
    } else {
      submissionsLog.push({ ip, timestamp: now });
    }

    // 4. Data Validation
    if (!gargalo || !nome || !perfil || !titulo || !descricao) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios: Nome, Perfil, Título e Descrição.' },
        { status: 400 }
      );
    }

    const validGargalos: GargaloSlug[] = [
      'agilidade-processual',
      'acessibilidade-inclusao',
      'sustentabilidade-administrativa',
    ];
    if (!validGargalos.includes(gargalo)) {
      return NextResponse.json({ error: 'Gargalo inválido.' }, { status: 400 });
    }

    const validPerfis: Perfil[] = ['estudante', 'empreendedor-startup', 'pesquisador', 'outro'];
    if (!validPerfis.includes(perfil)) {
      return NextResponse.json({ error: 'Perfil inválido.' }, { status: 400 });
    }

    if (nome.length > 100 || titulo.length > 120 || descricao.length > 2000) {
      return NextResponse.json({ error: 'Limite de caracteres excedido.' }, { status: 400 });
    }

    // 5. Save to Supabase
    const supabase = createServerSupabaseClient();
    
    const { error: dbError } = await supabase.from('ideias').insert({
      gargalo,
      nome,
      email: email || null,
      telefone: telefone || null,
      perfil,
      titulo,
      descricao,
    });

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return NextResponse.json(
        { error: 'Erro ao salvar a ideia no banco de dados. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Você ganhou o selo de Inovador do Judiciário' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Fetch last 50 ideas public columns only (id, nome, titulo, gargalo, created_at)
    const { data, error } = await supabase
      .from('ideias')
      .select('id, nome, titulo, gargalo, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Erro ao buscar mural.' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
