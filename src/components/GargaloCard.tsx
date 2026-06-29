import Link from 'next/link';
import { Gargalo } from '@/types';
import './GargaloCard.css';

interface GargaloCardProps {
  gargalo: Gargalo;
  className?: string;
}

export default function GargaloCard({ gargalo, className = '' }: GargaloCardProps) {
  return (
    <Link
      href={`/gargalo/${gargalo.slug}`}
      className={`gargalo-card ${className}`}
    >
      <span className="gargalo-card-icon" aria-hidden="true">
        {gargalo.icone}
      </span>
      <h3 className="gargalo-card-title">{gargalo.titulo}</h3>
      <p className="gargalo-card-provocacao">{gargalo.provocacao}</p>
      <span className="gargalo-card-cta">
        Contribuir com minha ideia
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
