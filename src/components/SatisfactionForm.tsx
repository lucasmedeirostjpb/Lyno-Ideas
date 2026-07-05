'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import './SatisfactionForm.css';

export default function SatisfactionForm() {
  const [nota, setNota] = useState<number>(8); // Default score is 8 (happy)
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Anti-spam: timestamp when form was rendered
  const formLoadTime = useRef(Date.now());

  useEffect(() => {
    formLoadTime.current = Date.now();
  }, []);

  const resetForm = () => {
    setNota(8);
    setComentario('');
    setError('');
    formLoadTime.current = Date.now();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Anti-spam: honeypot check
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement)?.value;
    if (honeypot) return;

    // Anti-spam: minimum time check (3 seconds)
    const elapsed = Date.now() - formLoadTime.current;
    if (elapsed < 3000) {
      setError('Por favor, preencha o formulário com calma antes de enviar.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/satisfacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nota,
          comentario: comentario.trim() || null,
          _hp: honeypot || '',
          _ts: formLoadTime.current,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar satisfação');
      }

      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic face SVG parts based on score
  const getFaceConfig = (score: number) => {
    // Colors classes
    let colorClass = 'face-happy';
    let label = 'Excelente';
    
    if (score <= 3) {
      colorClass = 'face-sad';
      label = score === 0 ? 'Péssimo' : score === 1 ? 'Muito Ruim' : score === 2 ? 'Ruim' : 'Insatisfeito';
    } else if (score <= 6) {
      colorClass = 'face-neutral';
      label = score === 4 ? 'Regular' : score === 5 ? 'Neutro' : 'Razoável';
    } else {
      colorClass = 'face-happy';
      label = score === 7 ? 'Bom' : score === 8 ? 'Muito Bom' : score === 9 ? 'Ótimo' : 'Excelente / Amei!';
    }

    // Eyebrows path
    let leftEyebrow = 'M 25 35 L 42 35';
    let rightEyebrow = 'M 58 35 L 75 35';
    
    if (score <= 2) {
      // Angry/frustrated brows
      leftEyebrow = 'M 25 33 L 42 41';
      rightEyebrow = 'M 58 41 L 75 33';
    } else if (score <= 4) {
      // Sad/worried brows
      leftEyebrow = 'M 25 39 L 42 34';
      rightEyebrow = 'M 58 34 L 75 39';
    } else if (score >= 8) {
      // Raised happy brows (archs)
      leftEyebrow = 'M 25 33 Q 33.5 27 42 33';
      rightEyebrow = 'M 58 33 Q 66.5 27 75 33';
    }

    // Eyes rendering
    let renderEyes = () => (
      <>
        <circle cx="35" cy="46" r="4.5" fill="currentColor" className="eye" />
        <circle cx="65" cy="46" r="4.5" fill="currentColor" className="eye" />
      </>
    );

    if (score <= 2) {
      // Narrow/intense eyes
      renderEyes = () => (
        <>
          <circle cx="35" cy="48" r="3.5" fill="currentColor" className="eye" />
          <circle cx="65" cy="48" r="3.5" fill="currentColor" className="eye" />
        </>
      );
    } else if (score >= 9) {
      // Happy arches (^ ^)
      renderEyes = () => (
        <>
          <path d="M 27 48 Q 34 38 41 48" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" className="eye-arc" />
          <path d="M 59 48 Q 66 38 73 48" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" className="eye-arc" />
        </>
      );
    }

    // Mouth path
    let mouthPath = 'M 35 65 L 65 65'; // Default neutral straight line
    let isOpenMouth = false;

    if (score === 0) mouthPath = 'M 30 74 Q 50 49 70 74';
    else if (score === 1) mouthPath = 'M 30 72 Q 50 52 70 72';
    else if (score === 2) mouthPath = 'M 30 70 Q 50 55 70 70';
    else if (score === 3) mouthPath = 'M 32 68 Q 50 58 68 68';
    else if (score === 4) mouthPath = 'M 34 67 Q 50 61 66 67';
    else if (score === 5) mouthPath = 'M 35 65 L 65 65';
    else if (score === 6) mouthPath = 'M 35 63 Q 50 68 65 63';
    else if (score === 7) mouthPath = 'M 32 61 Q 50 71 68 61';
    else if (score === 8) mouthPath = 'M 30 59 Q 50 75 70 59';
    else if (score === 9) {
      mouthPath = 'M 30 58 Q 50 82 70 58 Z';
      isOpenMouth = true;
    } else if (score === 10) {
      mouthPath = 'M 28 55 Q 50 89 72 55 Z';
      isOpenMouth = true;
    }

    return { colorClass, label, leftEyebrow, rightEyebrow, renderEyes, mouthPath, isOpenMouth };
  };

  const face = getFaceConfig(nota);

  if (showSuccess) {
    return (
      <div className="success-container animate-fade-in">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="success-check-icon">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Avaliação Enviada!</h2>
          <p className="success-msg">
            Agradecemos imensamente por compartilhar a sua opinião sobre o projeto Lyno Ideias. Seu feedback nos ajuda a melhorar cada vez mais.
          </p>
          <button onClick={() => setShowSuccess(false)} className="btn-success-close">
            Avaliar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="satisfaction-card">
      <div className="satisfaction-header">
        <h2>Sua opinião importa!</h2>
        <p>Como você avalia a sua satisfação geral com o projeto Lyno Ideias?</p>
      </div>

      <form className="satisfaction-form" onSubmit={handleSubmit} noValidate>
        {/* Dynamic SVG Face Visualization */}
        <div className="face-visualization-container">
          <svg viewBox="0 0 100 100" className={`face-svg ${face.colorClass}`}>
            {/* Background Circle */}
            <circle cx="50" cy="50" r="46" className="face-bg" />
            
            {/* Eyebrows */}
            <path d={face.leftEyebrow} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" className="eyebrow" />
            <path d={face.rightEyebrow} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" className="eyebrow" />
            
            {/* Eyes */}
            {face.renderEyes()}
            
            {/* Mouth */}
            <path 
              d={face.mouthPath} 
              stroke="currentColor" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              fill={face.isOpenMouth ? 'currentColor' : 'none'} 
              className="mouth" 
            />
          </svg>
          <div className={`score-label ${face.colorClass}`}>
            <span className="score-num">{nota}</span>
            <span className="score-text">{face.label}</span>
          </div>
        </div>

        {/* Score Selector (Slider & Buttons) */}
        <div className="form-group score-selector-group">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={nota}
            onChange={(e) => setNota(Number(e.target.value))}
            className="score-range-input"
            aria-label="Nota de satisfação de 0 a 10"
          />
          
          <div className="score-buttons">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`score-btn ${nota === i ? 'active' : ''}`}
                onClick={() => setNota(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Text Comment (Optional) */}
        <div className="form-group">
          <label htmlFor="comentario" className="form-label">
            Comentário ou Sugestão <span className="label-optional">(opcional)</span>
          </label>
          <textarea
            id="comentario"
            className="form-textarea"
            placeholder="Conte-nos o que achou da plataforma, ideias de melhorias ou sua experiência geral..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={1000}
          />
          <span className="char-count">{comentario.length}/1000</span>
        </div>

        {/* Honeypot field – invisible to users */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {error && <p className="form-api-error">{error}</p>}

        <button
          type="submit"
          className="form-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Enviando...
            </>
          ) : (
            'Enviar Avaliação'
          )}
        </button>
      </form>
    </div>
  );
}
