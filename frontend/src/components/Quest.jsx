import './Quest.css'

export default function Quest({ 
  show, 
  quests, 
  availableQuests, 
  onAcceptQuest, 
  onClaimReward,
  onClose 
}) {
  if (!show) return null
  const activeQuests = Object.values(quests).filter(q => q.status !== 'completed')
  const completedQuests = Object.values(quests).filter(q => q.status === 'completed')

  const getQuestTypeLabel = (questType) => {
    const labels = {
      main: '메인 퀘스트',
      side: '사이드 퀘스트'
    }
    return labels[questType] || questType
  }

  const getQuestTypeClass = (questType) => {
    const classes = {
      main: 'quest-main',
      side: 'quest-side'
    }
    return classes[questType] || ''
  }

  const isObjectiveComplete = (objective) => {
    return objective.currentCount >= objective.requiredCount
  }

  const calculateProgress = (quest) => {
    const completedObjectives = quest.objectives.filter(isObjectiveComplete).length
    const totalObjectives = quest.objectives.length
    return {
      completed: completedObjectives,
      total: totalObjectives,
      percentage: totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0
    }
  }

  const formatDuration = (objective) => {
    if (objective.unit === 'ms') {
      const seconds = Math.floor(objective.currentCount / 1000)
      const totalSeconds = Math.floor(objective.requiredCount / 1000)
      return `${seconds}/${totalSeconds}초`
    }
    return `${objective.currentCount}/${objective.requiredCount}`
  }

  return (
    <div className="quest-overlay">
      <div className="quest-container">
        <div className="quest-header">
          <h2>📋 퀘스트</h2>
          <button className="quest-close" onClick={onClose}>✕</button>
        </div>

        <div className="quest-tabs">
          <button className="quest-tab quest-tab-active">진행 중</button>
          <span className="quest-tab-count">{activeQuests.length}</span>
        </div>

        <div className="quest-content">
          {activeQuests.length === 0 ? (
            <div className="quest-empty">
              <p>진행 중인 퀘스트가 없습니다</p>
            </div>
          ) : (
            <div className="quest-list">
              {activeQuests.map(quest => {
                const progress = calculateProgress(quest)
                const canClaim = progress.percentage === 100

                return (
                  <div 
                    key={quest.id} 
                    className={`quest-item ${getQuestTypeClass(quest.questType)} ${canClaim ? 'quest-completable' : ''}`}
                  >
                    <div className="quest-item-header">
                      <div className="quest-item-title">
                        <span className="quest-type-badge">{getQuestTypeLabel(quest.questType)}</span>
                        <h3>{quest.title}</h3>
                      </div>
                      <div className="quest-progress-bar">
                        <div 
                          className="quest-progress-fill" 
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <span className="quest-progress-text">{progress.percentage}%</span>
                    </div>

                    <p className="quest-description">{quest.description}</p>

                    <div className="quest-objectives">
                      <h4>목표</h4>
                      <ul>
                        {quest.objectives.map((objective, index) => (
                          <li 
                            key={objective.id} 
                            className={isObjectiveComplete(objective) ? 'objective-complete' : ''}
                          >
                            <span className="objective-checkbox">
                              {isObjectiveComplete(objective) ? '✓' : '○'}
                            </span>
                            <span className="objective-text">
                              {objective.description}
                            </span>
                            <span className="objective-progress">
                              {formatDuration(objective)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {quest.reward && (
                      <div className="quest-reward">
                        <h4>보상</h4>
                        <div className="reward-items">
                          {quest.reward.points && (
                            <span className="reward-item">🏆 {quest.reward.points} 포인트</span>
                          )}
                          {quest.reward.experience && (
                            <span className="reward-item">⭐ {quest.reward.experience} 경험치</span>
                          )}
                          {quest.reward.items?.map((item, index) => (
                            <span key={index} className="reward-item">
                              📦 {item.id} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {canClaim && (
                      <button 
                        className="quest-claim-button"
                        onClick={() => onClaimReward(quest.id)}
                      >
                        보상 받기
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {availableQuests && Object.keys(availableQuests).length > 0 && (
            <>
              <div className="quest-tabs">
                <button className="quest-tab">수락 가능</button>
                <span className="quest-tab-count">{Object.keys(availableQuests).length}</span>
              </div>

              <div className="quest-list">
                {Object.values(availableQuests).map(quest => (
                  <div 
                    key={quest.id} 
                    className={`quest-item ${getQuestTypeClass(quest.questType)} quest-available`}
                  >
                    <div className="quest-item-header">
                      <div className="quest-item-title">
                        <span className="quest-type-badge">{getQuestTypeLabel(quest.questType)}</span>
                        <h3>{quest.title}</h3>
                      </div>
                    </div>

                    <p className="quest-description">{quest.description}</p>

                    <div className="quest-objectives">
                      <h4>목표</h4>
                      <ul>
                        {quest.objectives.map((objective, index) => (
                          <li key={objective.id}>
                            <span className="objective-checkbox">○</span>
                            <span className="objective-text">
                              {objective.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {quest.reward && (
                      <div className="quest-reward">
                        <h4>보상</h4>
                        <div className="reward-items">
                          {quest.reward.points && (
                            <span className="reward-item">🏆 {quest.reward.points} 포인트</span>
                          )}
                          {quest.reward.experience && (
                            <span className="reward-item">⭐ {quest.reward.experience} 경험치</span>
                          )}
                          {quest.reward.items?.map((item, index) => (
                            <span key={index} className="reward-item">
                              📦 {item.id} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      className="quest-accept-button"
                      onClick={() => onAcceptQuest(quest.id)}
                    >
                      수락하기
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {completedQuests.length > 0 && (
            <>
              <div className="quest-tabs">
                <button className="quest-tab">완료</button>
                <span className="quest-tab-count">{completedQuests.length}</span>
              </div>

              <div className="quest-list">
                {completedQuests.map(quest => (
                  <div 
                    key={quest.id} 
                    className={`quest-item ${getQuestTypeClass(quest.questType)} quest-finished`}
                  >
                    <div className="quest-item-header">
                      <div className="quest-item-title">
                        <span className="quest-type-badge">{getQuestTypeLabel(quest.questType)}</span>
                        <h3>{quest.title}</h3>
                      </div>
                      <span className="quest-status-complete">✓ 완료</span>
                    </div>

                    <p className="quest-description">{quest.description}</p>

                    {quest.reward && (
                      <div className="quest-reward">
                        <h4>보상</h4>
                        <div className="reward-items">
                          {quest.reward.points && (
                            <span className="reward-item">🏆 {quest.reward.points} 포인트</span>
                          )}
                          {quest.reward.experience && (
                            <span className="reward-item">⭐ {quest.reward.experience} 경험치</span>
                          )}
                          {quest.reward.items?.map((item, index) => (
                            <span key={index} className="reward-item">
                              📦 {item.id} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}