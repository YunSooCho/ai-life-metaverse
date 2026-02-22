import './Quest.css'

export default function Quest({
  show,
  quests,
  availableQuests,
  dailyQuests = {},
  onAcceptQuest,
  onClaimReward,
  onClaimDailyReward,
  onClose
}) {
  if (!show) return null
  const activeQuests = Object.values(quests).filter(q => q.status !== 'completed')
  const completedQuests = Object.values(quests).filter(q => q.status === 'completed')
  const activeDailyQuests = Object.values(dailyQuests).filter(q => q.status !== 'completed')
  const completedDailyQuests = Object.values(dailyQuests).filter(q => q.status === 'completed')

  const getQuestTypeLabel = (questType) => {
    const labels = {
      main: 'MAIN QUEST',
      side: 'SIDE QUEST',
      daily: 'DAILY QUEST'
    }
    return labels[questType] || questType.toUpperCase()
  }

  const getQuestTypeClass = (questType) => {
    const classes = {
      main: 'quest-main pixel-badge',
      side: 'quest-side pixel-badge pixel-badge-blue',
      daily: 'quest-daily pixel-badge pixel-badge-purple'
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
      return `${seconds}/${totalSeconds}s`
    }
    return `${objective.currentCount}/${objective.requiredCount}`
  }

  return (
    <div className="quest-overlay pixel-overlay">
      <div className="quest-container pixel-panel pixel-pop">
        <div className="quest-header pixel-panel-header pixel-font pixel-text-lg">
          <h2>📋 QUEST LOG</h2>
          <button className="quest-close pixel-button pixel-button-red" onClick={onClose}>✕</button>
        </div>

        {/* Daily Quests Section */}
        <div className="quest-tabs">
          <button className="quest-tab pixel-button pixel-text-sm">DAILY QUESTS</button>
          <span className="quest-tab-count pixel-badge pixel-badge-purple">{activeDailyQuests.length}</span>
        </div>

        <div className="quest-content pixel-scroll">
          {activeDailyQuests.length === 0 ? (
            <div className="quest-empty pixel-font pixel-text-md">
              <p>NO ACTIVE DAILY QUESTS</p>
            </div>
          ) : (
            <div className="quest-list pixel-grid">
              {activeDailyQuests.map(quest => {
                const progress = calculateProgress(quest)
                const canClaim = progress.percentage === 100

                return (
                  <div
                    key={quest.id}
                    className={`quest-item pixel-grid-item ${getQuestTypeClass('daily')} ${canClaim ? 'quest-completable' : ''}`}
                  >
                    <div className="quest-item-header">
                      <div className="quest-item-title">
                        <span className="quest-type-badge pixel-text-sm">DAILY</span>
                        <h3 className="pixel-font pixel-text-md">{quest.title}</h3>
                      </div>
                      <div className="quest-progress-bar">
                        <div
                          className="quest-progress-fill"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <span className="quest-progress-text pixel-font pixel-text-sm">{progress.percentage}%</span>
                    </div>

                    <p className="quest-description pixel-text-sm pixel-font">{quest.description}</p>

                    <div className="quest-objectives">
                      <h4 className="pixel-font pixel-text-md">OBJECTIVES</h4>
                      <ul>
                        {quest.objectives.map((objective, index) => (
                          <li
                            key={objective.id}
                            className={isObjectiveComplete(objective) ? 'objective-complete pixel-text-sm' : 'pixel-text-sm'}
                          >
                            <span className="objective-checkbox">
                              {isObjectiveComplete(objective) ? '✓' : '○'}
                            </span>
                            <span className="objective-text">
                              {objective.description}
                            </span>
                            <span className="objective-progress">
                              {objective.visitedBuildings && objective.visitedBuildings.length > 0
                                ? `${objective.visitedBuildings.length}/${objective.requiredCount}`
                                : `${objective.currentCount}/${objective.requiredCount}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {quest.reward && (
                      <div className="quest-reward">
                        <h4 className="pixel-font pixel-text-md">REWARD</h4>
                        <div className="reward-items">
                          {quest.reward.points && (
                            <span className="reward-item pixel-badge pixel-badge-orange">🏆 {quest.reward.points} PTS</span>
                          )}
                          {quest.reward.experience && (
                            <span className="reward-item pixel-badge pixel-badge-blue">⭐ {quest.reward.experience} EXP</span>
                          )}
                          {quest.reward.items?.map((item, index) => (
                            <span key={index} className="reward-item pixel-badge pixel-badge-green">
                              📦 {item.id} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {canClaim && (
                      <button
                        className="quest-claim-button pixel-button pixel-button-green pixel-text-sm"
                        onClick={() => onClaimDailyReward(quest.id)}
                      >
                        CLAIM REWARD
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {completedDailyQuests.length > 0 && (
            <>
              <div className="quest-tabs">
                <button className="quest-tab pixel-button pixel-text-sm">DAILY COMPLETED</button>
                <span className="quest-tab-count pixel-badge pixel-badge-green">{completedDailyQuests.length}</span>
              </div>

              <div className="quest-list pixel-grid">
              {completedDailyQuests.map(quest => (
                <div
                  key={quest.id}
                  className={`quest-item pixel-grid-item ${getQuestTypeClass('daily')} quest-finished`}
                >
                  <div className="quest-item-header">
                    <div className="quest-item-title">
                      <span className="quest-type-badge pixel-text-sm">DAILY</span>
                      <h3 className="pixel-font pixel-text-md">{quest.title}</h3>
                    </div>
                    <span className="quest-status-complete pixel-badge pixel-badge-green">✓ DONE</span>
                  </div>

                  <p className="quest-description pixel-text-sm pixel-font">{quest.description}</p>

                  {quest.reward && (
                    <div className="quest-reward">
                      <h4 className="pixel-font pixel-text-md">REWARD</h4>
                      <div className="reward-items">
                        {quest.reward.points && (
                          <span className="reward-item pixel-badge pixel-badge-orange">🏆 {quest.reward.points} PTS</span>
                        )}
                        {quest.reward.experience && (
                          <span className="reward-item pixel-badge pixel-badge-blue">⭐ {quest.reward.experience} EXP</span>
                        )}
                        {quest.reward.items?.map((item, index) => (
                          <span key={index} className="reward-item pixel-badge pixel-badge-green">
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

          {/* Main Quests Section */}
          <div className="quest-tabs">
            <button className="quest-tab quest-tab-active pixel-button pixel-text-sm">ACTIVE</button>
            <span className="quest-tab-count pixel-badge pixel-badge-orange">{activeQuests.length}</span>
          </div>

          {activeQuests.length === 0 ? (
            <div className="quest-empty pixel-font pixel-text-md">
              <p>NO ACTIVE QUESTS</p>
            </div>
          ) : (
            <div className="quest-list pixel-grid">
              {activeQuests.map(quest => {
                const progress = calculateProgress(quest)
                const canClaim = progress.percentage === 100

                return (
                  <div
                    key={quest.id}
                    className={`quest-item pixel-grid-item ${getQuestTypeClass(quest.questType)} ${canClaim ? 'quest-completable' : ''}`}
                  >
                    <div className="quest-item-header">
                      <div className="quest-item-title">
                        <span className="quest-type-badge pixel-text-sm">{getQuestTypeLabel(quest.questType)}</span>
                        <h3 className="pixel-font pixel-text-md">{quest.title}</h3>
                      </div>
                      <div className="quest-progress-bar">
                        <div
                          className="quest-progress-fill"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <span className="quest-progress-text pixel-font pixel-text-sm">{progress.percentage}%</span>
                    </div>

                    <p className="quest-description pixel-text-sm pixel-font">{quest.description}</p>

                    <div className="quest-objectives">
                      <h4 className="pixel-font pixel-text-md">OBJECTIVES</h4>
                      <ul>
                        {quest.objectives.map((objective, index) => (
                          <li
                            key={objective.id}
                            className={isObjectiveComplete(objective) ? 'objective-complete pixel-text-sm' : 'pixel-text-sm'}
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
                        <h4 className="pixel-font pixel-text-md">REWARD</h4>
                        <div className="reward-items">
                          {quest.reward.points && (
                            <span className="reward-item pixel-badge pixel-badge-orange">🏆 {quest.reward.points} PTS</span>
                          )}
                          {quest.reward.experience && (
                            <span className="reward-item pixel-badge pixel-badge-blue">⭐ {quest.reward.experience} EXP</span>
                          )}
                          {quest.reward.items?.map((item, index) => (
                            <span key={index} className="reward-item pixel-badge pixel-badge-green">
                              📦 {item.id} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {canClaim && (
                      <button
                        className="quest-claim-button pixel-button pixel-button-green pixel-text-sm"
                        onClick={() => onClaimReward(quest.id)}
                      >
                        CLAIM REWARD
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
                <button className="quest-tab pixel-button pixel-text-sm">AVAILABLE</button>
                <span className="quest-tab-count pixel-badge pixel-badge-cyan">{Object.keys(availableQuests).length}</span>
              </div>

              <div className="quest-list pixel-grid">
                {Object.values(availableQuests).map(quest => (
                  <div
                    key={quest.id}
                    className={`quest-item pixel-grid-item ${getQuestTypeClass(quest.questType)} quest-available`}
                  >
                    <div className="quest-item-header">
                      <div className="quest-item-title">
                        <span className="quest-type-badge pixel-text-sm">{getQuestTypeLabel(quest.questType)}</span>
                        <h3 className="pixel-font pixel-text-md">{quest.title}</h3>
                      </div>
                    </div>

                    <p className="quest-description pixel-text-sm pixel-font">{quest.description}</p>

                    <div className="quest-objectives">
                      <h4 className="pixel-font pixel-text-md">OBJECTIVES</h4>
                      <ul>
                        {quest.objectives.map((objective, index) => (
                          <li key={objective.id} className="pixel-text-sm">
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
                        <h4 className="pixel-font pixel-text-md">REWARD</h4>
                        <div className="reward-items">
                          {quest.reward.points && (
                            <span className="reward-item pixel-badge pixel-badge-orange">🏆 {quest.reward.points} PTS</span>
                          )}
                          {quest.reward.experience && (
                            <span className="reward-item pixel-badge pixel-badge-blue">⭐ {quest.reward.experience} EXP</span>
                          )}
                          {quest.reward.items?.map((item, index) => (
                            <span key={index} className="reward-item pixel-badge pixel-badge-green">
                              📦 {item.id} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      className="quest-accept-button pixel-button pixel-button-green pixel-text-sm"
                      onClick={() => onAcceptQuest(quest.id)}
                    >
                      ACCEPT
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {completedQuests.length > 0 && (
            <>
              <div className="quest-tabs">
                <button className="quest-tab pixel-button pixel-text-sm">COMPLETED</button>
                <span className="quest-tab-count pixel-badge pixel-badge-green">{completedQuests.length}</span>
              </div>

              <div className="quest-list pixel-grid">
                {completedQuests.map(quest => (
                  <div
                    key={quest.id}
                    className={`quest-item pixel-grid-item ${getQuestTypeClass(quest.questType)} quest-finished`}
                  >
                    <div className="quest-item-header">
                      <div className="quest-item-title">
                        <span className="quest-type-badge pixel-text-sm">{getQuestTypeLabel(quest.questType)}</span>
                        <h3 className="pixel-font pixel-text-md">{quest.title}</h3>
                      </div>
                      <span className="quest-status-complete pixel-badge pixel-badge-green">✓ DONE</span>
                    </div>

                    <p className="quest-description pixel-text-sm pixel-font">{quest.description}</p>

                    {quest.reward && (
                      <div className="quest-reward">
                        <h4 className="pixel-font pixel-text-md">REWARD</h4>
                        <div className="reward-items">
                          {quest.reward.points && (
                            <span className="reward-item pixel-badge pixel-badge-orange">🏆 {quest.reward.points} PTS</span>
                          )}
                          {quest.reward.experience && (
                            <span className="reward-item pixel-badge pixel-badge-blue">⭐ {quest.reward.experience} EXP</span>
                          )}
                          {quest.reward.items?.map((item, index) => (
                            <span key={index} className="reward-item pixel-badge pixel-badge-green">
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