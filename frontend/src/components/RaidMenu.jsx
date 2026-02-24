import { useState, useEffect } from 'react'
import './RaidMenu.css'

/**
 * 레이드 시스템 UI (Phase 19)
 *
 * 기능:
 * - 레이드 목록 (이름, 난이도, 최소 인원, 보상)
 * - 레이드 진행 상황 (HP 표시, 남은 시간)
 * - 레이드 참여/나가기
 * - 레이드 보상 수령
 */
const RaidMenu = ({ socket, characterId, onClose }) => {
  const [raids, setRaids] = useState([])
  const [activeRaid, setActiveRaid] = useState(null)
  const [raidProgress, setRaidProgress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedRaid, setSelectedRaid] = useState(null)

  // 레이드 목록 조회
  useEffect(() => {
    fetchRaids()
  }, [characterId])

  // Socket 이벤트 리스너
  useEffect(() => {
    if (!socket) return

    // 레이드 생성됨
    socket.on('raidCreated', (raid) => {
      setRaids(prev => [...prev, raid])
    })

    // 레이드 업데이트 (HP 변경, 참여자 변경)
    socket.on('raidUpdated', (raid) => {
      setRaids(prev =>
        prev.map(r => r.id === raid.id ? raid : r)
      )
      // 활성 레이드 업데이트
      if (activeRaid?.id === raid.id) {
        setActiveRaid(raid)
      }
    })

    // 레이드 완료
    socket.on('raidCompleted', (data) => {
      const { raidId, rewards } = data
      setActiveRaid(prev => prev?.id === raidId ? { ...prev, status: 'completed', rewards } : prev)
    })

    // 레이드 실패
    socket.on('raidFailed', (data) => {
      const { raidId } = data
      setActiveRaid(prev => prev?.id === raidId ? { ...prev, status: 'failed' } : prev)
    })

    return () => {
      socket.off('raidCreated')
      socket.off('raidUpdated')
      socket.off('raidCompleted')
      socket.off('raidFailed')
    }
  }, [socket, activeRaid])

  // 레이드 목록 조회
  const fetchRaids = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:4000/api/raid/list?characterId=${characterId}`)
      if (!res.ok) {
        throw new Error('레이드 목록을 불러오는 데 실패했습니다')
      }
      const data = await res.json()
      setRaids(data.raids || [])

      // 현재 참여 중인 레이드 확인
      if (data.activeRaid) {
        setActiveRaid(data.activeRaid)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 레이드 참여
  const handleJoinRaid = async (raidId) => {
    try {
      const res = await fetch('http://localhost:4000/api/raid/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          raidId
        })
      })

      if (!res.ok) {
        throw new Error('레이드 참여에 실패했습니다')
      }

      const data = await res.json()
      setActiveRaid(data.raid)
      socket.emit('joinRaid', { characterId, raidId })
    } catch (err) {
      setError(err.message)
    }
  }

  // 레이드 나가기
  const handleLeaveRaid = async () => {
    if (!activeRaid) return

    try {
      await fetch('http://localhost:4000/api/raid/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          raidId: activeRaid.id
        })
      })

      setActiveRaid(null)
      socket.emit('leaveRaid', { characterId, raidId: activeRaid.id })
    } catch (err) {
      setError(err.message)
    }
  }

  // 레이드 보상 수령
  const handleClaimReward = async () => {
    if (!activeRaid || activeRaid.status !== 'completed') return

    try {
      await fetch('http://localhost:4000/api/raid/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          raidId: activeRaid.id
        })
      })

      socket.emit('claimRaidReward', { characterId, raidId: activeRaid.id })
      setActiveRaid(null)
      fetchRaids()
    } catch (err) {
      setError(err.message)
    }
  }

  // 난이도 라벨
  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🌱 쉬움'
      case 'normal': return '⚔️ 보통'
      case 'hard': return '🔥 어려움'
      case 'nightmare': return '💀 악몽'
      default: return '⚔️ 보통'
    }
  }

  // 난이도 색상
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50'
      case 'normal': return '#2196F3'
      case 'hard': return '#FF9800'
      case 'nightmare': return '#F44336'
      default: return '#2196F3'
    }
  }

  // 레이드 상태 라벨
  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting': return '⏳ 대기 중'
      case 'in_progress': return '⚔️ 진행 중'
      case 'completed': return '✅ 완료'
      case 'failed': return '❌ 실패'
      default: return '⏳ 대기 중'
    }
  }

  // HP 퍼센트 계산
  const getHpPercent = (current, max) => {
    if (!max || max === 0) return 0
    return Math.round((current / max) * 100)
  }

  if (loading) {
    return (
      <div className="raid-menu-overlay">
        <div className="raid-menu">
          <div className="raid-menu-header">
            <h2 className="raid-menu-title">👹 레이드 시스템</h2>
            <button onClick={onClose} className="raid-menu-close">✕</button>
          </div>
          <div className="raid-loading">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="raid-menu-overlay">
        <div className="raid-menu">
          <div className="raid-menu-header">
            <h2 className="raid-menu-title">👹 레이드 시스템</h2>
            <button onClick={onClose} className="raid-menu-close">✕</button>
          </div>
          <div className="raid-error">{error}</div>
          <button onClick={fetchRaids} className="pixel-button">다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div className="raid-menu-overlay">
      <div className="raid-menu">
        {/* 헤더 */}
        <div className="raid-menu-header">
          <h2 className="raid-menu-title">👹 레이드 시스템</h2>
          <button onClick={onClose} className="raid-menu-close">✕</button>
        </div>

        {/* 활성 레이드 */}
        {activeRaid && (
          <div className="active-raid">
            <h3>⚔️ 현재 레이드</h3>
            <div className="raid-card active">
              <div className="raid-name">{activeRaid.name}</div>
              <div className="raid-info">
                <span className="raid-status">{getStatusLabel(activeRaid.status)}</span>
                <span className="raid-participants">
                  참여자: {activeRaid.participants?.length || 0} / {activeRaid.maxParticipants || 10}
                </span>
              </div>

              {/* HP 표시 (진행 중일 때) */}
              {activeRaid.status === 'in_progress' && (
                <div className="raid-hp-bar-container">
                  <div className="raid-hp-bar-label">
                    {activeRaid.bossName || '보스'} HP
                  </div>
                  <div className="raid-hp-bar">
                    <div
                      className="raid-hp-fill"
                      style={{
                        width: `${getHpPercent(activeRaid.currentHp, activeRaid.maxHp)}%`
                      }}
                    >
                      {activeRaid.currentHp} / {activeRaid.maxHp}
                    </div>
                  </div>
                </div>
              )}

              {/* 레이드 완료 */}
              {activeRaid.status === 'completed' && (
                <div className="raid-completed">
                  <div className="completed-message">🎉 레이드 완료!</div>
                  {activeRaid.rewards && (
                    <div className="raid-rewards">
                      <div className="reward-item">
                        <span className="reward-label">경험치:</span>
                        <span className="reward-value">{activeRaid.rewards.exp || 0} EXP</span>
                      </div>
                      <div className="reward-item">
                        <span className="reward-label">아이템:</span>
                        <span className="reward-value">{activeRaid.rewards.items?.length || 0}개</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleClaimReward}
                    className="pixel-button pixel-button-primary"
                  >
                    보상 수령
                  </button>
                </div>
              )}

              {/* 레이드 실패 */}
              {activeRaid.status === 'failed' && (
                <div className="raid-failed">
                  <div className="failed-message">❌ 레이드 실패</div>
                </div>
              )}

              {/* 레이드 나가기 버튼 (대기 중일 때) */}
              {activeRaid.status === 'waiting' && (
                <button
                  onClick={handleLeaveRaid}
                  className="pixel-button pixel-button-danger"
                >
                  레이드 나가기
                </button>
              )}
            </div>
          </div>
        )}

        {/* 레이드 목록 */}
        <div className="raid-list">
          <h3>🎯 레이드 목록</h3>
          {raids.length === 0 ? (
            <div className="raids-empty">참여 가능한 레이드가 없습니다</div>
          ) : (
            raids.map((raid) => (
              <div
                key={raid.id}
                className={`raid-card ${activeRaid?.id === raid.id ? 'active' : ''}`}
                style={{
                  borderLeft: `4px solid ${getDifficultyColor(raid.difficulty)}`
                }}
              >
                <div className="raid-header">
                  <div className="raid-name">{raid.name}</div>
                  <span
                    className="raid-difficulty"
                    style={{ color: getDifficultyColor(raid.difficulty) }}
                  >
                    {getDifficultyLabel(raid.difficulty)}
                  </span>
                </div>

                <div className="raid-info">
                  <span className="raid-status">{getStatusLabel(raid.status)}</span>
                  <span className="raid-level">
                    레벨 제한: Lv.{raid.minLevel || 1}+
                  </span>
                </div>

                <div className="raid-details">
                  <div className="raid-detail">
                    <span className="detail-label">최소 인원:</span>
                    <span className="detail-value">{raid.minParticipants || 2}명</span>
                  </div>
                  <div className="raid-detail">
                    <span className="detail-label">참여자:</span>
                    <span className="detail-value">
                      {raid.participants?.length || 0} / {raid.maxParticipants || 10}
                    </span>
                  </div>
                  {raid.description && (
                    <div className="raid-description">
                      {raid.description}
                    </div>
                  )}
                </div>

                {/* 참여 버튼 */}
                {raid.status === 'waiting' &&
                  raid.level >= (raid.minLevel || 1) &&
                  (!activeRaid || activeRaid.id !== raid.id) &&
                  (raid.participants?.length || 0) < (raid.maxParticipants || 10) && (
                  <button
                    onClick={() => handleJoinRaid(raid.id)}
                    className="pixel-button pixel-button-primary"
                  >
                    참여
                  </button>
                )}

                {/* 참여 중 표시 */}
                {activeRaid?.id === raid.id && (
                  <button
                    className="pixel-button pixel-button-secondary"
                    disabled
                  >
                    참여 중
                  </button>
                )}

                {/* 진행 중 표시 */}
                {raid.status === 'in_progress' && raid.participants?.some(p => p.id === characterId) && (
                  <span className="raid-in-progress">진행 중</span>
                )}

                {/* 완료/실패 표시 */}
                {(raid.status === 'completed' || raid.status === 'failed') && raid.participants?.some(p => p.id === characterId) && (
                  <span className={`raid-status-badge ${raid.status}`}>
                    {getStatusLabel(raid.status)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default RaidMenu