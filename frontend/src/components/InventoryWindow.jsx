import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import './InventoryWindow.css';

/**
 * 픽셀아트 스타일 아이템 창 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.visible - 표시 여부
 * @param {Array<Object>} props.items - 아이템 목록 [{ id, name, icon, description, quantity }]
 * @param {function} props.onItemSelect - 아이템 선택 콜백
 * @param {function} props.onClose - 닫기 버튼 콜백
 * @param {string} props.title - 창 제목 (기본: "인벤토리")
 */
function InventoryWindow({
  visible = true,
  items = [],
  onItemSelect,
  onClose,
  title
}) {
  const { t } = useI18n()
  const [selectedItem, setSelectedItem] = useState(null);
  const displayTitle = title || t('ui.inventory.title')

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  if (!visible) return null;

  return (
    <div className="inventory-window-overlay">
      <div className="inventory-window">
        {/* 헤더 */}
        <div className="inventory-header">
          <h2 className="inventory-title">{displayTitle}</h2>
          <button className="pixel-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 아이템 그리드 */}
        <div className="inventory-content">
          {items.length === 0 ? (
            <div className="inventory-empty">
              <p className="empty-text">{t('ui.inventory.empty')}</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`inventory-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="item-icon">{item.icon || '📦'}</div>
                  <div className="item-name">{item.name}</div>
                  {item.quantity > 1 && (
                    <div className="item-quantity">x{item.quantity}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 아이템 상세 정보 */}
        {selectedItem && (
          <div className="inventory-footer">
            <div className="item-detail">
              <h3 className="detail-name">{selectedItem.name}</h3>
              <p className="detail-description">{selectedItem.description}</p>
              <div className="detail-actions">
                <button className="pixel-action-button">{t('ui.buttons.use')}</button>
                <button className="pixel-action-button">{t('ui.inventory.drop')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryWindow;