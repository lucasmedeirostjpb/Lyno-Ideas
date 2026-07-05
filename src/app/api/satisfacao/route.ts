import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Rate limiter / temporary state check (instance-scoped for simple MVP rate limiting)
const feedbackLog: { ip: string; timestamp: number }[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nota, comentario, _hp, _ts } = body;

    // 1. Anti-spam: Honeypot check
    if (_hp && _hp.trim() !== '') {
      console.warn('Spam de feedback detectado via Honeypot.');
      return NextResponse.json({ success: true, message: 'Feedback recebido com sucesso.' }, { status: 200 });
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
    const lastSubmission = feedbackLog.find((log) => log.ip === ip);
    
    if (lastSubmission && now - lastSubmission.timestamp < 10000) {
      return NextResponse.json(
        { error: 'Aguarde 10 segundos antes de enviar outra avaliação.' },
        { status: 429 }
      );
    }

    // Update rate limiting log
    if (lastSubmission) {
      lastSubmission.timestamp = now;
    } else {
      feedbackLog.push({ ip, timestamp: now });
    }

    // 4. Data Validation
    if (nota === undefined || nota === null) {
      return NextResponse.json({ error: 'A nota é obrigatória.' }, { status: 400 });
    }

    const parsedNota = Number(nota);
    if (isNaN(parsedNota) || parsedNota < 0 || parsedNota > 10) {
      return NextResponse.json({ error: 'A nota deve ser um valor de 0 a 10.' }, { status: 400 });
    }

    if (comentario && comentario.length > 1000) {
      return NextResponse.json({ error: 'O comentário não pode exceder 1000 caracteres.' }, { status: 400 });
    }

    // 5. Save to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check if offline/dev mode without Supabase variables
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url')) {
      console.error('Supabase URL ou Key não configurada no ambiente.');
      return NextResponse.json({ 
        error: 'Erro de configuração: Conexão com o banco de dados não configurada.' 
      }, { status: 500 });
    }

    const supabase = createServerSupabaseClient();
    
    const { error: dbError } = await supabase.from('satisfacao').insert({
      nota: parsedNota,
      comentario: comentario?.trim() || null,
    });

    if (dbError) {
      console.error('Supabase Error:', dbError);
      return NextResponse.json(
        { error: 'Erro ao salvar o feedback no banco de dados. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Obrigado pelo seu feedback!' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
