import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'

const ITEMS = {
  healthPotion: {
    id: 'healthPotion',
    nameKey: 'ui.items.healthPotion',
    type: 'consumable',
    effect: { hp: 50 },
    icon: '❤️',
    description: 'HP +50 RESTORE'
  },
  coin: {
    id: 'coin',
    nameKey: 'ui.items.coin',
    type: 'currency',
    effect: { currency: 10 },
    icon: '🪙',
    description: 'CURRENCY ITEM'
  },
  giftBox: {
    id: 'giftBox',
    nameKey: 'ui.items.giftBox',
    type: 'consumable',
    effect: { affinity: 10 },
    icon: '🎁',
    description: 'AFFINITY +10'
  },
  experiencePotion: {
    id: 'experiencePotion',
    nameKey: 'ui.items.experiencePotion',
    type: 'consumable',
    effect: { experience: 100 },
    icon: '⚡',
    description: 'EXP +100'
  }
}

export default function Inventory({ show, onClose, inventory, characterId, onUseItem, onGetInventory }) {
  const { t } = useI18n()
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
    <div className="modal-overlay pixel-overlay">
      <div className="inventory-modal pixel-panel pixel-pop">
        <div className="inventory-header pixel-panel-header pixel-text-lg pixel-font">
          <h2>🎒 {t('ui.inventory.title')}</h2>
          <button className="close-button pixel-button pixel-button-red" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="inventory-content">
          <div className="inventory-stats pixel-panel-body">
            <p className="pixel-text-md pixel-font">📦 {t('ui.inventory.total')}: {totalItems}</p>
            <button className="refresh-button pixel-button" onClick={handleGetInventory}>
              {t('ui.buttons.refresh')}
            </button>
          </div>

          <div className="inventory-items pixel-scroll">
            {totalItems === 0 ? (
              <div className="empty-inventory pixel-font pixel-text-md">
                <p>{t('ui.inventory.empty')}</p>
              </div>
            ) : (
              <div className="pixel-grid">
                {Object.entries(inventory).map(([itemId, quantity]) => {
                  const item = ITEMS[itemId]
                  if (!item) return null

                  const isConsumable = item.type === 'consumable'

                  return (
                    <div
                      key={itemId}
                      className={`pixel-grid-item ${selectedItem === itemId ? 'selected' : ''}`}
                      onClick={() => handleItemClick(itemId)}
                    >
                      <div className="item-icon pixel-icon-lg">{item.icon}</div>
                      <div className="item-info pixel-font pixel-text-sm">
                        <div className="item-name pixel-text-md">{t(item.nameKey)}</div>
                        <div className="item-quantity pixel-badge-orange">x{quantity}</div>
                        <div className="item-description pixel-text-sm">{item.description}</div>
                      </div>
                      {isConsumable && (
                        <button
                          className="use-item-button pixel-button pixel-button-green pixel-text-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUseItem(itemId)
                          }}
                        >
                          {t('ui.buttons.use')}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}