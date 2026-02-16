import { useState } from 'react'

const REWARDS = {
  firstLogin: {
    id: 'firstLogin',
    name: '첫 로그인 보상',
    points: 100,
    experience: 50,
    items: [
      { id: 'healthPotion', quantity: 3 },
      { id: 'coin', quantity: 50 }
    ]
  },
  dailyBonus: {
    id: 'dailyBonus',
    name: '일일 보너스',
    points: 50,
    experience: 20,
    items: [
      { id: 'giftBox', quantity: 1 },
      { id: 'coin', quantity: 20 }
    ]
  },
  achievement: {
    id: 'achievement',
    name: '업적 달성 보상',
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
    name: '체력 포션',
    icon: '❤️'
  },
  coin: {
    id: 'coin',
    name: '코인',
    icon: '🪙'
  },
  giftBox: {
    id: 'giftBox',
    name: '선물 상자',
    icon: '🎁'
  },
  experiencePotion: {
    id: 'experiencePotion',
    name: '경험치 포션',
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
    <div className="modal-overlay">
      <div className="reward-modal">
        <div className="reward-header">
          <h2>🎁 보상 센터</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="reward-content">
          <div className="reward-list">
            {Object.values(REWARDS).map(reward => {
              const claimed = isClaimed(reward.id)

              return (
                <div
                  key={reward.id}
                  className={`reward-item ${selectedReward === reward.id ? 'selected' : ''} ${claimed ? 'claimed' : ''}`}
                  onClick={() => handleRewardClick(reward.id)}
                >
                  <div className="reward-icon">🎁</div>
                  <div className="reward-info">
                    <div className="reward-name">{reward.name}</div>
                    <div className="reward-details">
                      <span className="reward-points">💎 {reward.points}점</span>
                      <span className="reward-experience">⭐ {reward.experience}경험치</span>
                    </div>
                    <div className="reward-items">
                      {reward.items.map(item => {
                        const itemInfo = ITEMS[item.id]
                        return (
                          <span key={item.id} className="reward-item-badge">
                            {itemInfo?.icon || '📦'} {itemInfo?.name || item.id} x{item.quantity}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="reward-status">
                    {claimed ? (
                      <span className="reward-claimed-badge">수령 완료</span>
                    ) : (
                      <button
                        className="claim-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClaimReward(reward.id)
                        }}
                      >
                        수령
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
  )
}