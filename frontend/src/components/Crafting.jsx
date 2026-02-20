import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import RecipeList from './RecipeList';
import RecipePreview from './RecipePreview';
import { useI18n } from '../i18n/I18nContext';
import './Crafting.css';

const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling']
});

/**
 * Crafting Component - 제작 시스템 메인 UI
 */
const Crafting = ({ craftingLevel, craftingExp, characterId, onClose }) => {
  const { t } = useI18n();

  // crafting 네임스페이스 번역 helper
  const tc = (key) => t(`ui.crafting.${key}`);

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [craftingTables, setCraftingTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftingHistory, setCraftingHistory] = useState([]);
  const [inventory, setInventory] = useState({});
  const [levelStats, setLevelStats] = useState({
    level: 1,
    exp: 0,
    expToNext: 100
  });

  // 레벨 계산
  const expToNext = Math.floor(100 * Math.pow(1.5, levelStats.level - 1));
  const progressPercent = (levelStats.exp / expToNext) * 100;

  // 레시피 목록 불러오기
  useEffect(() => {
    if (characterId) {
      fetchRecipes();
      fetchCraftingLevel();
      fetchCraftingTables();
      
      socket.on('craftingResult', handleCraftingResult);
      socket.on('craftingError', handleCraftingError);
    }

    return () => {
      socket.off('craftingResult', handleCraftingResult);
      socket.off('craftingError', handleCraftingError);
    };
  }, [characterId]);

  const fetchRecipes = () => {
    socket.emit('getRecipes', { characterId }, (response) => {
      if (response.success) {
        setRecipes(response.recipes);
      }
    });
  };

  const fetchCraftingLevel = () => {
    socket.emit('getCraftingLevel', { characterId }, (response) => {
      if (response.success) {
        setLevelStats(response.levelStats);
      }
    });
  };

  const fetchCraftingTables = () => {
    socket.emit('getCraftingTables', { characterId }, (response) => {
      if (response.success) {
        setCraftingTables(response.tables);
        if (response.tables.length > 0) {
          setSelectedTable(response.tables[0]);
        }
      }
    });
  };

  const fetchInventory = () => {
    // Inventory 컴포넌트와 통합 필요
    socket.emit('getInventory', { characterId }, (response) => {
      if (response.success) {
        setInventory(response.inventory);
      }
    });
  };

  const handleCraftingResult = (data) => {
    setIsCrafting(false);
    
    // 제작 성공/실패 메시지
    const result = data.success ? 'crafting.success' : 'crafting.failure';
    
    // 기록 추가
    const historyEntry = {
      recipeId: data.recipeId,
      success: data.success,
      resultItems: data.resultItems,
      timestamp: new Date().toISOString()
    };
    
    setCraftingHistory([historyEntry, ...craftingHistory]);
    
    // 레벨/경험치 갱신
    if (data.levelStats) {
      setLevelStats(data.levelStats);
    }
    
    // 인벤토리 갱신
    fetchInventory();
    
    // 알림 표시
    alert(result);
  };

  const handleCraftingError = (error) => {
    setIsCrafting(false);
    alert(`Error: ${error.message}`);
  };

  // 제작 실행
  const handleCraft = (recipe) => {
    if (!selectedTable) {
      alert('crafting.noTable');
      return;
    }

    if (isCrafting) return;

    setIsCrafting(true);
    
    socket.emit('craft', {
      characterId,
      recipeId: recipe.id,
      tableId: selectedTable.id
    }, (response) => {
      if (!response.success) {
        setIsCrafting(false);
        alert(`Error: ${response.error}`);
      }
    });
  };

  return (
    <div className="crafting-panel">
      {/* 헤더 */}
      <div className="crafting-header">
        <h2 className="pixel-font">{tc('title')}</h2>
        <button className="pixel-button close-btn" onClick={onClose}>×</button>
      </div>

      {/* 제작 레벨 표시 */}
      <div className="crafting-level">
        <div className="level-info">
          <span className="pixel-font level-label">{tc('level')}: {levelStats.level}</span>
          <span className="pixel-font exp-label">
            EXP: {levelStats.exp} / {expToNext}
          </span>
        </div>
        <div className="exp-bar-container">
          <div className="exp-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* 제작대 선택 */}
      {craftingTables.length > 1 && (
        <div className="crafting-tables">
          <h3 className="pixel-font">{tc('craftingTable') || '제작대'}</h3>
          <div className="table-list">
            {craftingTables.map(table => (
              <button
                key={table.id}
                className={`pixel-button table-item ${selectedTable?.id === table.id ? 'active' : ''}`}
                onClick={() => setSelectedTable(table)}
              >
                <span className="table-name">{table.name}</span>
                <span className="table-bonus">
                  {table.bonus.expBoost && <span>EXP+{table.bonus.expBoost}</span>}
                  {table.bonus.failRateReduction && <span>FAIL-{table.bonus.failRateReduction}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="crafting-content">
        {/* 레시피 목록 */}
        <RecipeList
          recipes={recipes}
          level={levelStats.level}
          inventory={inventory}
          onRecipeSelect={setSelectedRecipe}
          selectedRecipe={selectedRecipe}
          onCraft={handleCraft}
          isCrafting={isCrafting}
          t={tc}
        />

        {/* 레시피 미리보기 */}
        {selectedRecipe && (
          <RecipePreview
            recipe={selectedRecipe}
            inventory={inventory}
            level={levelStats.level}
            table={selectedTable}
            onCraft={() => handleCraft(selectedRecipe)}
            isCrafting={isCrafting}
            t={tc}
          />
        )}
      </div>

      {/* 닫기 버튼 */}
      <div className="crafting-footer">
        <button className="pixel-button secondary" onClick={onClose}>
          {tc('close')}
        </button>
      </div>
    </div>
  );
};

Crafting.propTypes = {
  craftingLevel: PropTypes.number,
  craftingExp: PropTypes.number,
  characterId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

Crafting.defaultProps = {
  craftingLevel: 1,
  craftingExp: 0
};

export default Crafting;