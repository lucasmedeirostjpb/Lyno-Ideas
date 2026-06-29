'use client';

import { useState, useRef, FormEvent } from 'react';
import { GargaloSlug, PERFIL_OPTIONS } from '@/types';
import SuccessModal from './SuccessModal';
import './IdeaForm.css';

interface IdeaFormProps {
  gargaloSlug: GargaloSlug;
}

export default function IdeaForm({ gargaloSlug }: IdeaFormProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Anti-spam: timestamp when form was rendered
  const formLoadTime = useRef(Date.now());

  const resetForm = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setPerfil('');
    setTitulo('');
    setDescricao('');
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

    // Validation
    if (!nome.trim() || !perfil || !titulo.trim() || !descricao.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ideias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gargalo: gargaloSlug,
          nome: nome.trim(),
          email: email.trim() || null,
          telefone: telefone.trim() || null,
          perfil,
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          _hp: honeypot || '',
          _ts: formLoadTime.current,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar ideia');
      }

      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="idea-form" onSubmit={handleSubmit} noValidate>
        <div className="idea-form-grid">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">
                Nome <span className="required">*</span>
              </label>
              <input
                id="nome"
                type="text"
                className="form-input"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="seu@email.com (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                type="tel"
                className="form-input"
                placeholder="(83) 99999-0000 (opcional)"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="perfil">
                Perfil <span className="required">*</span>
              </label>
              <select
                id="perfil"
                className="form-select"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione seu perfil
                </option>
                {PERFIL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="titulo">
              Título da Sua Ideia <span className="required">*</span>
            </label>
            <input
              id="titulo"
              type="text"
              className="form-input"
              placeholder="Dê um título curto e chamativo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">
              Descrição da Sua Ideia <span className="required">*</span>
            </label>
            <textarea
              id="descricao"
              className="form-textarea"
              placeholder="Descreva sua ideia: qual o problema, como a tecnologia pode ajudar e qual seria o impacto..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={2000}
              required
            />
            <span className="char-count">{descricao.length}/2000</span>
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
              'Enviar minha ideia'
            )}
          </button>
        </div>
      </form>

      {showSuccess && (
        <SuccessModal
          onClose={() => {
            setShowSuccess(false);
            resetForm();
          }}
        />
      )}
    </>
  );
}
