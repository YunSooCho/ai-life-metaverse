/**
 * Phase 1-B: 성장 시각화 시스템 - 타이틀 획득 알림
 *
 * 타이틀 획득 시 시각적 피드백 제공
 * - 타이틀 아이콘 표시
 * - 이름 및 설명
 * - 획득 효과
 * - 희소성 시각화
 * - 사운드 재생
 */

import React, { useState, useEffect } from 'react';
import { useSoundManager } from '../hooks/useSoundManager';

// 스타일 정의
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-out',
  },
  header: {
    fontSize: '24px',
    color: '#FFD700',
    marginBottom: '30px',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    animation: 'pulse 1s infinite',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(40, 40, 40, 0.95))',
    border: '3px solid',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
    animation: 'slideUp 0.5s ease-out',
  },
  titleIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    animation: 'bounce 1s infinite',
  },
  titleName: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  titleDescription: {
    fontSize: '16px',
    color: '#aaa',
    textAlign: 'center',
    marginBottom: '20px',
    maxWidth: '400px',
  },
  rarityBadge: {
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '20px',
  },
  effectContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '10px',
    width: '100%',
  },
  effectHeader: {
    color: '#FFD700',
    fontSize: '14px',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  effectRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  effectLabel: {
    color: '#aaa',
    fontSize: '14px',
  },
  effectValue: {
    color: '#4CAF50',
    fontSize: '14px',
    fontWeight: 'bold',
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
    animation: 'slideUp 0.5s ease-out 0.5s both',
  },
};

// 희소성별 스타일
const RARITY_STYLES = {
  COMMON: {
    borderColor: '#9E9E9E',
    badgeColor: '#9E9E9E',
    textColor: '#9E9E9E',
    shadowColor: 'rgba(158, 158, 158, 0.3)',
  },
  RARE: {
    borderColor: '#4CAF50',
    badgeColor: '#4CAF50',
    textColor: '#4CAF50',
    shadowColor: 'rgba(76, 175, 80, 0.5)',
  },
  EPIC: {
    borderColor: '#9C27B0',
    badgeColor: '#9C27B0',
    textColor: '#9C27B0',
    shadowColor: 'rgba(156, 39, 176, 0.6)',
  },
  LEGENDARY: {
    borderColor: '#FF6F00',
    badgeColor: '#FF6F00',
    textColor: '#FF6F00',
    shadowColor: 'rgba(255, 111, 0, 0.7)',
  },
};

// 스탯 표기 매핑
const STAT_LABELS = {
  experience: '경험치',
  attack: '공격력',
  defense: '방어력',
  hp: '최대 HP',
  affinity: '친화력',
  charisma: '카리스마',
  intelligence: '지능',
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

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
`;

// 파티클 컴포넌트
function TitleParticle({ x, y, size, color, delay }) {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setTimeout(() => {
      setLeft(Math.random() * 100 - 50);
      setTop(Math.random() * -100 - 50);
      setOpacity(0);
    }, delay);

    return () => clearTimeout(interval);
  }, [delay]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '50%',
        transition: `all 2s ease-out ${delay}ms`,
        transform: `translate(${left}px, ${top}px)`,
        opacity: opacity,
      }}
    />
  );
}

export default function TitleNotification({ titleData, onDismiss, duration = 5000 }) {
  const [visible, setVisible] = useState(true);
  const soundManager = useSoundManager();

  const rarityStyle = RARITY_STYLES[titleData.rarity] || RARITY_STYLES.COMMON;
  const isLegendary = titleData.rarity === 'LEGENDARY';

  const particles = Array.from({ length: isLegendary ? 80 : 40 }, (_, i) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 10 + 5,
    color: isLegendary
      ? ['#FFD700', '#FFA500', '#FF6347', '#9C27B0', '#4CAF50'][Math.floor(Math.random() * 5)]
      : [rarityStyle.badgeColor, '#FFD700'][Math.floor(Math.random() * 2)],
    delay: Math.random() * 500,
  }));

  // 사운드 재생
  useEffect(() => {
    if (soundManager && soundManager.playSFX) {
      soundManager.playSFX(isLegendary ? 'title_legendary' : 'title_unlock');
    }
  }, [soundManager, isLegendary]);

  // 자동 닫기
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) {
    return null;
  }

  const passiveEffect = titleData.passiveEffect;
  const hasEffect = passiveEffect && passiveEffect.stat && passiveEffect.multiplier;

  return (
    <>
      <style>{animationStyles}</style>
      <div style={styles.overlay}>
        {/* 파티클 효과 */}
        {particles.map((particle, index) => (
          <TitleParticle
            key={index}
            x={particle.x}
            y={particle.y}
            size={particle.size}
            color={particle.color}
            delay={particle.delay}
          />
        ))}

        {/* 헤더 */}
        <div style={styles.header}>Title Unlocked!</div>

        {/* 타이틀 컨테이너 */}
        <div
          style={{
            ...styles.titleContainer,
            borderColor: rarityStyle.borderColor,
            boxShadow: `0 0 30px ${rarityStyle.shadowColor}${isLegendary ? ', 0 0 60px #FFD700' : ''}`,
            ...(isLegendary && {
              animation: 'rainbow 3s linear infinite',
            }),
          }}
        >
          {/* 타이틀 아이콘 */}
          <div style={styles.titleIcon}>{titleData.icon || '🏆'}</div>

          {/* 타이틀 이름 */}
          <div
            style={{
              ...styles.titleName,
              color: rarityStyle.textColor,
            }}
          >
            {titleData.name || 'Unknown'}
          </div>

          {/* 타이틀 설명 */}
          <div style={styles.titleDescription}>
            {titleData.description || ''}
          </div>

          {/* 희소성 배지 */}
          <div
            style={{
              ...styles.rarityBadge,
              backgroundColor: rarityStyle.badgeColor,
            }}
          >
            {titleData.rarity || 'COMMON'}
          </div>

          {/* 수동 효과 */}
          {hasEffect && (
            <div style={styles.effectContainer}>
              <div style={styles.effectHeader}>수동 효과</div>
              <div style={styles.effectRow}>
                <div style={styles.effectLabel}>
                  {STAT_LABELS[passiveEffect.stat] || passiveEffect.stat}
                </div>
                <div style={styles.effectValue}>
                  x{passiveEffect.multiplier.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          style={styles.dismissButton}
        >
          확인
        </button>
      </div>
    </>
  );
}

// 소켓 이벤트 연동을 위한 HOC
export function withTitleSocket(Component) {
  return function WrappedComponent(props) {
    const [titleData, setTitleData] = useState(null);

    useEffect(() => {
      const socket = props.socket;
      if (!socket) return;

      const handleTitleUnlock = (data) => {
        setTitleData({
          id: data.id,
          name: data.name,
          description: data.description,
          type: data.type,
          rarity: data.rarity,
          icon: data.icon,
          requirements: data.requirements,
          passiveEffect: data.passiveEffect,
        });
      };

      socket.on('titleUnlock', handleTitleUnlock);

      return () => {
        socket.off('titleUnlock', handleTitleUnlock);
      };
    }, [props.socket]);

    const handleDismiss = () => {
      setTitleData(null);
    };

    return (
      <>
        <Component {...props} />
        {titleData && (
          <TitleNotification titleData={titleData} onDismiss={handleDismiss} />
        )}
      </>
    );
  };
}