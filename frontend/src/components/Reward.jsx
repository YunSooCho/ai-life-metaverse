import { useState } from 'react'

const REWARDS = {
  firstLogin: {
    id: 'firstLogin',
    name: 'FIRST LOGIN',
    points: 100,
    experience: 50,
    items: [
      { id: 'healthPotion', quantity: 3 },
      { id: 'coin', quantity: 50 }
    ]
  },
  dailyBonus: {
    id: 'dailyBonus',
    name: 'DAILY BONUS',
    points: 50,
    experience: 20,
    items: [
      { id: 'giftBox', quantity: 1 },
      { id: 'coin', quantity: 20 }
    ]
  },
  achievement: {
    id: 'achievement',
    name: 'ACHIEVEMENT',
    points: 200,
    experience: 150,
    items: [
      { id: 'experiencePotion', quantity: 2 },
      { id: 'healthPotion', quantity: 5 }
    ]
  }
}

const ITEMS = {
  healthPotion: {
    id: 'healthPotion',
    name: 'HP POTION',
    icon: '❤️'
  },
  coin: {
    id: 'coin',
    name: 'COIN',
    icon: '🪙'
  },
  giftBox: {
    id: 'giftBox',
    name: 'GIFT BOX',
    icon: '🎁'
  },
  experiencePotion: {
    id: 'experiencePotion',
    name: 'EXP POTION',
    icon: '⚡'
  }
}

export default function Reward({ show, onClose, characterId, onClaimReward, claimedRewards = [] }) {
  const [selectedReward, setSelectedReward] = useState(null)

  if (!show) return null

  const handleClaimReward = (rewardId) => {
    onClaimReward(characterId, rewardId)
    setSelectedReward(null)
  }

  const handleRewardClick = (rewardId) => {
    if (isClaimed(rewardId)) {
      return
    }
    if (selectedReward === rewardId) {
      setSelectedReward(null)
    } else {
      setSelectedReward(rewardId)
    }
  }

  const isClaimed = (rewardId) => claimedRewards.includes(rewardId)

  return (
    <div className="modal-overlay pixel-overlay">
      <div className="reward-modal pixel-panel pixel-pop">
        <div className="reward-header pixel-panel-header pixel-font pixel-text-lg">
          <h2>🎁 REWARD CENTER</h2>
          <button className="close-button pixel-button pixel-button-red" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="reward-content">
          <div className="reward-list pixel-scroll">
            <div className="pixel-grid">
              {Object.values(REWARDS).map(reward => {
                const claimed = isClaimed(reward.id)

                return (
                  <div
                    key={reward.id}
                    className={`reward-item pixel-grid-item ${selectedReward === reward.id ? 'selected' : ''} ${claimed ? 'claimed' : ''}`}
                    onClick={() => handleRewardClick(reward.id)}
                  >
                    <div className="reward-icon pixel-icon-lg">🎁</div>
                    <div className="reward-info pixel-font">
                      <div className="reward-name pixel-text-md">{reward.name}</div>
                      <div className="reward-details pixel-text-sm">
                        <span className="reward-points pixel-badge pixel-badge-orange">💎 {reward.points} PTS</span>
                        <span className="reward-experience pixel-badge pixel-badge-blue">⭐ {reward.experience} EXP</span>
                      </div>
                      <div className="reward-items pixel-text-sm">
                        {reward.items.map(item => {
                          const itemInfo = ITEMS[item.id]
                          return (
                            <span key={item.id} className="reward-item-badge pixel-badge pixel-badge-green">
                              {itemInfo?.icon || '📦'} {itemInfo?.name || item.id} x{item.quantity}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="reward-status">
                      {claimed ? (
                        <span className="reward-claimed-badge pixel-badge pixel-badge-green">CLAIMED</span>
                      ) : (
                        <button
                          className="claim-button pixel-button pixel-button-green pixel-text-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClaimReward(reward.id)
                          }}
                        >
                          CLAIM
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}