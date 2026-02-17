/**
 * 캐릭터 커스터마이징 Modal 컴포넌트
 *
 * 플레이어의 아바타 스타일(머리 길이, 옷 색상, 액세서리)을 커스터마이징합니다.
 */

import { useState, useEffect } from 'react'
import {
  getCustomization,
  saveCustomization,
  updateCustomization,
  getOptionEmoji,
  getColorHex
} from '../utils/characterCustomization'
import {
  CUSTOMIZATION_CATEGORIES,
  OPTIONS_BY_CATEGORY
} from '../data/customizationOptions'

/**
 * CharacterCustomizationModal 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.show - Modal 표시 여부
 * @param {Function} props.onClose - Modal 닫기 핸들러
 * @param {Function} props.onSave - 저장 완료 핸들러
 */
function CharacterCustomizationModal({ show, onClose, onSave }) {
  const [selectedCategory, setSelectedCategory] = useState(CUSTOMIZATION_CATEGORIES.HAIR_STYLES)
  const [currentCustomization, setCurrentCustomization] = useState({})
  const [tempCustomization, setTempCustomization] = useState({})

  // Modal이 열릴 때 커스터마이징 설정 로드
  useEffect(() => {
    if (show) {
      const saved = getCustomization()
      setCurrentCustomization(saved)
      setTempCustomization({ ...saved })
    }
  }, [show])

  /**
   * 카테고리 변경 핸들러
   */
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  /**
   * 옵션 선택 핸들러
   */
  const handleOptionSelect = (optionId) => {
    const updated = updateCustomization(tempCustomization, selectedCategory, optionId)
    setTempCustomization(updated)
  }

  /**
   * 저장 핸들러
   */
  const handleSave = () => {
    saveCustomization(tempCustomization)
    setCurrentCustomization(tempCustomization)

    if (onSave) {
      onSave(tempCustomization)
    }

    onClose()
  }

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    setTempCustomization({ ...currentCustomization })
    onClose()
  }

  /**
   * 카테고리 표시 이름
   */
  const getCategoryName = (category) => {
    const names = {
      [CUSTOMIZATION_CATEGORIES.HAIR_STYLES]: '머리 스타일',
      [CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS]: '옷 색상',
      [CUSTOMIZATION_CATEGORIES.ACCESSORIES]: '액세서리'
    }
    return names[category] || category
  }

  /**
   * 프리뷰 캐릭터 색상 가져오기
   */
  const getCharacterColor = () => {
    return getColorHex(tempCustomization.clothingColor || 'blue')
  }

  if (!show) {
    return null
  }

  const categories = Object.values(CUSTOMIZATION_CATEGORIES)

  /**
   * 현재 카테고리에 해당하는 현재 선택된 옵션 ID를 가져옵니다
   */
  const getCurrentOptionId = () => {
    if (selectedCategory === CUSTOMIZATION_CATEGORIES.HAIR_STYLES) {
      return tempCustomization.hairStyle
    }
    if (selectedCategory === CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS) {
      return tempCustomization.clothingColor
    }
    return tempCustomization.accessory
  }

  const currentOptionId = getCurrentOptionId()

  return (
    <div className="pixel-overlay pixel-pop">
      <div className="pixel-panel" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 1001
      }}>
        {/* Header */}
        <div className="pixel-panel-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>👤 캐릭터 커스터마이징</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--pixel-accent-red)',
              color: '#000',
              border: '2px solid #000',
              padding: '8px 12px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="pixel-panel-body">
          {/* Character Preview */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            background: 'var(--pixel-bg-secondary)',
            border: '2px solid #ffffff',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              {/* Head with Emoji */}
              <div style={{
                position: 'relative',
                fontSize: '48px',
                lineHeight: 1
              }}>
                <span style={{
                  display: 'inline-block',
                  filter: getCharacterColor() !== '#4CAF50' ? `brightness(0.8) saturate(1.5)` : 'none'
                }}>
                  {getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, tempCustomization.hairStyle)}
                </span>
                {/* Accessory Overlay */}
                {tempCustomization.accessory !== 'none' && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-12px',
                    fontSize: '24px'
                  }}>
                    {getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, tempCustomization.accessory)}
                  </span>
                )}
              </div>

              {/* Body with Clothing Color */}
              <div style={{
                width: '40px',
                height: '50px',
                background: getCharacterColor(),
                border: '2px solid #000',
                borderRadius: '4px',
                position: 'relative'
              }}>
                {/* Clothing Detail */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 0 #000'
                }}>
                  👕
                </div>
              </div>

              {/* Preview Label */}
              <div style={{
                marginTop: '12px',
                fontSize: '10px',
                color: 'var(--pixel-text-muted)',
                textAlign: 'center'
              }}>
                {getOptionEmoji(CUSTOMIZATION_CATEGORIES.HAIR_STYLES, tempCustomization.hairStyle)}{' '}
                {getOptionEmoji(CUSTOMIZATION_CATEGORIES.ACCESSORIES, tempCustomization.accessory)}{' '}
                <span style={{ color: getCharacterColor() }}>●</span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '16px'
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  background: selectedCategory === category
                    ? 'var(--pixel-accent-green)'
                    : 'var(--pixel-bg-secondary)',
                  color: selectedCategory === category ? '#000' : '#fff',
                  border: '2px solid #ffffff',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {Object.values(OPTIONS_BY_CATEGORY[selectedCategory] || {}).map(option => {
              const isSelected = currentOptionId === option.id
              return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                style={{
                  padding: '12px 8px',
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  background: isSelected ? 'var(--pixel-accent-green)' : 'var(--pixel-bg-secondary)',
                  color: isSelected ? '#000' : '#fff',
                  border: '2px solid #ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.1s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translate(-2px, -2px)'
                  e.target.style.boxShadow = '2px 2px 0 0 #000'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translate(0, 0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {/* Color preview for clothing colors */}
                {selectedCategory === CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS && option.hex && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: option.hex,
                    border: '1px solid #fff'
                  }} />
                )}

                {/* Emoji preview */}
                {selectedCategory !== CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS && !!option.emoji && (
                  <span style={{ fontSize: '20px' }}>
                    {option.emoji}
                  </span>
                )}

                {/* Option name */}
                <span style={{
                  fontSize: '9px',
                  textAlign: 'center',
                  lineHeight: 1.3
                }}>
                  {option.name}
                </span>
              </button>
              )
            })}
          </div>

          {/* Button Actions */}
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleCancel}
              className="pixel-button pixel-button-red"
              style={{
                flex: 1
              }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="pixel-button pixel-button-green"
              style={{
                flex: 1
              }}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterCustomizationModal