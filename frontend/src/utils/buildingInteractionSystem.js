/**
 * Building Interaction System v1.0
 *
 * AI 캐릭터가 건물에 도착했을 때 입장/퇴장 이벤트 처리
 */

// 건물 상태
export const BUILDING_STATUS = {
  ENTRANCE: 'entrance',  // 입장
  INSIDE: 'inside',      // 내부에서 활동
  EXIT: 'exit',          // 퇴장
  OUTSIDE: 'outside'     // 외부
}

// 건물 활동 시간 (ms)
const BUILDING_ACTIVITY_DURATION = {
  cafe: 300000,      // 카페: 5분
  library: 600000,   // 도서관: 10분
  park: 900000,      // 공원: 15분
  home: 1800000      // 집: 30분
}

// 건물 활동 메시지
const BUILDING_MESSAGES = {
  cafe: {
    entrance: [
      '☕ カフェに入りました',
      '🧋 甘い物食べたいなー',
      '☕ コーヒーの匂いがいい匂い'
    ],
    activity: [
      '☕ まったりリラックス',
      '📱 スマホを見てる',
      '☕ 甘い物食べる'
    ],
    exit: [
      '☕ おいしかった！',
      '👋 また来るねー'
    ]
  },
  library: {
    entrance: [
      '📚 図書館に入りました',
      '📖 勉強するよ',
      '📚 本読みたいな'
    ],
    activity: [
      '📖 静かに本を読んでる',
      '📝 ノートを書いてる',
      '📚 わかりやすい本を探してる'
    ],
    exit: [
      '📚 勉強終わり！',
      '👋 また来るねー'
    ]
  },
  park: {
    entrance: [
      '🌳 公園に入りました',
      '🌸 花綺麗だね',
      '🌳 新鮮な空気吸いたい'
    ],
    activity: [
      '🌳 ベンチで休んでる',
      '🌸 花を眺めてる',
      '🌳 ストレッチ中'
    ],
    exit: [
      '🌳 また来るねー',
      '👋 さようなら！'
    ]
  },
  home: {
    entrance: [
      '🏠 家に帰りました',
      '💆 お風呂入りたいな',
      '🏠 ゆっくり休もう'
    ],
    activity: [
      '💆 お風呂に入ってる',
      '🛌 寝てる',
      '📺 テレビ見てる',
      '💆 マッサージ中'
    ],
    exit: [
      '🏠 出発するよー',
      '👋 いってきます！'
    ]
  }
}

/**
 * BuildingInteractionSystem 클래스
 */
export class BuildingInteractionSystem {
  constructor(onEnter, onActivity, onExit) {
    this.onEnter = onEnter // 입장 콜백: (charId, building, message) => void
    this.onActivity = onActivity // 활동 콜백: (charId, building, message) => void
    this.onExit = onExit // 퇴장 콜백: (charId, building) => void
    this.occupants = new Map() // building -> Set<charId>
    this.schedules = new Map() // charId -> { building, status, expireTime }
  }

  /**
   * 캐릭터 건물 입장
   */
  enter(charId, building) {
    if (!this.occupants.has(building)) {
      this.occupants.set(building, new Set())
    }
    this.occupants.get(building).add(charId)

    const schedule = {
      building,
      status: BUILDING_STATUS.INSIDE, // Immediately INSIDE
      expireTime: Date.now() + 1000 // 1초 후 활동 상태로 전환
    }
    this.schedules.set(charId, schedule)

    // 입장 메시지 전송
    const messages = BUILDING_MESSAGES[building]?.entrance || []
    const message = messages[Math.floor(Math.random() * messages.length)]
    if (this.onEnter) {
      this.onEnter(charId, building, message)
    }

    // 활동 시작 (동기적으로)
    this.startActivity(charId)
  }

  /**
   * 캐릭터 활동 시작
   */
  startActivity(charId) {
    const schedule = this.schedules.get(charId)
    if (!schedule) return

    schedule.status = BUILDING_STATUS.INSIDE
    const duration = BUILDING_ACTIVITY_DURATION[schedule.building] || 300000
    schedule.expireTime = Date.now() + duration

    // 주기적 활동 메시지 (1분마다)
    const activityInterval = setInterval(() => {
      const currentSchedule = this.schedules.get(charId)
      if (!currentSchedule || currentSchedule.status !== BUILDING_STATUS.INSIDE) {
        clearInterval(activityInterval)
        return
      }

      const messages = BUILDING_MESSAGES[schedule.building]?.activity || []
      const message = messages[Math.floor(Math.random() * messages.length)]
      if (this.onActivity) {
        this.onActivity(charId, schedule.building, message)
      }
    }, 60000) // 1분마다

    schedule.activityInterval = activityInterval
    return schedule // Return for testing
  }

  /**
   * 캐릭터 건물 퇴장
   */
  exit(charId) {
    const schedule = this.schedules.get(charId)
    if (!schedule) return

    const building = schedule.building
    const occupants = this.occupants.get(building)

    if (occupants) {
      occupants.delete(charId)
      if (occupants.size === 0) {
        this.occupants.delete(building)
      }
    }

    // 활동 인터벌 정지
    if (schedule.activityInterval) {
      clearInterval(schedule.activityInterval)
    }

    // 퇴장 메시지 전송
    const messages = BUILDING_MESSAGES[building]?.exit || []
    const message = messages[Math.floor(Math.random() * messages.length)]
    if (this.onExit) {
      this.onExit(charId, building, message)
    }

    this.schedules.delete(charId)
  }

  /**
   * 캐릭터 건물에서 강제 퇴장 (시스템 종료 등)
   */
  forceExit(charId) {
    const schedule = this.schedules.get(charId)
    if (schedule) {
      this.exit(charId)
    }
  }

  /**
   * 건물 내 캐릭터 목록
   */
  getOccupants(building) {
    return Array.from(this.occupants.get(building) || [])
  }

  /**
   * 캐릭터가 건물 내에 있는지 확인
   */
  isOccupying(charId) {
    const schedule = this.schedules.get(charId)
    return schedule ? schedule.status === BUILDING_STATUS.INSIDE : false
  }

  /**
   * 캐릭터 현재 건물 확인
   */
  getCharacterBuilding(charId) {
    const schedule = this.schedules.get(charId)
    return schedule?.building || null
  }

  /**
   * 모든 캐릭터 강제 퇴장 (시스템 종료 등)
   */
  clearAll() {
    Array.from(this.schedules.keys()).forEach(charId => this.forceExit(charId))
  }
}

// 싱글톤 인스턴스
export const buildingInteractionSystem = new BuildingInteractionSystem()

// 내보내기
export { BUILDING_MESSAGES, BUILDING_ACTIVITY_DURATION }