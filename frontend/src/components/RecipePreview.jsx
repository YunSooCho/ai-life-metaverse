import React, { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import './RecipePreview.css'

/**
 * 레시피 미리보기 컴포넌트
 * 선택된 레시피 상세 정보 및 제작 버튼
 */
export default function RecipePreview({ recipe, inventory, craftingLevel, onCraft }) {
  const { t } = useI18n()
  const [isCrafting, setIsCrafting] = useState(false)

  const canCraft = () => {
    if (!recipe.materials || recipe.materials.length === 0) return false
    if (recipe.requiredLevel > craftingLevel) return false

    for (const material of recipe.materials) {
      const availableQuantity = inventory[material.itemId] || 0
      if (availableQuantity < material.quantity) {
        return false
      }
    }

    return true
  }

  const calculateSuccessRate = () => {
    const baseRate = 1.0
    const levelPenalty = Math.max(0, (recipe.requiredLevel - craftingLevel) * 0.05)
    const finalRate = Math.max(0.1, baseRate - levelPenalty - (recipe.maxFailureRate || 0))
    return Math.floor(finalRate * 100)
  }

  const handleCraft = () => {
    if (!canCraft()) return

    setIsCrafting(true)
    setTimeout(() => {
      onCraft()
      setIsCrafting(false)
    }, 1000)
  }

  const successRate = calculateSuccessRate()
  const craftable = canCraft()

  if (!recipe) return null

  return (
    <div className="recipe-preview">
      {/* 레시피 정보 */}
      <div className="preview-info pixel-panel-body pixel-font">
        <div className="preview-title pixel-text-md">
          {recipe.name}
        </div>
        <div className="preview-description pixel-text-sm">
          {recipe.description}
        </div>

        <div className="preview-divider"></div>

        {/* 필요 레벨 */}
        <div className="preview-level pixel-text-sm">
          <span className="label">⚒️ {t('ui.crafting.requiredLevel')}:</span>
          <span className={`value ${recipe.requiredLevel > craftingLevel ? 'insufficient' : ''}`}>
            {recipe.requiredLevel}
          </span>
        </div>

        {/* 난이도 */}
        <div className="preview-difficulty pixel-text-sm">
          <span className="label">🎯 {t('ui.crafting.difficulty')}:</span>
          <span className={`value difficulty-${recipe.difficulty}`}>
            {recipe.difficulty.toUpperCase()}
          </span>
        </div>

        {/* 성공 확률 */}
        <div className="preview-success-rate pixel-text-sm">
          <span className="label">📊 {t('ui.crafting.successRate')}:</span>
          <span className={`value ${successRate < 50 ? 'low' : successRate < 80 ? 'medium' : 'high'}`}>
            {successRate}%
          </span>
        </div>

        <div className="preview-divider"></div>

        {/* 재료 목록 */}
        <div className="preview-materials">
          <div className="materials-title pixel-text-sm">
            📦 {t('ui.crafting.materials')}:
          </div>
          <div className="materials-list">
            {recipe.materials && recipe.materials.length > 0 ? (
              recipe.materials.map((material, idx) => {
                const availableQuantity = inventory[material.itemId] || 0
                const hasEnough = availableQuantity >= material.quantity

                return (
                  <div
                    key={idx}
                    className={`material-item pixel-font ${hasEnough ? '' : 'insufficient'}`}
                  >
                    <span className="material-name pixel-text-sm">
                      {material.itemId}
                    </span>
                    <span className="material-quantity pixel-text-sm">
                      {availableQuantity} / {material.quantity}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="no-materials pixel-text-sm">
                {t('ui.crafting.noMaterials')}
              </div>
            )}
          </div>
        </div>

        <div className="preview-divider"></div>

        {/* 결과물 */}
        {recipe.result && (
          <div className="preview-result">
            <div className="result-title pixel-text-sm">
              ✨ {t('ui.crafting.result')}:
            </div>
            <div className="result-item pixel-text-md">
              <span className="result-icon">→</span>
              <span className="result-name">
                {recipe.result.itemId}
              </span>
              {recipe.result.minQuantity && recipe.result.maxQuantity ? (
                <span className="result-range">
                  {recipe.result.minQuantity} ~ {recipe.result.maxQuantity}
                </span>
              ) : (
                <span className="result-quantity">
                  × {recipe.result.quantity}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 제작 버튼 */}
      <div className="preview-actions pixel-panel-body">
        <button
          className={`craft-button pixel-button pixel-button-lg ${craftable ? 'pixel-button-green' : 'pixel-button-gray'}`}
          onClick={handleCraft}
          disabled={!craftable || isCrafting}
        >
          {isCrafting ? (
            <span className="crafting-text pixel-font">
              ⚒️ {t('ui.crafting.crafting')}...
            </span>
          ) : craftable ? (
            <span className="pixel-font">
              🔨 {t('ui.crafting.craft')}
            </span>
          ) : (
            <span className="pixel-font">
              🔒 {t('ui.crafting.disabled')}
            </span>
          )}
        </button>

        {!craftable && (
          <div className="craft-warning pixel-text-sm pixel-font">
            {recipe.requiredLevel > craftingLevel
              ? `⚠️ ${t('ui.crafting.levelRequired')}: ${recipe.requiredLevel}`
              : `⚠️ ${t('ui.crafting.materialsInsufficient')}`
            }
          </div>
        )}
      </div>
    </div>
  )
}