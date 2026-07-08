'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { IdeiaPublica } from '@/types';
import { supabase } from '@/lib/supabase/client';
import PostIt from './PostIt';
import './MuralCanvas.css';

interface MuralCanvasProps {
  ideias: IdeiaPublica[];
  initialTotal?: number;
}

interface PhysicsItem {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isDragging: boolean;
  element: HTMLDivElement | null;
}

export default function MuralCanvas({ ideias, initialTotal = 0 }: MuralCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<IdeiaPublica[]>(ideias);
  const [cardSize, setCardSize] = useState<number>(180);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(initialTotal || ideias.length);
  const [recentSenders, setRecentSenders] = useState<string[]>(
    ideias.slice(0, 5).map((i) => i.nome)
  );
  const [countAnimating, setCountAnimating] = useState<boolean>(false);
  const physicsItemsRef = useRef<PhysicsItem[]>([]);
  const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const animationFrameId = useRef<number | null>(null);
  const cardSizeRef = useRef<number>(cardSize);

  // Keep cardSizeRef in sync with cardSize state
  useEffect(() => {
    cardSizeRef.current = cardSize;
  }, [cardSize]);

  // Dragging state tracking (since React state is too slow for 60fps drag)
  const activeDragRef = useRef<{
    itemId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Initialize physics for a single new item (without resetting existing ones)
  const initPhysicsItem = useCallback((id: string) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const size = cardSizeRef.current;
    const maxX = Math.max(0, rect.width - size);
    const maxY = Math.max(0, rect.height - size);

    const speedMagnitude = 0.5 + Math.random() * 0.8;
    const angle = Math.random() * Math.PI * 2;

    const newItem: PhysicsItem = {
      id,
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      vx: Math.cos(angle) * speedMagnitude,
      vy: Math.sin(angle) * speedMagnitude,
      isDragging: false,
      element: null,
    };

    physicsItemsRef.current = [newItem, ...physicsItemsRef.current];
  }, []);

  // Add new sender to the top of the recent list (max 5)
  const addSender = useCallback((nome: string) => {
    setRecentSenders((prev) => [nome, ...prev].slice(0, 5));
  }, []);

  // Animate count badge
  const animateCount = useCallback(() => {
    setCountAnimating(true);
    setTimeout(() => setCountAnimating(false), 600);
  }, []);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:ideias')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ideias' },
        (payload) => {
          const nova = payload.new as IdeiaPublica;
          // Add to items list (newest first)
          setItems((prev) => [nova, ...prev]);
          // Initialize physics without resetting others
          initPhysicsItem(nova.id);
          // Update overlays
          setTotalCount((c) => c + 1);
          animateCount();
          addSender(nova.nome);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initPhysicsItem, animateCount, addSender]);

  // Sync fullscreen state if changed by Esc key or browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Exit fullscreen when pressing any key on the keyboard
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error('Erro ao sair do fullscreen:', err);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Initialize physical properties for each post-it
    physicsItemsRef.current = items.map((item) => {
      const maxX = Math.max(0, width - cardSize);
      const maxY = Math.max(0, height - cardSize);

      const x = Math.random() * maxX;
      const y = Math.random() * maxY;

      // Random speed: values between 0.5 and 1.5, in random directions
      const speedMagnitude = 0.5 + Math.random() * 0.8;
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speedMagnitude;
      const vy = Math.sin(angle) * speedMagnitude;

      return {
        id: item.id,
        x,
        y,
        vx,
        vy,
        isDragging: false,
        element: null,
      };
    });

    const updatePhysics = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const cWidth = containerRect.width;
      const cHeight = containerRect.height;

      physicsItemsRef.current.forEach((item) => {
        // If being dragged, physics are handled by drag listeners
        if (item.isDragging) return;

        // Update position
        item.x += item.vx;
        item.y += item.vy;

        // Collision with left/right walls
        const maxX = Math.max(0, cWidth - cardSizeRef.current);
        if (item.x <= 0) {
          item.x = 0;
          item.vx = Math.abs(item.vx);
        } else if (item.x >= maxX) {
          item.x = maxX;
          item.vx = -Math.abs(item.vx);
        }

        // Collision with top/bottom walls
        const maxY = Math.max(0, cHeight - cardSizeRef.current);
        if (item.y <= 0) {
          item.y = 0;
          item.vy = Math.abs(item.vy);
        } else if (item.y >= maxY) {
          item.y = maxY;
          item.vy = -Math.abs(item.vy);
        }

        // Apply style changes directly to DOM for smoothness (60fps)
        const element = elementsRef.current.get(item.id);
        if (element) {
          element.style.left = `${item.x}px`;
          element.style.top = `${item.y}px`;
        }
      });

      animationFrameId.current = requestAnimationFrame(updatePhysics);
    };

    // Start animation
    animationFrameId.current = requestAnimationFrame(updatePhysics);

    // Global drag move listener
    const handlePointerMove = (e: PointerEvent) => {
      const activeDrag = activeDragRef.current;
      if (!activeDrag) return;

      const physicalItem = physicsItemsRef.current.find(i => i.id === activeDrag.itemId);
      if (!physicalItem) return;

      // Calculate delta movement
      const deltaX = e.clientX - activeDrag.startX;
      const deltaY = e.clientY - activeDrag.startY;

      // Set new calculated coordinates
      let newX = activeDrag.initialX + deltaX;
      let newY = activeDrag.initialY + deltaY;

      // Keep within boundaries
      if (containerRef.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, cRect.width - cardSizeRef.current));
        newY = Math.max(0, Math.min(newY, cRect.height - cardSizeRef.current));
      }

      physicalItem.x = newX;
      physicalItem.y = newY;

      const element = elementsRef.current.get(physicalItem.id);
      if (element) {
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
      }
    };

    // Global drag end listener
    const handlePointerUp = () => {
      const activeDrag = activeDragRef.current;
      if (!activeDrag) return;

      const physicalItem = physicsItemsRef.current.find(i => i.id === activeDrag.itemId);
      if (physicalItem) {
        physicalItem.isDragging = false;
        // Apply a small post-drag velocity boost
        const speedMagnitude = 0.5 + Math.random() * 0.8;
        const angle = Math.random() * Math.PI * 2;
        physicalItem.vx = Math.cos(angle) * speedMagnitude;
        physicalItem.vy = Math.sin(angle) * speedMagnitude;
      }

      activeDragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [items, cardSize]);

  const handleStartDrag = (itemId: string, clientX: number, clientY: number) => {
    const physicalItem = physicsItemsRef.current.find(i => i.id === itemId);
    if (!physicalItem) return;

    physicalItem.isDragging = true;
    activeDragRef.current = {
      itemId,
      startX: clientX,
      startY: clientY,
      initialX: physicalItem.x,
      initialY: physicalItem.y,
    };
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Erro ao tentar entrar em tela cheia:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mural-empty animate-fade-in">
        <span className="mural-empty-icon" aria-hidden="true">💡</span>
        <h3>Mural Vazio</h3>
        <p>Ainda não foram enviadas ideias. Seja o primeiro a propor uma solução!</p>
      </div>
    );
  }

  const sizes = [
    { label: 'Pequeno', value: 130 },
    { label: 'Médio', value: 180 },
    { label: 'Grande', value: 250 },
    { label: 'Gigante', value: 320 }
  ];

  return (
    <div className="mural-container" ref={containerRef}>
      {/* Header info (hidden in fullscreen) */}
      <div className="mural-header-info">
        <h2>Mural de Ideias – 15ª Fetech</h2>
        <p>Mostrando as últimas {items.length} ideias enviadas. Arraste-as para organizar!</p>
        
        <div className="mural-controls">
          <div className="control-group">
            <span className="control-label">Tamanho dos Cards</span>
            <div className="size-selector">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`size-btn ${cardSize === s.value ? 'active' : ''}`}
                  onClick={() => setCardSize(s.value)}
                >
                  {s.label.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="button"
            className="fullscreen-btn"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <svg viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
                Sair da Tela Cheia
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
                Mural em Tela Cheia
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response count badge — top right, visible in fullscreen */}
      <div className={`mural-badge-count ${countAnimating ? 'animating' : ''}`} aria-live="polite">
        <span className="mural-badge-count__icon">💡</span>
        <span className="mural-badge-count__number">{totalCount}</span>
        <span className="mural-badge-count__label">respostas</span>
      </div>

      {/* Last 5 senders list — bottom right, visible in fullscreen */}
      {recentSenders.length > 0 && (
        <div className="mural-badge-senders" aria-label="Últimos participantes">
          <span className="mural-badge-senders__title"> Últimos participantes</span>
          <ol className="mural-badge-senders__list">
            {recentSenders.map((nome, idx) => (
              <li
                key={`${nome}-${idx}`}
                className={`mural-badge-senders__item ${idx === 0 ? 'newest' : ''}`}
              >
                <span className="mural-badge-senders__dot" />
                {nome}
              </li>
            ))}
          </ol>
        </div>
      )}

      {items.map((item) => (
        <PostIt
          key={item.id}
          titulo={item.titulo}
          nome={item.nome}
          gargalo={item.gargalo}
          size={cardSize}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}
          onMouseDown={(e) => {
            // Only left click triggers drag
            if (e.button === 0) {
              handleStartDrag(item.id, e.clientX, e.clientY);
            }
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              handleStartDrag(item.id, e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          ref={(el: HTMLDivElement | null) => {
            if (el) {
              elementsRef.current.set(item.id, el);
            } else {
              elementsRef.current.delete(item.id);
            }
          }}
        />
      ))}
    </div>
  );
}
