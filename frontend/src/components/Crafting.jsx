import React, { useState, useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import RecipeList from './RecipeList'
import RecipePreview from './RecipePreview'
import './Crafting.css'

/**
 * 제작 시스템 메인 UI 컴포넌트
 * JRPG 스타일 픽셀 UI로 제작 기능 구현
 */
export default function Crafting({ show, onClose, characterId, socket }) {
  const { t } = useI18n()
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [craftingLevel, setCraftingLevel] = useState({ level: 1, exp: 0, expToNext: 100 })
  const [recipes, setRecipes] = useState([])
  const [inventory, setInventory] = useState({})
  const [craftingHistory, setCraftingHistory] = useState([])
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (show && characterId) {
      loadCraftingData()
    }
  }, [show, characterId])

  useEffect(() => {
    if (!socket) return

    // 제작 이벤트 리스너
    socket.on('craftingResult', handleCraftingResult)
    socket.on('inventoryUpdate', (data) => {
      setInventory(data.inventory || {})
    })

    return () => {
      socket.off('craftingResult', handleCraftingResult)
      socket.off('inventoryUpdate')
    }
  }, [socket])

  const loadCraftingData = () => {
    if (!socket) return

    // 제작 레벨 조회
    socket.emit('getCraftingLevel', { characterId }, (response) => {
      if (response.success) {
        setCraftingLevel(response.data)
      }
    })

    // 레시피 목록 조회
    socket.emit('getRecipes', { characterId }, (response) => {
      if (response.success) {
        setRecipes(response.data || [])
      }
    })

    // 인벤토리 조회
    socket.emit('getInventory', { characterId }, (response) => {
      if (response.success) {
        setInventory(response.inventory || {})
      }
    })

    // 제작 기록 조회
    socket.emit('getCraftingHistory', { characterId }, (response) => {
      if (response.success) {
        setCraftingHistory(response.data || [])
      }
    })
  }

  const handleCraftingResult = (data) => {
    if (data.success) {
      showNotification(t('ui.crafting.craftingSuccess'), 'success')
      loadCraftingData() // 데이터 갱신
    } else {
      showNotification(data.message || t('ui.crafting.craftingFailed'), 'error')
    }
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCraft = (recipeId) => {
    if (!socket || !characterId) return

    socket.emit('craft', { characterId, recipeId }, (response) => {
      if (response.success) {
        // 결과는 craftingResult 이벤트로 받음
      } else {
        showNotification(response.message || t('ui.crafting.craftingFailed'), 'error')
      }
    })
  }

  if (!show) return null

  const expPercentage = craftingLevel.expToNext > 0
    ? Math.floor((craftingLevel.exp / craftingLevel.expToNext) * 100)
    : 0

  return (
    <div className="crafting-overlay pixel-overlay" onClick={onClose}>
      <div className="crafting-panel pixel-panel pixel-pop" onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="crafting-header pixel-panel-header pixel-text-lg pixel-font">
          <h2>🔨 {t('ui.crafting.title')}</h2>
          <button className="close-button pixel-button pixel-button-red" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 제작 레벨 & 경험치 바 */}
        <div className="crafting-level-section pixel-panel-body pixel-font">
          <div className="level-display pixel-text-md">
            <span className="level-icon">⚒️</span>
            <span className="level-text">
              {t('ui.crafting.level')}: {craftingLevel.level}
            </span>
            <span className="exp-text">
              {craftingLevel.exp} / {craftingLevel.expToNext}
            </span>
          </div>
          <div className="exp-bar-container">
            <div
              className="exp-bar-fill"
              style={{ width: `${expPercentage}%` }}
            ></div>
            <div className="exp-bar-percentage">{expPercentage}%</div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="crafting-content">
          {/* 레시피 목록 */}
          <div className="crafting-recipes-section">
            <div className="pixel-panel-header pixel-text-md pixel-font">
              <h3>📜 {t('ui.crafting.recipes')}</h3>
            </div>
            <RecipeList
              recipes={recipes}
              inventory={inventory}
              craftingLevel={craftingLevel.level}
              selectedRecipe={selectedRecipe}
              onSelectRecipe={setSelectedRecipe}
            />
          </div>

          {/* 레시피 미리보기 / 제작 버튼 */}
          <div className="crafting-preview-section">
            <div className="pixel-panel-header pixel-text-md pixel-font">
              <h3>👀 {t('ui.crafting.preview')}</h3>
            </div>
            {selectedRecipe ? (
              <RecipePreview
                recipe={selectedRecipe}
                inventory={inventory}
                craftingLevel={craftingLevel.level}
                onCraft={() => handleCraft(selectedRecipe.id)}
              />
            ) : (
              <div className="empty-preview pixel-font pixel-text-md">
                <p>{t('ui.crafting.selectRecipe')}</p>
              </div>
            )}
          </div>
        </div>

        {/* 알림 */}
        {notification && (
          <div className={`crafting-notification ${notification.type} pixel-font`}>
            {notification.message}
          </div>
        )}

      </div>
    </div>
  )
}