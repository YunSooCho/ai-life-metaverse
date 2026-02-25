/**
 * 커스터마이징 옵션 데이터
 *
 * 캐릭터 커스터마이징에 사용되는 옵션들을 정의합니다.
 */

// 머리 스타일 옵션
export const HAIR_STYLES = {
  SHORT: {
    id: 'short',
    name: '짧은 머리',
    description: '깔끔한 단발머리',
    emoji: '👨'
  },
  MEDIUM: {
    id: 'medium',
    name: '중간 길이',
    description: '어깨까지 내려오는 머리',
    emoji: '👩'
  },
  LONG: {
    id: 'long',
    name: '긴 머리',
    description: '허리까지 내려오는 긴 머리',
    emoji: '👱‍♀️'
  },
  BALD: {
    id: 'bald',
    name: '대머리',
    description: '대담한 스타일',
    emoji: '🧑‍🦲'
  }
}

// 옷 색상 옵션 (10개 색상 팔레트)
export const CLOTHING_COLORS = {
  BLUE: {
    id: 'blue',
    name: '파랑',
    color: '#2196F3',
    hex: '#2196F3'
  },
  RED: {
    id: 'red',
    name: '빨강',
    color: '#F44336',
    hex: '#F44336'
  },
  GREEN: {
    id: 'green',
    name: '초록',
    color: '#4CAF50',
    hex: '#4CAF50'
  },
  YELLOW: {
    id: 'yellow',
    name: '노랑',
    color: '#FFEB3B',
    hex: '#FFEB3B'
  },
  PURPLE: {
    id: 'purple',
    name: '보라',
    color: '#9C27B0',
    hex: '#9C27B0'
  },
  PINK: {
    id: 'pink',
    name: '분홍',
    color: '#E91E63',
    hex: '#E91E63'
  },
  ORANGE: {
    id: 'orange',
    name: '주황',
    color: '#FF9800',
    hex: '#FF9800'
  },
  CYAN: {
    id: 'cyan',
    name: '청록',
    color: '#00BCD4',
    hex: '#00BCD4'
  },
  BROWN: {
    id: 'brown',
    name: '갈색',
    color: '#795548',
    hex: '#795548'
  },
  GRAY: {
    id: 'gray',
    name: '회색',
    color: '#9E9E9E',
    hex: '#9E9E9E'
  }
}

// 액세서리 옵션
export const ACCESSORIES = {
  NONE: {
    id: 'none',
    name: '없음',
    description: '액세서리 착용하지 않음',
    emoji: ''
  },
  GLASSES: {
    id: 'glasses',
    name: '안경',
    description: '지적인 느낌의 안경',
    emoji: '👓'
  },
  HAT: {
    id: 'hat',
    name: '모자',
    description: '캡 스타일 모자',
    emoji: '🧢'
  },
  BOW_TIE: {
    id: 'bow_tie',
    name: '넥타이',
    description: '우아한 넥타이',
    emoji: '🎀'
  },
  HEADPHONES: {
    id: 'headphones',
    name: '헤드폰',
    description: '음악 애호가의 헤드폰',
    emoji: '🎧'
  },
  CROWN: {
    id: 'crown',
    name: '왕관',
    description: '평범하지 않은 스타일',
    emoji: '👑'
  }
}

// 기본 커스터마이징 설정
export const DEFAULT_CUSTOMIZATION = {
  hairStyle: 'short',
  clothingColor: 'blue',
  accessory: 'none'
}

// 옵션 카테고리
export const CUSTOMIZATION_CATEGORIES = {
  HAIR_STYLES: 'hairStyles',
  CLOTHING_COLORS: 'clothingColors',
  ACCESSORIES: 'accessories'
}

// 옵션을 ID로 빠르게 조회하기 위한 매핑
const createIdMap = (options) => {
  const map = {}
  Object.values(options).forEach(option => {
    if (option && option.id) {
      map[option.id] = option
    }
  })
  return map
}

export const OPTIONS_BY_ID = {
  hairStyles: createIdMap(HAIR_STYLES),
  clothingColors: createIdMap(CLOTHING_COLORS),
  accessories: createIdMap(ACCESSORIES)
}

// 카테고리별 옵션 매핑
export const OPTIONS_BY_CATEGORY = {
  [CUSTOMIZATION_CATEGORIES.HAIR_STYLES]: OPTIONS_BY_ID.hairStyles,
  [CUSTOMIZATION_CATEGORIES.CLOTHING_COLORS]: OPTIONS_BY_ID.clothingColors,
  [CUSTOMIZATION_CATEGORIES.ACCESSORIES]: OPTIONS_BY_ID.accessories
}

export default {
  HAIR_STYLES,
  CLOTHING_COLORS,
  ACCESSORIES,
  DEFAULT_CUSTOMIZATION,
  CUSTOMIZATION_CATEGORIES,
  OPTIONS_BY_CATEGORY
}