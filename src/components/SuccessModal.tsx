'use client';

import Link from 'next/link';
import './SuccessModal.css';

interface SuccessModalProps {
  onClose: () => void;
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Ideia enviada com sucesso">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-badge" aria-hidden="true">🏆</div>

        <h2 className="modal-title">
          Você ganhou o selo de<br />Inovador do Judiciário
        </h2>

        <p className="modal-subtitle">
          Sua ideia foi registrada com sucesso. Obrigado por contribuir com a inovação no judiciário paraibano!
        </p>

        <div className="modal-actions">
          <Link href="/mural" className="modal-btn-primary">
            Ver no Mural de Ideias
          </Link>
          <button className="modal-btn-secondary" onClick={onClose}>
            Enviar outra ideia
          </button>
        </div>
      </div>
    </div>
  );
}
