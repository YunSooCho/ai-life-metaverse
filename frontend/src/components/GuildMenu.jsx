import { useState, useEffect } from 'react'

/**
 * 길드 시스템 UI (Phase 18)
 *
 *기능:
 * - 길드 생성 폼
 * - 길드 프로필 (이름, 레벨, 멤버 수, 경험치)
 * - 멤버 목록 (캐릭터명, 역할, 기여도)
 * - 역할 변경
 * - 길드 해체 (길드장 전용)
 */
const GuildMenu = ({ socket, characterId, onClose }) => {
  const [guildData, setGuildData] = useState(null)
  const [members, setMembers] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [newGuildName, setNewGuildName] = useState('')
  const [newGuildDesc, setNewGuildDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 길드 정보 조회
  useEffect(() => {
    fetchGuildInfo()
  }, [characterId])

  // Socket 이벤트 리스너
  useEffect(() => {
    if (!socket) return

    // 길드 생성 완료
    socket.on('guildCreated', (guild) => {
      setGuildData(guild)
      setIsCreating(false)
      setNewGuildName('')
      setNewGuildDesc('')
    })

    // 길드 업데이트 (멤버 추가/제거/역할 변경)
    socket.on('guildUpdated', (guild) => {
      setGuildData(guild)
    })

    // 길드 해체 완료
    socket.on('guildDisbanded', () => {
      setGuildData(null)
      setMembers([])
    })

    // 길드 경험치 업데이트
    socket.on('guildExpGained', (data) => {
      setGuildData(prev => ({
        ...prev,
        exp: data.exp,
        level: data.level,
        maxExp: data.maxExp
      }))
    })

    return () => {
      socket.off('guildCreated')
      socket.off('guildUpdated')
      socket.off('guildDisbanded')
      socket.off('guildExpGained')
    }
  }, [socket])

  // 길드 정보 조회
  const fetchGuildInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      // 내 길드 정보 조회
      const guildRes = await fetch(`http://localhost:4000/api/guild/my-guild?characterId=${characterId}`)
      if (!guildRes.ok) {
        throw new Error('길드 정보를 불러오는 데 실패했습니다')
      }
      const guild = await guildRes.json()

      if (guild) {
        setGuildData(guild)
        setMembers(Object.values(guild.members || {}))
      } else {
        setGuildData(null)
        setMembers([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 길드 생성
  const handleCreateGuild = async (e) => {
    e.preventDefault()
    if (!newGuildName.trim()) {
      setError('길드 이름을 입력해주세요')
      return
    }

    try {
      await fetch('http://localhost:4000/api/guild/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          name: newGuildName,
          description: newGuildDesc
        })
      })

      // Socket 이벤트로 수신
      socket.emit('createGuild', {
        characterId,
        name: newGuildName,
        description: newGuildDesc
      })
    } catch (err) {
      setError(err.message)
    }
  }

  // 역할 변경
  const handleChangeRole = async (memberId, newRole) => {
    try {
      await fetch('http://localhost:4000/api/guild/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          memberId,
          role: newRole
        })
      })

      socket.emit('changeGuildRole', {
        characterId,
        memberId,
        role: newRole
      })
    } catch (err) {
      setError(err.message)
    }
  }

  // 길드 해체
  const handleDisbandGuild = async () => {
    if (!confirm('정말 길드를 해체하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      await fetch('http://localhost:4000/api/guild/disband', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId })
      })

      socket.emit('disbandGuild', { characterId })
    } catch (err) {
      setError(err.message)
    }
  }

  // 역할 라벨
  const getRoleLabel = (role) => {
    switch (role) {
      case 'master': return '👑 방장'
      case 'officer': return '⭐ 부방장'
      case 'member': return '👤 길드원'
      case 'trainee': return '🌱 수습생'
      default: return role
    }
  }

  // 길드 경험치 바
  const getExpPercent = () => {
    if (!guildData || !guildData.maxExp) return 0
    return Math.round((guildData.exp / guildData.maxExp) * 100)
  }

  if (loading) {
    return (
      <div className="guild-menu-overlay">
        <div className="guild-menu">
          <div className="guild-menu-header">
            <h2 className="guild-menu-title">🏰 길드 시스템</h2>
            <button onClick={onClose} className="guild-menu-close">✕</button>
          </div>
          <div className="guild-loading">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="guild-menu-overlay">
        <div className="guild-menu">
          <div className="guild-menu-header">
            <h2 className="guild-menu-title">🏰 길드 시스템</h2>
            <button onClick={onClose} className="guild-menu-close">✕</button>
          </div>
          <div className="guild-error">{error}</div>
          <button onClick={fetchGuildInfo} className="pixel-button">다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div className="guild-menu-overlay">
      <div className="guild-menu">
        {/* 헤더 */}
        <div className="guild-menu-header">
          <h2 className="guild-menu-title">🏰 길드 시스템</h2>
          <button onClick={onClose} className="guild-menu-close">✕</button>
        </div>

        {/* 길드가 없는 경우: 생성 폼 */}
        {!guildData && !isCreating && (
          <div className="guild-no-guild">
            <p>소속된 길드가 없습니다</p>
            <button
              onClick={() => setIsCreating(true)}
              className="pixel-button pixel-button-primary"
            >
              길드 만들기
            </button>
          </div>
        )}

        {/* 길드 생성 폼 */}
        {isCreating && (
          <div className="guild-create-form">
            <h3>새 길드 만들기</h3>
            <form onSubmit={handleCreateGuild}>
              <div className="form-group">
                <label>길드 이름</label>
                <input
                  type="text"
                  value={newGuildName}
                  onChange={(e) => setNewGuildName(e.target.value)}
                  className="pixel-input"
                  placeholder="길드 이름 (2~20자)"
                  maxLength={20}
                  required
                />
              </div>
              <div className="form-group">
                <label>길드 설명 (선택)</label>
                <textarea
                  value={newGuildDesc}
                  onChange={(e) => setNewGuildDesc(e.target.value)}
                  className="pixel-input"
                  placeholder="길드 소개를 입력하세요"
                  maxLength={100}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="pixel-button pixel-button-primary">
                  길드 생성
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="pixel-button pixel-button-secondary"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 길드 정보 */}
        {guildData && (
          <div className="guild-info">
            {/* 길드 프로필 */}
            <div className="guild-profile">
              <div className="guild-name">{guildData.name}</div>
              <div className="guild-level">
                Lv. {guildData.level} 길드
              </div>
              <div className="guild-stats">
                <div className="stat-item">
                  <span className="stat-label">멤버</span>
                  <span className="stat-value">
                    {Object.keys(guildData.members || {}).length} / {guildData.maxMembers || 30}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">경험치</span>
                  <span className="stat-value">
                    {guildData.exp} / {guildData.maxExp}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">골드</span>
                  <span className="stat-value">{guildData.gold} G</span>
                </div>
              </div>

              {/* 경험치 바 */}
              <div className="guild-exp-bar">
                <div
                  className="guild-exp-fill"
                  style={{ width: `${getExpPercent()}%` }}
                >
                  {getExpPercent()}%
                </div>
              </div>

              {/* 길드 설명 */}
              {guildData.description && (
                <div className="guild-description">
                  {guildData.description}
                </div>
              )}

              {/* 길드 해체 버튼 (길드장 전용) */}
              {guildData.masterMemberId === characterId && (
                <button
                  onClick={handleDisbandGuild}
                  className="pixel-button pixel-button-danger"
                >
                  길드 해체
                </button>
              )}
            </div>

            {/* 멤버 목록 */}
            <div className="guild-members">
              <h3>👥 길드 멤버 ({members.length})</h3>
              {members.length === 0 ? (
                <div className="members-empty">멤버가 없습니다</div>
              ) : (
                <div className="members-list">
                  {members.map((member) => (
                    <div key={member.characterId} className="member-item">
                      <div className="member-info">
                        <div className="member-name">{member.nickname}</div>
                        <div className="member-role">{getRoleLabel(member.role)}</div>
                      </div>
                      <div className="member-stats">
                        <div className="member-contribution">
                          기여도: {member.contribution || 0}
                        </div>
                        {/* 역할 변경 (길드장/부방장 전용) */}
                        {(characterId === guildData.masterMemberId ||
                          (guildData.officers || []).includes(characterId)) && (
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.characterId, e.target.value)}
                            className="pixel-input role-select"
                            disabled={member.characterId === guildData.masterMemberId}
                          >
                            <option value="master">👑 방장</option>
                            <option value="officer">⭐ 부방장</option>
                            <option value="member">👤 길드원</option>
                            <option value="trainee">🌱 수습생</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuildMenu