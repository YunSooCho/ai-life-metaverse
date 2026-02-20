import React from 'react';
import PropTypes from 'prop-types';

/**
 * RecipeList Component - 레시피 목록 UI
 */
const RecipeList = ({ recipes, level, inventory, onRecipeSelect, selectedRecipe, onCraft, isCrafting, t }) => {
  // 레시피 제작 가능 여부 확인
  const canCraftRecipe = (recipe) => {
    // 레벨 확인
    if (level < recipe.requiredLevel) {
      return false;
    }

    // 재료 확인
    for (const material of recipe.materials) {
      const materialCount = inventory[material.itemId] || 0;
      if (materialCount < material.quantity) {
        return false;
      }
    }

    return true;
  };

  // 재료 부족 여부 확인
  const hasMissingMaterials = (recipe) => {
    for (const material of recipe.materials) {
      const materialCount = inventory[material.itemId] || 0;
      if (materialCount < material.quantity) {
        return true;
      }
    }
    return false;
  };

  // 레시피 정렬 (카테고리 > 레벨 > 이름)
  const sortedRecipes = [...recipes].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.requiredLevel !== b.requiredLevel) return a.requiredLevel - b.requiredLevel;
    return a.name.localeCompare(b.name);
  });

  // 카테고리별 그룹화
  const groupedRecipes = sortedRecipes.reduce((groups, recipe) => {
    const category = recipe.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(recipe);
    return groups;
  }, {});

  const categoryNames = {
    equipment: t('categories.equipment') || '장비',
    consumable: t('categories.consumable') || '소모품',
    material: t('categories.material') || '재료',
    special: t('categories.special') || '특수',
    other: t('categories.other') || '기타'
  };

  return (
    <div className="recipe-list">
      <h3 className="pixel-font">{t('recipeList')}</h3>
      
      {sortedRecipes.length === 0 ? (
        <div className="no-recipes">{t('noRecipes')}</div>
      ) : (
        Object.keys(groupedRecipes).map(category => (
          <div key={category} className="recipe-category">
            <h4 className="pixel-font category-title">
              {categoryNames[category] || category}
            </h4>
            {groupedRecipes[category].map(recipe => {
              const canCraft = canCraftRecipe(recipe);
              const missingMaterials = hasMissingMaterials(recipe);
              const isSelected = selectedRecipe?.id === recipe.id;

              return (
                <div
                  key={recipe.id}
                  className={`recipe-item ${isSelected ? 'selected' : ''} ${!canCraft ? 'disabled' : ''}`}
                  onClick={() => canCraft && onRecipeSelect(recipe)}
                >
                  {/* 레시피 아이콘 */}
                  <div className="recipe-icon">
                    <div className={`recipe-badge ${recipe.difficulty}`}>
                      {recipe.requiredLevel}
                    </div>
                  </div>

                  {/* 레시피 정보 */}
                  <div className="recipe-info">
                    <h5 className="recipe-name">{recipe.name}</h5>
                    <p className="recipe-description">{recipe.description}</p>

                    {/* 레벨 표시 */}
                    <div className="recipe-level">
                      {level < recipe.requiredLevel ? (
                        <span className="level-locked">
                          ⚠️ {t('levelRequired')}: {recipe.requiredLevel}
                        </span>
                      ) : (
                        <span className="level-unlocked">
                          ✅ {t('level')}: {recipe.requiredLevel}
                        </span>
                      )}
                    </div>

                    {/* 제작 가능 상태 */}
                    {!canCraft && (
                      <div className="recipe-status">
                        {missingMaterials ? (
                          <span className="status-missing">{t('missingMaterials')}</span>
                        ) : (
                          <span className="status-locked">{t('levelTooLow')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 제작 버튼 */}
                  <button
                    className={`pixel-button craft-mini ${isCrafting ? 'disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canCraft && !isCrafting) {
                        onCraft(recipe);
                      }
                    }}
                    disabled={!canCraft || isCrafting}
                  >
                    {isCrafting ? '...' : t('craft')}
                  </button>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};

RecipeList.propTypes = {
  recipes: PropTypes.array.isRequired,
  level: PropTypes.number.isRequired,
  inventory: PropTypes.object.isRequired,
  onRecipeSelect: PropTypes.func.isRequired,
  selectedRecipe: PropTypes.object,
  onCraft: PropTypes.func.isRequired,
  isCrafting: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired
};

RecipeList.defaultProps = {
  selectedRecipe: null
};

export default RecipeList;