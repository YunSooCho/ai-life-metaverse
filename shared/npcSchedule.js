/**
 * NPC 스케줄/일과 시스템
 * 
 * AI 캐릭터가 시간대별로 다른 위치와 행동을 가짐
 * weatherTimeSystem의 게임 시간과 연동
 */

// 건물 위치 (서버와 공유)
const LOCATIONS = {
  library: { x: 175, y: 150, name: '도서관' },
  cafe: { x: 800, y: 475, name: '카페' },
  shop: { x: 490, y: 560, name: '상점' },
  park: { x: 500, y: 300, name: '공원' },
  home: { x: 100, y: 600, name: '집' }
}

// 활동 타입
const ACTIVITIES = {
  SLEEP: 'sleep',
  READ: 'read',
  COFFEE: 'coffee',
  WALK: 'walk',
  SHOP: 'shop',
  RELAX: 'relax',
  STUDY: 'study',
  EXERCISE: 'exercise'
}

// 활동별 대화 힌트
const ACTIVITY_DIALOGUES = {
  [ACTIVITIES.SLEEP]: ['(잠들어 있다...)', 'zzz... 음...?', '으응... 아직 이른 시간이야...'],
  [ACTIVITIES.READ]: ['이 책 진짜 재밌어!', '여기 도서관 좋다~', '독서는 영혼의 양식이지 📚'],
  [ACTIVITIES.COFFEE]: ['카페라떼 한 잔의 여유~', '여기 커피 진짜 맛있어 ☕', '아침엔 역시 커피지!'],
  [ACTIVITIES.WALK]: ['산책하기 좋은 날이다~', '돌아다니는 게 제일 좋아 🚶', '이 동네 구석구석 다 알아!'],
  [ACTIVITIES.SHOP]: ['뭐 살 거 없나~', '아 이거 귀엽다!', '쇼핑은 치료야 💰'],
  [ACTIVITIES.RELAX]: ['공원에서 쉬는 중~', '바람이 시원하다', '여유로운 시간이 좋아 🌿'],
  [ACTIVITIES.STUDY]: ['열심히 공부 중!', '집중 모드 🔥', '오늘은 많이 배웠어'],
  [ACTIVITIES.EXERCISE]: ['운동은 건강의 비결!', '땀 흘리니까 기분 좋다 💪', '하나 둘 하나 둘!']
}

/**
 * NPC 일과 스케줄 정의
 * hour: 게임 시간 (0-23)
 */
const DEFAULT_SCHEDULE = [
  { startHour: 0, endHour: 6, location: 'home', activity: ACTIVITIES.SLEEP },
  { startHour: 6, endHour: 8, location: 'cafe', activity: ACTIVITIES.COFFEE },
  { startHour: 8, endHour: 12, location: 'library', activity: ACTIVITIES.STUDY },
  { startHour: 12, endHour: 13, location: 'cafe', activity: ACTIVITIES.COFFEE },
  { startHour: 13, endHour: 15, location: 'park', activity: ACTIVITIES.WALK },
  { startHour: 15, endHour: 18, location: 'library', activity: ACTIVITIES.READ },
  { startHour: 18, endHour: 19, location: 'shop', activity: ACTIVITIES.SHOP },
  { startHour: 19, endHour: 21, location: 'park', activity: ACTIVITIES.RELAX },
  { startHour: 21, endHour: 24, location: 'home', activity: ACTIVITIES.SLEEP }
]

/**
 * 현재 시간에 해당하는 스케줄 항목 반환
 */
export function getCurrentSchedule(hour, schedule = DEFAULT_SCHEDULE) {
  for (const entry of schedule) {
    if (hour >= entry.startHour && hour < entry.endHour) {
      return entry
    }
  }
  // 기본값: 집에서 잠
  return { startHour: 0, endHour: 6, location: 'home', activity: ACTIVITIES.SLEEP }
}

/**
 * 현재 시간의 목표 위치 반환
 */
export function getScheduleLocation(hour, schedule = DEFAULT_SCHEDULE) {
  const entry = getCurrentSchedule(hour, schedule)
  return LOCATIONS[entry.location] || LOCATIONS.home
}

/**
 * 현재 활동에 맞는 랜덤 대화 반환
 */
export function getActivityDialogue(hour, schedule = DEFAULT_SCHEDULE) {
  const entry = getCurrentSchedule(hour, schedule)
  const dialogues = ACTIVITY_DIALOGUES[entry.activity] || ['...']
  return dialogues[Math.floor(Math.random() * dialogues.length)]
}

/**
 * NPC를 목표 위치로 이동시킬 좌표 계산
 * @returns {{ x: number, y: number, arrived: boolean }}
 */
export function moveTowardTarget(currentX, currentY, targetX, targetY, speed = 2) {
  const dx = targetX - currentX
  const dy = targetY - currentY
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance <= speed) {
    return { x: targetX, y: targetY, arrived: true }
  }

  const moveX = (dx / distance) * speed
  const moveY = (dy / distance) * speed

  return {
    x: currentX + moveX,
    y: currentY + moveY,
    arrived: false
  }
}

/**
 * 현재 활동 정보 전체 반환
 */
export function getNpcStatus(hour, schedule = DEFAULT_SCHEDULE) {
  const entry = getCurrentSchedule(hour, schedule)
  const location = LOCATIONS[entry.location] || LOCATIONS.home

  return {
    activity: entry.activity,
    locationName: location.name,
    targetX: location.x,
    targetY: location.y,
    dialogue: getActivityDialogue(hour, schedule)
  }
}

// 내보내기
export { LOCATIONS, ACTIVITIES, ACTIVITY_DIALOGUES, DEFAULT_SCHEDULE }
