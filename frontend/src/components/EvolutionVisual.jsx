/**
 * Phase 1-B: 성장 시각화 시스템 - 진화 시각화
 *
 * 캐릭터 진화 시 시각적 피드백 제공
 * - 스프라이트 변화 애니메이션
 * - 오라 효과
 * - 색상 변화
 * - 사운드 재생
 * - 진화 스타일 시각화
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSoundManager } from '../hooks/useSoundManager';

// 스타일 정의
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.5s ease-out',
  },
  header: {
    fontSize: '28px',
    color: '#FFD700',
    marginBottom: '40px',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    animation: 'pulse 1s infinite',
  },
  characterContainer: {
    position: 'relative',
    width: '300px',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  characterSprite: {
    fontSize: '150px',
    transition: 'all 1s ease-in-out',
    position: 'relative',
    zIndex: 10,
  },
  characterBefore: {
    opacity: 0.3,
    transform: 'scale(0.7)',
    filter: 'grayscale(100%)',
  },
  characterAfter: {
    opacity: 1,
    transform: 'scale(1.2)',
    filter: 'grayscale(0%)',
  },
  aura: {
    position: 'absolute',
    borderRadius: '50%',
    animation: 'auraPulse 2s infinite',
  },
  evolutionStyle: {
    marginTop: '20px',
    padding: '10px 30px',
    fontSize: '18px',
    color: '#FFD700',
    border: '2px solid #FFD700',
    borderRadius: '5px',
    animation: 'slideUp 0.5s ease-out 1s both',
  },
  evolutionDetails: {
    textAlign: 'center',
    color: '#fff',
    marginTop: '20px',
    animation: 'slideUp 0.5s ease-out 1.2s both',
  },
  dismissButton: {
    marginTop: '30px',
    padding: '15px 40px',
    fontSize: '18px',
    backgroundColor: '#FFD700',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 1001,
    animation: 'slideUp 0.5s ease-out 1.5s both',
  },
};

// 오라 효과 색상
const AURA_COLORS = {
  shimmer: 'rgba(255, 215, 0, 0.3)',
  glow: 'rgba(135, 206, 250, 0.4)',
  radiant: 'rgba(255, 105, 180, 0.4)',
  legendary: 'rgba(255, 69, 0, 0.5)',
  divine: 'rgba(255, 255, 255, 0.6)',
};

// 진화 스타일 아이콘
const EVOLUTION_STYLE_ICONS = {
  warrior: '⚔️',
  mage: '🔮',
  ranger: '🏹',
  support: '💚',
};

// CSS 애니메이션
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes auraPulse {
    0% {
      transform: scale(0.8);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.6;
    }
    100% {
      transform: scale(0.8);
      opacity: 0.3;
    }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes shine {
    0% { filter: brightness(1); }
    50% { filter: brightness(1.5); }
    100% { filter: brightness(1); }
  }

  @keyframes colorShift {
    0% { filter: hue-rotate(0deg); }
    50% { filter: hue-rotate(180deg); }
    100% { filter: hue-rotate(360deg); }
  }
`;

// 파티클 컴포넌트
function EvolutionParticle({ x, y, size, color, delay, duration }) {
  const [left, setLeft] = useState(x);
  const [top, setTop] = useState(y);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const startAnimation = setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 200 + 100;
      setLeft(x + Math.cos(angle) * distance);
      setTop(y + Math.sin(angle) * distance);
      setScale(0);
    }, delay);

    return () => clearTimeout(startAnimation);
  }, [x, y, delay]);

  return (
    <div
      style={{
        position: 'absolute',
        left: left,
        top: top,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '50%',
        transition: `all ${duration}ms ease-out ${delay}ms`,
        transform: `scale(${scale})`,
      }}
    />
  );
}

// 스크린 쉐이크 효과
function useScreenShake(duration = 2000) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setShake(true);
    const timeout = setTimeout(() => {
      setShake(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration]);

  return shake;
}

export default function EvolutionVisual({ evolutionData, onDismiss, duration = 6000 }) {
  const [visible, setVisible] = useState(true);
  const [evolving, setEvolving] = useState(false);
  const [evolved, setEvolved] = useState(false);
  const soundManager = useSoundManager();
  const shake = useScreenShake(2000);

  const particles = Array.from({ length: 100 }, (_, i) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 15 + 5,
    color: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#00CED1'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 1000,
    duration: Math.random() * 2000 + 1000,
  }));

  const auraColor = AURA_COLORS[evolutionData.aura] || AURA_COLORS.shimmer;
  const styleIcon = EVOLUTION_STYLE_ICONS[evolutionData.style] || '✨';
  const auraSize = (evolutionData.pixelSize || 32) * 6;

  // 진화 프로세스
  useEffect(() => {
    // 사운드 재생
    if (soundManager && soundManager.playSFX) {
      setTimeout(() => {
        soundManager.playSFX('evolution_start');
      }, 500);
      setTimeout(() => {
        soundManager.playSFX('evolution_complete');
      }, 3000);
    }

    // 진화 애니메이션 시작
    setTimeout(() => {
      setEvolving(true);
    }, 1000);

    // 진화 완료
    setTimeout(() => {
      setEvolving(false);
      setEvolved(true);
    }, 3000);

    // 자동 닫기
    const timeout = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, soundManager]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <style>{animationStyles}</style>
      <div
        style={{
          ...styles.overlay,
          ...(shake ? {
            animation: 'none',
            transform: vibrating ? `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)` : 'none',
          } : {}),
        }}
      >
        {/* 파티클 효과 */}
        {particles.map((particle, index) => (
          <EvolutionParticle
            key={index}
            x={particle.x}
            y={particle.y}
            size={particle.size}
            color={particle.color}
            delay={particle.delay}
            duration={particle.duration}
          />
        ))}

        {/* 헤더 */}
        <div style={styles.header}>Evolution!</div>

        {/* 캐릭터 컨테이너 */}
        <div style={styles.characterContainer}>
          {/* 오라 효과 */}
          {evolved && (
            <>
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.aura,
                    width: `${auraSize + i * 40}px`,
                    height: `${auraSize + i * 40}px`,
                    backgroundColor: auraColor,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </>
          )}

          {/* 캐릭터 스프라이트 */}
          <div
            style={{
              ...styles.characterSprite,
              ...(evolving ? styles.characterBefore : styles.characterAfter),
              ...(evolved ? {
                animation: 'shine 1s ease-in-out infinite',
                color: evolutionData.color ? `rgb(${evolutionData.color.r * 255}, ${evolutionData.color.g * 255}, ${evolutionData.color.b * 255})` : '#fff',
              } : {}),
            }}
          >
            {evolutionData.characterEmoji || '👤'}
          </div>
        </div>

        {/* 진화 스타일 */}
        {evolved && evolutionData.style && (
          <div style={styles.evolutionStyle}>
            {styleIcon} {evolutionData.styleName || evolutionData.style}
          </div>
        )}

        {/* 진화 세부 정보 */}
        {evolved && (
          <div style={styles.evolutionDetails}>
            <h3 style={{ color: '#FFD700', margin: '0 0 10px 0' }}>
              {evolutionData.stageName || evolutionData.stage}
            </h3>
            <p style={{ color: '#aaa', fontSize: '16px', margin: '0' }}>
              {evolutionData.description || ''}
            </p>
          </div>
        )}

        {/* 닫기 버튼 */}
        {evolved && (
          <button
            onClick={handleDismiss}
            style={styles.dismissButton}
          >
            확인
          </button>
        )}
      </div>
    </>
  );
}

// 소켓 이벤트 연동을 위한 HOC
export function withEvolutionSocket(Component) {
  return function WrappedComponent(props) {
    const [evolutionData, setEvolutionData] = useState(null);

    useEffect(() => {
      const socket = props.socket;
      if (!socket) return;

      const handleEvolution = (data) => {
        setEvolutionData({
          previousStage: data.previousStage,
          newStage: data.newStage,
          stageName: data.stageName,
          description: data.description,
          style: data.style,
          styleName: data.styleName,
          aura: data.aura,
          pixelSize: data.pixelSize,
          color: data.color,
          characterEmoji: data.characterEmoji,
        });
      };

      socket.on('evolution', handleEvolution);

      return () => {
        socket.off('evolution', handleEvolution);
      };
    }, [props.socket]);

    const handleDismiss = () => {
      setEvolutionData(null);
    };

    return (
      <>
        <Component {...props} />
        {evolutionData && (
          <EvolutionVisual evolutionData={evolutionData} onDismiss={handleDismiss} />
        )}
      </>
    );
  };
}