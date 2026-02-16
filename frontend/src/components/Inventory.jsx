import { useState } from 'react'

const ITEMS = {
  healthPotion: {
    id: 'healthPotion',
    name: '체력 포션',
    type: 'consumable',
    effect: { hp: 50 },
    icon: '❤️',
    description: 'HP를 50 회복합니다'
  },
  coin: {
    id: 'coin',
    name: '코인',
    type: 'currency',
    effect: { currency: 10 },
    icon: '🪙',
    description: '화폐로 사용됩니다'
  },
  giftBox: {
    id: 'giftBox',
    name: '선물 상자',
    type: 'consumable',
    effect: { affinity: 10 },
    icon: '🎁',
    description: '호감도가 10 증가합니다'
  },
  experiencePotion: {
    id: 'experiencePotion',
    name: '경험치 포션',
    type: 'consumable',
    effect: { experience: 100 },
    icon: '⚡',
    description: '경험치가 100 증가합니다'
  }
}

export default function Inventory({ show, onClose, inventory, characterId, onUseItem, onGetInventory }) {
  const [selectedItem, setSelectedItem] = useState(null)

  if (!show) return null

  const handleItemClick = (itemId) => {
    if (selectedItem === itemId) {
      setSelectedItem(null)
    } else {
      setSelectedItem(itemId)
    }
  }

  const handleUseItem = (itemId) => {
    const item = ITEMS[itemId]
    if (item && item.type === 'consumable' && inventory[itemId] > 0) {
      onUseItem(characterId, itemId)
      setSelectedItem(null)
    }
  }

  const handleGetInventory = () => {
    onGetInventory(characterId)
  }

  const totalItems = Object.values(inventory).reduce((sum, quantity) => sum + quantity, 0)

  return (
    <div className="modal-overlay">
      <div className="inventory-modal">
        <div className="inventory-header">
          <h2>🎒 인벤토리</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="inventory-content">
          <div className="inventory-stats">
            <p>📦 총 아이템 수: {totalItems}</p>
            <button className="refresh-button" onClick={handleGetInventory}>
              🔄 새로고침
            </button>
          </div>

          <div className="inventory-items">
            {totalItems === 0 ? (
              <div className="empty-inventory">
                <p>인벤토리가 비어있습니다</p>
              </div>
            ) : (
              Object.entries(inventory).map(([itemId, quantity]) => {
                const item = ITEMS[itemId]
                if (!item) return null

                const isConsumable = item.type === 'consumable'

                return (
                  <div
                    key={itemId}
                    className={`inventory-item ${selectedItem === itemId ? 'selected' : ''}`}
                    onClick={() => handleItemClick(itemId)}
                  >
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-quantity">x{quantity}</div>
                      <div className="item-description">{item.description}</div>
                    </div>
                    {isConsumable && (
                      <button
                        className="use-item-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUseItem(itemId)
                        }}
                      >
                        사용
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}