/**
 * Phase 1-B: 성장 시각화 시스템 - 레벨업 이펙트
 *
 * 레벨업 시 시각적 피드백 제공
 * - 숫자 카운트다운 애니메이션
 * - 파티클 효과
 * - 사운드 재생
 * - 스테이터스 증가 표시
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
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    animation: 'pulse 1s infinite',
  },
  levelContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  previousLevel: {
    fontSize: '60px',
    color: '#888',
    marginBottom: '10px',
  },
  arrow: {
    fontSize: '40px',
    color: '#FFD700',
    margin: '10px 0',
    animation: 'bounce 0.5s infinite',
  },
  currentLevel: {
    fontSize: '120px',
    color: '#FFD700',
    fontWeight: 'bold',
    textShadow: '0 0 20px #FFD700, 0 0 40px #FFA500',
    animation: 'scaleIn 0.5s ease-out',
  },
  congratulations: {
    fontSize: '32px',
    color: '#fff',
    marginBottom: '30px',
    animation: 'slideUp 0.5s ease-out 0.3s both',
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid #FFD700',
    borderRadius: '10px',
    padding: '20px',
    minWidth: '300px',
    animation: 'slideUp 0.5s ease-out 0.5s both',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
  },
  statLabel: {
    color: '#aaa',
    fontSize: '16px',
  },
  statIncrease: {
    color: '#4CAF50',
    fontSize: '16px',
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
    animation: 'slideUp 0.5s ease-out 0.7s both',
  },
  dismissButtonHover: {
    backgroundColor: '#FFA500',
  },
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

  @keyframes scaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// 파티클 컴포넌트
function Particle({ x, y, size, color, delay }) {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setTimeout(() => {
      setLeft(Math.random() * 200 - 100);
      setTop(Math.random() * -200 - 100);
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

// 스탯 표기 매핑
const STAT_LABELS = {
  hp: 'HP',
  affinity: '친화력',
  charisma: '카리스마',
  intelligence: '지능',
};

export default function LevelUp({ levelUpData, onDismiss, duration = 5000 }) {
  const [visible, setVisible] = useState(true);
  const [countingLevel, setCountingLevel] = useState(levelUpData.previousLevel);
  const soundManager = useSoundManager();

  const particles = Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 10 + 5,
    color: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50'][Math.floor(Math.random() * 4)],
    delay: Math.random() * 1000,
  }));

  // 사운드 재생
  useEffect(() => {
    if (soundManager && soundManager.playSFX) {
      soundManager.playSFX('level_up');
    }
  }, [soundManager]);

  // 레벨 카운트다운
  useEffect(() => {
    let current = levelUpData.previousLevel;
    const interval = setInterval(() => {
      current += 1;
      setCountingLevel(current);

      if (current >= levelUpData.newLevel) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [levelUpData.previousLevel, levelUpData.newLevel]);

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

  // 스테이터스 증가 계산
  const statIncreases = levelUpData.statIncreases || {};

  return (
    <>
      <style>{animationStyles}</style>
      <div style={styles.overlay}>
        {/* 파티클 효과 */}
        {particles.map((particle, index) => (
          <Particle
            key={index}
            x={particle.x}
            y={particle.y}
            size={particle.size}
            color={particle.color}
            delay={particle.delay}
          />
        ))}

        {/* 헤더 */}
        <div style={styles.header}>Level Up!</div>

        {/* 레벨 표시 */}
        <div style={styles.levelContainer}>
          {levelUpData.previousLevel < levelUpData.newLevel && (
            <>
              <div style={styles.previousLevel}>{levelUpData.previousLevel}</div>
              <div style={styles.arrow}>↓</div>
            </>
          )}
          <div style={styles.currentLevel}>{countingLevel}</div>
        </div>

        {/* 축하 메시지 */}
        <div style={styles.congratulations}>축하합니다! 레벨 {levelUpData.newLevel} 달성!</div>

        {/* 스테이터스 증가 */}
        {(statIncreases.hp || statIncreases.affinity || statIncreases.charisma || statIncreases.intelligence) && (
          <div style={styles.statsContainer}>
            <h3 style={{ color: '#FFD700', margin: '0 0 15px 0', textAlign: 'center' }}>
              스테이터스 증가
            </h3>
            {Object.entries(statIncreases).map(([stat, increase]) => (
              <div key={stat} style={styles.statRow}>
                <div style={styles.statLabel}>{STAT_LABELS[stat] || stat}</div>
                <div style={styles.statIncrease}>+{increase}</div>
              </div>
            ))}
          </div>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          style={styles.dismissButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#FFA500';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#FFD700';
          }}
        >
          확인
        </button>
      </div>
    </>
  );
}

// 소켓 이벤트 연동을 위한 HOC
export function withLevelUpSocket(Component) {
  return function WrappedComponent(props) {
    const [levelUpData, setLevelUpData] = useState(null);

    useEffect(() => {
      const socket = props.socket;
      if (!socket) return;

      const handleLevelUp = (data) => {
        setLevelUpData({
          previousLevel: data.previousLevel,
          newLevel: data.newLevel,
          statIncreases: data.statIncreases || {},
        });
      };

      socket.on('levelUp', handleLevelUp);

      return () => {
        socket.off('levelUp', handleLevelUp);
      };
    }, [props.socket]);

    const handleDismiss = () => {
      setLevelUpData(null);
    };

    return (
      <>
        <Component {...props} />
        {levelUpData && (
          <LevelUp levelUpData={levelUpData} onDismiss={handleDismiss} />
        )}
      </>
    );
  };
}