// 기본 레시피 데이터 (Default Recipes)
// Phase 13: 제작 시스템에서 사용하는 기본 레시피 목록

export const defaultRecipes = [
  // 1. 장비 레시피 (Equipment Recipes)
  {
    id: 'recipe_wooden_sword',
    name: '나무 검',
    nameEn: 'Wooden Sword',
    description: '기본적인 나무 검입니다.',
    descriptionEn: 'A basic wooden sword.',
    requiredLevel: 1,
    materials: [
      { itemId: 'wood', name: '나무', quantity: 3 }
    ],
    result: {
      itemId: 'wooden_sword',
      name: '나무 검',
      quantity: 1,
      minQuantity: 1,
      maxQuantity: 1
    },
    craftingTime: 5000,
    difficulty: 'easy',
    category: 'equipment',
    maxFailureRate: 0.05
  },
  {
    id: 'recipe_wooden_shield',
    name: '나무 방패',
    nameEn: 'Wooden Shield',
    description: '기본적인 나무 방패입니다.',
    descriptionEn: 'A basic wooden shield.',
    requiredLevel: 1,
    materials: [
      { itemId: 'wood', name: '나무', quantity: 2 }
    ],
    result: {
      itemId: 'wooden_shield',
      name: '나무 방패',
      quantity: 1
    },
    craftingTime: 6000,
    difficulty: 'easy',
    category: 'equipment',
    maxFailureRate: 0.05
  },

  // 2. 소비품 레시피 (Consumable Recipes)
  {
    id: 'recipe_health_potion',
    name: '체력 포션',
    nameEn: 'Health Potion',
    description: '체력을 30 회복합니다.',
    descriptionEn: 'Restores 30 HP.',
    requiredLevel: 1,
    materials: [
      { itemId: 'herb', name: '허브', quantity: 2 },
      { itemId: 'water', name: '물', quantity: 1 }
    ],
    result: {
      itemId: 'health_potion',
      name: '체력 포션',
      quantity: 2,
      minQuantity: 2,
      maxQuantity: 3
    },
    craftingTime: 3000,
    difficulty: 'easy',
    category: 'consumable',
    maxFailureRate: 0.03
  },
  {
    id: 'recipe_mana_potion',
    name: '마나 포션',
    nameEn: 'Mana Potion',
    description: '마나를 20 회복합니다.',
    descriptionEn: 'Restores 20 MP.',
    requiredLevel: 3,
    materials: [
      { itemId: 'magic_herb', name: '마법 허브', quantity: 2 },
      { itemId: 'water', name: '물', quantity: 1 }
    ],
    result: {
      itemId: 'mana_potion',
      name: '마나 포션',
      quantity: 2
    },
    craftingTime: 4000,
    difficulty: 'normal',
    category: 'consumable',
    maxFailureRate: 0.08
  },
  {
    id: 'recipe_speed_boost',
    name: '스피드 부스트',
    nameEn: 'Speed Boost',
    description: '이동 속도를 30초간 20% 증가합니다.',
    descriptionEn: 'Increases movement speed by 20% for 30 seconds.',
    requiredLevel: 5,
    materials: [
      { itemId: 'wind_stone', name: '바람의 돌', quantity: 1 },
      { itemId: 'herb', name: '허브', quantity: 1 }
    ],
    result: {
      itemId: 'speed_boost',
      name: '스피드 부스트',
      quantity: 1
    },
    craftingTime: 5000,
    difficulty: 'normal',
    category: 'consumable',
    maxFailureRate: 0.1
  },

  // 3. 재료 레시피 (Material Recipes)
  {
    id: 'recipe_wooden_plank',
    name: '나무판',
    nameEn: 'Wooden Plank',
    description: '목공용으로 사용되는 나무판입니다.',
    descriptionEn: 'A wooden plank for woodworking.',
    requiredLevel: 1,
    materials: [
      { itemId: 'wood', name: '나무', quantity: 1 }
    ],
    result: {
      itemId: 'wooden_plank',
      name: '나무판',
      quantity: 2,
      minQuantity: 2,
      maxQuantity: 3
    },
    craftingTime: 2000,
    difficulty: 'easy',
    category: 'material',
    maxFailureRate: 0.02
  },
  {
    id: 'recipe_iron_ingot',
    name: '철 괴',
    nameEn: 'Iron Ingot',
    description: '제련된 철 괴입니다.',
    descriptionEn: 'A smelted iron ingot.',
    requiredLevel: 5,
    materials: [
      { itemId: 'iron_ore', name: '철광석', quantity: 3 },
      { itemId: 'coal', name: '석탄', quantity: 1 }
    ],
    result: {
      itemId: 'iron_ingot',
      name: '철 괴',
      quantity: 1,
      minQuantity: 1,
      maxQuantity: 2
    },
    craftingTime: 8000,
    difficulty: 'normal',
    category: 'material',
    maxFailureRate: 0.12
  },

  // 4. 고급 장비 레시피 (Advanced Equipment Recipes)
  {
    id: 'recipe_steel_sword',
    name: '강철 검',
    nameEn: 'Steel Sword',
    description: '강력한 강철 검입니다.',
    descriptionEn: 'A powerful steel sword.',
    requiredLevel: 10,
    materials: [
      { itemId: 'iron_ingot', name: '철 괴', quantity: 3 },
      { itemId: 'wood', name: '나무', quantity: 1 },
      { itemId: 'leather', name: '가죽', quantity: 1 }
    ],
    result: {
      itemId: 'steel_sword',
      name: '강철 검',
      quantity: 1
    },
    craftingTime: 15000,
    difficulty: 'hard',
    category: 'equipment',
    maxFailureRate: 0.2
  },
  {
    id: 'recipe_magic_staff',
    name: '마법 지팡이',
    nameEn: 'Magic Staff',
    description: '마법력을 증폭하는 지팡이입니다.',
    descriptionEn: 'A staff that amplifies magic power.',
    requiredLevel: 12,
    materials: [
      { itemId: 'magic_crystal', name: '마법 크리스탈', quantity: 1 },
      { itemId: 'ancient_wood', name: '고목', quantity: 2 },
      { itemId: 'rune_stone', name: '룬 스톤', quantity: 2 }
    ],
    result: {
      itemId: 'magic_staff',
      name: '마법 지팡이',
      quantity: 1,
      minQuantity: 1,
      maxQuantity: 1
    },
    craftingTime: 20000,
    difficulty: 'expert',
    category: 'equipment',
    maxFailureRate: 0.25
  }
];

// 난이도별 레시피 분류
export const recipesByDifficulty = {
  easy: ['recipe_wooden_sword', 'recipe_wooden_shield', 'recipe_health_potion', 'recipe_wooden_plank'],
  normal: ['recipe_mana_potion', 'recipe_speed_boost', 'recipe_iron_ingot'],
  hard: ['recipe_steel_sword'],
  expert: ['recipe_magic_staff']
};

// 카테고리별 레시피 분류
export const recipesByCategory = {
  equipment: ['recipe_wooden_sword', 'recipe_wooden_shield', 'recipe_steel_sword', 'recipe_magic_staff'],
  consumable: ['recipe_health_potion', 'recipe_mana_potion', 'recipe_speed_boost'],
  material: ['recipe_wooden_plank', 'recipe_iron_ingot']
};

// 레벨별 레시피 분류
export const recipesByLevel = {
  beginner: defaultRecipes.filter(r => r.requiredLevel <= 5),
  intermediate: defaultRecipes.filter(r => r.requiredLevel > 5 && r.requiredLevel <= 10),
  advanced: defaultRecipes.filter(r => r.requiredLevel > 10)
};