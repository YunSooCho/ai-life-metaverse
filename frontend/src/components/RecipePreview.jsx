import React from 'react';
import PropTypes from 'prop-types';

/**
 * RecipePreview Component - 레시피 미리보기 UI
 */
const RecipePreview = ({ recipe, inventory, level, table, onCraft, isCrafting, t }) => {
  // 제작 가능 여부 확인
  const canCraft = () => {
    if (level < recipe.requiredLevel) return false;

    for (const material of recipe.materials) {
      const materialCount = inventory[material.itemId] || 0;
      if (materialCount < material.quantity) {
        return false;
      }
    }

    return true;
  };

  // 실패 확률 계산
  const calculateFailureRate = () => {
    const baseFailureRate = recipe.maxFailureRate || 0;
    const levelDiff = recipe.requiredLevel - level;

    // 레벨이 높을수록 실패 확률 감소
    let adjustedFailureRate = Math.max(0, baseFailureRate - (levelDiff * -0.05));

    // 제작대 보너스 적용
    if (table?.bonus?.failRateReduction) {
      adjustedFailureRate *= (1 - table.bonus.failRateReduction);
    }

    return Math.max(0, Math.min(1, adjustedFailureRate));
  };

  const failureRate = calculateFailureRate();
  const successRate = (1 - failureRate) * 100;
  const failRatePercent = (failureRate * 100).toFixed(1);

  // 경험치 계산
  const calculateExpGain = () => {
    const difficultyMultipliers = {
      easy: 0.5,
      normal: 1.0,
      hard: 1.5,
      expert: 2.0
    };
    const multiplier = difficultyMultipliers[recipe.difficulty] || 1.0;
    const expGain = 20 * multiplier * recipe.requiredLevel;

    // 제작대 보너스 적용
    let finalExpGain = expGain;
    if (table?.bonus?.expBoost) {
      finalExpGain *= (1 + table.bonus.expBoost);
    }

    return Math.floor(finalExpGain);
  };

  const expGain = calculateExpGain();

  return (
    <div className="recipe-preview">
      <h3 className="pixel-font">{t('recipePreview')}</h3>

      {/* 결과물 아이콘 */}
      <div className="result-preview">
        <div className="result-icon">📦</div>
        <div className="result-info">
          <h4 className="result-name">{recipe.name}</h4>
          <p className="result-description">{recipe.description}</p>

          {/* 난이도 표시 */}
          <div className={`recipe-difficulty ${recipe.difficulty}`}>
            {t(`difficulty.${recipe.difficulty}`)}
          </div>
        </div>
      </div>

      {/* 결과물 상세 */}
      <div className="result-details">
        <h4 className="pixel-font">{t('result')}</h4>
        <div className="result-items">
          <div className="result-item">
            <span className="item-icon">🎁</span>
            <span className="item-name">{recipe.result.itemId}</span>
            <span className="item-quantity">
              {recipe.result.quantity}
              {recipe.result.minQuantity !== recipe.result.maxQuantity && (
                <span className="quantity-range">
                  ({recipe.result.minQuantity}~{recipe.result.maxQuantity})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 재료 목록 */}
      <div className="materials-list">
        <h4 className="pixel-font">{t('materials')}</h4>
        {recipe.materials.map((material, index) => {
          const materialCount = inventory[material.itemId] || 0;
          const hasEnough = materialCount >= material.quantity;
          const isMissing = materialCount < material.quantity;

          return (
            <div
              key={index}
              className={`material-item ${hasEnough ? 'sufficient' : 'insufficient'}`}
            >
              <span className="material-icon">📄</span>
              <span className="material-name">{material.itemId}</span>
              <div className="material-quantity">
                <span className={`quantity ${hasEnough ? 'enough' : 'missing'}`}>
                  {materialCount} / {material.quantity}
                </span>
                {isMissing && <span className="missing-icon">⚠️</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 제작 정보 */}
      <div className="crafting-info">
        <div className="info-row">
          <span className="info-label">{t('successRate')}:</span>
          <span className="info-value success">{successRate.toFixed(1)}%</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t('failureRate')}:</span>
          <span className="info-value failure">{failRatePercent}%</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t('expGain')}:</span>
          <span className="info-value exp">+{expGain} EXP</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t('craftingTime')}:</span>
          <span className="info-value">
            {(recipe.craftingTime / 1000).toFixed(1)}s
          </span>
        </div>
        {table && (
          <div className="info-row">
            <span className="info-label">{t('craftingTable')}:</span>
            <span className="info-value table">{table.name}</span>
          </div>
        )}
      </div>

      {/* 제작 버튼 */}
      <button
        className={`pixel-button craft-button ${!canCraft() || isCrafting ? 'disabled' : ''}`}
        onClick={onCraft}
        disabled={!canCraft() || isCrafting}
      >
        {isCrafting ? (
          <span>{t('crafting')}...</span>
        ) : (
          <span>{t('craft')}</span>
        )}
      </button>
    </div>
  );
};

RecipePreview.propTypes = {
  recipe: PropTypes.object.isRequired,
  inventory: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
  table: PropTypes.object,
  onCraft: PropTypes.func.isRequired,
  isCrafting: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired
};

RecipePreview.defaultProps = {
  table: null
};

export default RecipePreview;