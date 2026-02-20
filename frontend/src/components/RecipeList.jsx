import React from 'react'
import { useI18n } from '../i18n/I18nContext'
import './RecipeList.css'

/**
 * 레시피 목록 컴포넌트
 * 제작 가능한 레시피 목록 표시
 */
export default function RecipeList({ recipes, inventory, craftingLevel, selectedRecipe, onSelectRecipe }) {
  const { t } = useI18n()

  const canCraftRecipe = (recipe) => {
    if (!recipe.materials || recipe.materials.length === 0) return false

    // 레벨 확인
    if (recipe.requiredLevel > craftingLevel) return false

    // 재료 확인
    for (const material of recipe.materials) {
      const availableQuantity = inventory[material.itemId] || 0
      if (availableQuantity < material.quantity) {
        return false
      }
    }

    return true
  }

  const getMissingMaterials = (recipe) => {
    if (!recipe.materials || recipe.materials.length === 0) return []

    const missing = []
    for (const material of recipe.materials) {
      const availableQuantity = inventory[material.itemId] || 0
      if (availableQuantity < material.quantity) {
        missing.push({
          ...material,
          missing: material.quantity - availableQuantity
        })
      }
    }

    return missing
  }

  const getRecipeIcon = (category) => {
    const icons = {
      equipment: '⚔️',
      consumable: '🧪',
      material: '🪨',
      general: '📦'
    }
    return icons[category] || '📦'
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#4ade80',      // Green
      normal: '#60a5fa',    // Blue
      hard: '#f59e0b',      // Orange
      expert: '#ef4444'     // Red
    }
    return colors[difficulty] || '#9ca3af'
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="recipe-list-empty pixel-font pixel-text-md">
        <p>{t('ui.crafting.noRecipes')}</p>
      </div>
    )
  }

  return (
    <div className="recipe-list pixel-scroll">
      {recipes.map((recipe) => {
        const canCraft = canCraftRecipe(recipe)
        const missingMaterials = getMissingMaterials(recipe)
        const isSelected = selectedRecipe?.id === recipe.id

        return (
          <div
            key={recipe.id}
            className={`recipe-item pixel-panel-body pixel-font ${isSelected ? 'selected' : ''} ${!canCraft ? 'disabled' : ''}`}
            onClick={() => canCraft && onSelectRecipe(recipe)}
          >
            {/* 레시피 헤더 */}
            <div className="recipe-header">
              <div className="recipe-icon">
                {getRecipeIcon(recipe.category)}
              </div>
              <div className="recipe-info">
                <div className="recipe-name pixel-text-md">
                  {recipe.name}
                </div>
                <div className="recipe-details pixel-text-sm">
                  <span className="recipe-level">
                    ⚒️ {t('ui.crafting.requiredLevel')}: {recipe.requiredLevel}
                  </span>
                  <span
                    className="recipe-difficulty"
                    style={{ color: getDifficultyColor(recipe.difficulty) }}
                  >
                    {recipe.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="recipe-status">
                {canCraft ? (
                  <span className="status-available pixel-text-sm">
                    ✓ {t('ui.crafting.canCraft')}
                  </span>
                ) : (
                  <span className="status-unavailable pixel-text-sm">
                    ✕ {t('ui.crafting.cannotCraft')}
                  </span>
                )}
              </div>
            </div>

            {/* 레시피 설명 */}
            <div className="recipe-description pixel-text-sm">
              {recipe.description}
            </div>

            {/* 결과물 */}
            {recipe.result && (
              <div className="recipe-result">
                <span className="result-icon">→</span>
                <span className="result-name pixel-text-sm">
                  {recipe.result.itemId} × {recipe.result.minQuantity || recipe.result.quantity}
                </span>
              </div>
            )}

            {/* 제작 불가능 사유 */}
            {!canCraft && missingMaterials.length > 0 && (
              <div className="recipe-missing pixel-text-sm">
                <span className="missing-label">
                  {t('ui.crafting.missingMaterials')}:
                </span>
                {missingMaterials.map((material, idx) => (
                  <span key={idx} className="missing-item">
                    {material.itemId} (-{material.missing})
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}