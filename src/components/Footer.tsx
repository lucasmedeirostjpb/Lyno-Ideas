import Image from 'next/image';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-logos">
          <Image
            src="/images/logo-lyno-light.png"
            alt="Lyno – Laboratório de Inovação do PJPB"
            width={100}
            height={32}
            style={{ width: 'auto', height: 'auto' }}
          />
          <Image
            src="/images/logo-tjpb.png"
            alt="Tribunal de Justiça da Paraíba"
            width={32}
            height={32}
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        <div className="footer-text">
          <span className="institution">15ª Fetech – Feira Tecnológica de Campina Grande</span>
          <span className="lab">Lyno — Laboratório de Inovação do PJPB</span>
        </div>

        <hr className="footer-divider" />

        <p className="footer-message">
          Obrigado por ajudar a tornar o nosso judiciário mais inovador!
        </p>

        <p className="footer-copyright">
          © {year} Tribunal de Justiça da Paraíba. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
