import { GARGALOS } from '@/lib/gargalos';
import GargaloCard from '@/components/GargaloCard';
import Link from 'next/link';
import './home.css';

export const metadata = {
  title: 'Lyno Ideias · 15ª Fetech',
  description: 'Proponha soluções para os gargalos tecnológicos do Judiciário da Paraíba na 15ª Fetech.',
};

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content container">
          <span className="hero-badge animate-fade-in-up">15ª Fetech</span>
          <h1 className="animate-fade-in-up delay-1">
            Ideias para o <span>Judiciário do Futuro</span>
          </h1>
          <p className="animate-fade-in-up delay-2">
            Ajude o Tribunal de Justiça da Paraíba e o Lyno a transformar os serviços jurídicos através da tecnologia. Selecione um dos gargalos abaixo e envie sua proposta.
          </p>
        </div>
      </section>

      {/* Gargalos Grid Section */}
      <section className="gargalos-section container">
        <div className="gargalos-grid">
          {GARGALOS.map((gargalo, index) => (
            <GargaloCard
              key={gargalo.slug}
              gargalo={gargalo}
              className={`animate-fade-in-up delay-${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="steps-section">
        <div className="container">
          <div className="steps-title animate-fade-in">
            <h2>Como Participar</h2>
            <p>Sua ideia pode fazer a diferença na inovação da justiça.</p>
          </div>

          <div className="steps-grid">
            <div className="step-item animate-fade-in-up delay-1">
              <div className="step-number">1</div>
              <h3>Escolha um Gargalo</h3>
              <p>Analise os três desafios reais listados e identifique onde sua solução se encaixa.</p>
            </div>

            <div className="step-item animate-fade-in-up delay-2">
              <div className="step-number">2</div>
              <h3>Envie sua Ideia</h3>
              <p>Preencha o formulário detalhando sua proposta técnica ou conceitual.</p>
            </div>

            <div className="step-item animate-fade-in-up delay-3">
              <div className="step-number">3</div>
              <h3>Mural Público</h3>
              <p>Sua ideia aparecerá instantaneamente em nosso mural público interativo de inovadores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mural CTA Section */}
      <section className="mural-cta-section">
        <div className="mural-cta-content container">
          <h2>Quer ver o que já propuseram?</h2>
          <p>Acesse o nosso mural interativo e acompanhe as ideias flutuantes da comunidade de inovadores.</p>
          <Link href="/mural" className="mural-cta-btn">
            Ver Mural de Ideias
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
