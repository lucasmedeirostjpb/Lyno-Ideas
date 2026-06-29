import { notFound } from 'next/navigation';
import { GARGALOS, getGargaloBySlug } from '@/lib/gargalos';
import IdeaForm from '@/components/IdeaForm';
import Link from 'next/link';
import '../gargalo.css';

interface GargaloPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GARGALOS.map((gargalo) => ({
    slug: gargalo.slug,
  }));
}

export async function generateMetadata({ params }: GargaloPageProps) {
  const { slug } = await params;
  const gargalo = getGargaloBySlug(slug);
  
  if (!gargalo) {
    return {
      title: 'Página Não Encontrada · Lyno Ideias',
    };
  }

  return {
    title: `${gargalo.titulo} · Lyno Ideias`,
    description: gargalo.provocacao,
  };
}

export default async function GargaloPage({ params }: GargaloPageProps) {
  const { slug } = await params;
  const gargalo = getGargaloBySlug(slug);

  if (!gargalo) {
    notFound();
  }

  return (
    <div className="gargalo-page container animate-fade-in">
      <Link href="/" className="gargalo-back-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar para os gargalos
      </Link>

      <section className="gargalo-header">
        <span className="gargalo-badge" aria-hidden="true">
          {gargalo.icone}
        </span>
        <h1>{gargalo.titulo}</h1>
        
        <div className="gargalo-provocacao-box">
          <p>“{gargalo.provocacao}”</p>
        </div>

        <p className="gargalo-foco-desc">
          <strong>Foco:</strong> {gargalo.foco}
        </p>
      </section>

      <section className="gargalo-form-container">
        <IdeaForm gargaloSlug={gargalo.slug} />
      </section>
    </div>
  );
}
