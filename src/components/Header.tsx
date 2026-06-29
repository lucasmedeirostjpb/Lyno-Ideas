'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo" aria-label="Início">
          <Image
            src="/images/logo-lyno-dark.png"
            alt="Lyno – Laboratório de Inovação do PJPB"
            width={120}
            height={36}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>

        <nav className="header-nav" aria-label="Navegação principal">
          <Link href="/">Início</Link>
          <Link href="/gargalo/agilidade-processual">Agilidade</Link>
          <Link href="/gargalo/acessibilidade-inclusao">Acessibilidade</Link>
          <Link href="/gargalo/sustentabilidade-administrativa">Sustentabilidade</Link>
          <Link href="/mural">Mural</Link>
        </nav>

        <Link href="https://www.tjpb.jus.br" target="_blank" rel="noopener noreferrer" className="header-tjpb" aria-label="Tribunal de Justiça da Paraíba">
          <Image
            src="/images/logo-tjpb.png"
            alt="Tribunal de Justiça da Paraíba"
            width={40}
            height={40}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-label="Navegação mobile">
        <Link href="/" onClick={() => setMenuOpen(false)}>Início</Link>
        <Link href="/gargalo/agilidade-processual" onClick={() => setMenuOpen(false)}>Agilidade Processual</Link>
        <Link href="/gargalo/acessibilidade-inclusao" onClick={() => setMenuOpen(false)}>Acessibilidade e Inclusão</Link>
        <Link href="/gargalo/sustentabilidade-administrativa" onClick={() => setMenuOpen(false)}>Sustentabilidade Administrativa</Link>
        <Link href="/mural" onClick={() => setMenuOpen(false)}>Mural de Ideias</Link>
      </nav>
    </header>
  );
}
