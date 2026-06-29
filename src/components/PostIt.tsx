import { useMemo, forwardRef } from 'react';
import { GargaloSlug } from '@/types';
import './PostIt.css';

interface PostItProps {
  titulo: string;
  nome: string;
  gargalo: GargaloSlug;
  size?: number;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

const GARGALO_LABELS: Record<GargaloSlug, string> = {
  'agilidade-processual': 'Agilidade',
  'acessibilidade-inclusao': 'Acessibilidade',
  'sustentabilidade-administrativa': 'Sustentabilidade',
};

const PostIt = forwardRef<HTMLDivElement, PostItProps>(({
  titulo,
  nome,
  gargalo,
  size = 180,
  style,
  onMouseDown,
  onTouchStart,
}, ref) => {
  // Select a random stable color class (1 to 5) and rotation (-3deg to 3deg) based on title string length or simple hash
  const { colorClass, rotation } = useMemo(() => {
    const hash = titulo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorNum = (hash % 5) + 1;
    const rotVal = (hash % 7) - 3; // -3 to 3
    return {
      colorClass: `post-it-color-${colorNum}`,
      rotation: `rotate(${rotVal}deg)`,
    };
  }, [titulo]);

  // Dynamically scale fonts based on post-it size
  const badgeFontSize = `${size * 0.0038}rem`;
  const titleFontSize = `${size * 0.0053}rem`;
  const authorFontSize = `${size * 0.0041}rem`;

  const mergedStyle = {
    ...style,
    width: `${size}px`,
    height: `${size}px`,
    transform: style?.transform ? `${style.transform} ${rotation}` : rotation,
  };

  return (
    <div
      ref={ref}
      className={`post-it ${colorClass}`}
      style={mergedStyle}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="post-it-badge" style={{ fontSize: badgeFontSize }}>
        {GARGALO_LABELS[gargalo] || 'Ideia'}
      </div>
      <h4 className="post-it-title" style={{ fontSize: titleFontSize }}>
        {titulo}
      </h4>
      <div className="post-it-author" style={{ fontSize: authorFontSize }} title={nome}>
        <span>👤</span> {nome}
      </div>
    </div>
  );
});

PostIt.displayName = 'PostIt';

export default PostIt;
