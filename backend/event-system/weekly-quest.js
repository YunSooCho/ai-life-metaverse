/**
 * WeeklyQuest - 주간 퀘스트 시스템
 *
 * 매주 리셋되는 주간 퀘스트 관리
 */

/**
 * 주간 퀘스트 카테고리
 */
const WeeklyQuestCategory = {
  SOCIAL: 'social',       // 소셜 활동
  EXPLORATION: 'exploration', // 탐험
  COLLECTION: 'collection',   // 수집
  MASTERY: 'mastery',      // 마스터리 (레벨업, 스킬 사용)
  EVENT: 'event'         // 이벤트 참여
};

/**
 * 기본 주간 퀘스트 템플릿
 */
const WEEKLY_QUEST_TEMPLATES = [
  {
    id: 'weekly_chat_100',
    name: '채팅 100회 참여',
    description: '일주일간 채팅 100회 도전',
    category: WeeklyQuestCategory.SOCIAL,
    target: 100,
    reward: { type: 'experience', amount: 500 },
    difficulty: 'normal'
  },
  {
    id: 'weekly_interaction_30',
    name: '캐릭터 상호작용 30회',
    description: '일주일간 AI 캐릭터 상호작용 30회',
    category: WeeklyQuestCategory.SOCIAL,
    target: 30,
    reward: { type: 'experience', amount: 400 },
    difficulty: 'normal'
  },
  {
    id: 'weekly_move_100',
    name: '이동 100회',
    description: '일주일간 캐릭터 이동 100회',
    category: WeeklyQuestCategory.EXPLORATION,
    target: 100,
    reward: { type: 'experience', amount: 300 },
    difficulty: 'normal'
  },
  {
    id: 'weekly_building_visit_20',
    name: '건물 방문 20회',
    description: '일주일간 건물 방문 20회',
    category: WeeklyQuestCategory.EXPLORATION,
    target: 20,
    reward: { type: 'experience', amount: 600 },
    difficulty: 'normal'
  },
  {
    id: 'weekly_level_up_3',
    name: '레벨업 3회',
    description: '일주일간 레벨업 3회 도전',
    category: WeeklyQuestCategory.MASTERY,
    target: 3,
    reward: { type: 'experience', amount: 800 },
    difficulty: 'hard'
  },
  {
    id: 'weekly_collect_item_100',
    name: '아이템 수집 100개',
    description: '일주일간 아이템 100개 수집',
    category: WeeklyQuestCategory.COLLECTION,
    target: 100,
    reward: { type: 'experience', amount: 400, coin: 200 },
    difficulty: 'normal'
  },
  {
    id: 'weekly_chat_200',
    name: '채팅 200회 대도전',
    description: '일주일간 채팅 200회 도전',
    category: WeeklyQuestCategory.SOCIAL,
    target: 200,
    reward: { type: 'experience', amount: 1200 },
    difficulty: 'hard'
  },
  {
    id: 'weekly_building_visit_50',
    name: '건물 방문 50회 대도전',
    description: '일주일간 건물 방문 50회 도전',
    category: WeeklyQuestCategory.EXPLORATION,
    target: 50,
    reward: { type: 'experience', amount: 1500 },
    difficulty: 'hard'
  },
  {
    id: 'weekly_event_participate_5',
    name: '이벤트 참여 5회',
    description: '일주일간 이벤트 5회 참여',
    category: WeeklyQuestCategory.EVENT,
    target: 5,
    reward: { type: 'coin', amount: 500, specialItem: true },
    difficulty: 'hard'
  }
];

/**
 * WeeklyQuest 클래스
 */
class WeeklyQuest {
  constructor() {
    this.weeklyQuests = new Map(); // 캐릭터별 주간 퀘스트
    this.questTemplates = WEEKLY_QUEST_TEMPLATES;
    this.lastResetDate = null;
  }

  /**
   * 주간 퀘스트 생성
   * @param {string} characterId - 캐릭터 ID
   * @param {Array} customTemplates - 커스텀 퀘스트 템플릿 (선택)
   * @returns {Array} 생성된 퀘스트 목록
   */
  createWeeklyQuests(characterId, customTemplates = null) {
    const templates = customTemplates || this.questTemplates;

    // 랜덤 5개 퀘스트 선택 (easy: 1개, normal: 2개, hard: 2개)
    const normalQuest = templates.filter(q => q.difficulty === 'normal');
    const hardQuest = templates.filter(q => q.difficulty === 'hard');

    const selectedQuests = [];

    // Normal 2개
    for (let i = 0; i < 2 && normalQuest.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * normalQuest.length);
      selectedQuests.push(normalQuest.splice(randomIndex, 1)[0]);
    }

    // Hard 2개
    for (let i = 0; i < 2 && hardQuest.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * hardQuest.length);
      selectedQuests.push(hardQuest.splice(randomIndex, 1)[0]);
    }

    // 추가 1개 (남은 것 중)
    if (normalQuest.length > 0 || hardQuest.length > 0) {
      const allRemaining = [...normalQuest, ...hardQuest];
      if (allRemaining.length > 0) {
        selectedQuests.push(
          allRemaining[Math.floor(Math.random() * allRemaining.length)]
        );
      }
    }

    const weeklyQuests = selectedQuests.map(template => {
      const quest = {
        ...template,
        id: `${template.id}_${this.generateQuestId()}`,
        characterId,
        target: template.target,
        progress: 0,
        completed: false,
        claimed: false,
        createdAt: new Date(),
        expiresAt: this.getEndOfWeek()
      };

      return quest;
    });

    // 캐릭터별 퀘스트 저장
    if (!this.weeklyQuests.has(characterId)) {
      this.weeklyQuests.set(characterId, new Map());
    }

    const characterQuests = this.weeklyQuests.get(characterId);
    weeklyQuests.forEach(quest => {
      characterQuests.set(quest.id, quest);
    });

    console.log(`WeeklyQuest: Created ${weeklyQuests.length} weekly quests for ${characterId}`);
    return weeklyQuests;
  }

  /**
   * 주간 퀘스트 진행 업데이트
   * @param {string} characterId - 캐릭터 ID
   * @param {string} questId - 퀘스트 ID
   * @param {number} amount - 진행량
   * @returns {boolean|null} 완료 여부 (null: 퀘스트 없음)
   */
  updateQuestProgress(characterId, questId, amount = 1) {
    const characterQuests = this.weeklyQuests.get(characterId);

    if (!characterQuests) {
      return null;
    }

    const quest = characterQuests.get(questId);

    if (!quest) {
      return null;
    }

    // 퀘스트 만료 확인
    if (quest.expiresAt && new Date() > quest.expiresAt) {
      console.warn(`WeeklyQuest: Quest expired - ${questId}`);
      return null;
    }

    // 이미 완료된 퀘스트는 업데이트 안 함
    if (quest.completed) {
      return true;
    }

    quest.progress = Math.min(quest.progress + amount, quest.target);

    // 완료 체크
    if (quest.progress >= quest.target) {
      quest.completed = true;
      quest.completedAt = new Date();
      console.log(`WeeklyQuest: Quest completed - ${quest.name} (${quest.progress}/${quest.target})`);
      return true;
    }

    console.log(`WeeklyQuest: Quest progress updated - ${quest.name} (${quest.progress}/${quest.target})`);
    return false;
  }

  /**
   * 주간 퀘스트 보상 수령
   * @param {string} characterId - 캐릭터 ID
   * @param {string} questId - 퀘스트 ID
   * @returns {Object|null} 보상 데이터
   */
  claimQuestReward(characterId, questId) {
    const characterQuests = this.weeklyQuests.get(characterId);

    if (!characterQuests) {
      console.error(`WeeklyQuest: No quests for character - ${characterId}`);
      return null;
    }

    const quest = characterQuests.get(questId);

    if (!quest) {
      console.error(`WeeklyQuest: Quest not found - ${questId}`);
      return null;
    }

    if (!quest.completed) {
      console.warn(`WeeklyQuest: Quest not completed - ${questId}`);
      return null;
    }

    if (quest.claimed) {
      console.warn(`WeeklyQuest: Reward already claimed - ${questId}`);
      return null;
    }

    quest.claimed = true;
    quest.claimedAt = new Date();

    console.log(`WeeklyQuest: Reward claimed for ${characterId} from ${questId}`, quest.reward);
    return quest.reward;
  }

  /**
   * 캐릭터의 모든 주간 퀘스트 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Array} 퀘스트 목록
   */
  getCharacterWeeklyQuests(characterId) {
    const characterQuests = this.weeklyQuests.get(characterId);

    if (!characterQuests) {
      return [];
    }

    const now = new Date();
    return Array.from(characterQuests.values()).filter(quest => {
      // 만료되지 않은 퀘스트만 반환
      return !quest.expiresAt || now <= quest.expiresAt;
    });
  }

  /**
   * 주간 퀘스트 리셋 (모든 캐릭터)
   */
  resetWeeklyQuests() {
    const now = new Date();

    // 모든 캐릭터의 퀘스트 확인
    for (const [characterId, characterQuests] of this.weeklyQuests) {
      const questsToReset = [];

      for (const [questId, quest] of characterQuests) {
        // 만료된 퀘스트 확인
        if (quest.expiresAt && now > quest.expiresAt) {
          questsToReset.push(questId);
        }
      }

      // 만료된 퀘스트 삭제
      questsToReset.forEach(questId => {
        characterQuests.delete(questId);
      });

      console.log(`WeeklyQuest: Reset ${questsToReset.length} quests for ${characterId}`);
    }

    this.lastResetDate = now;
  }

  /**
   * 캐릭터별 퀘스트 리셋
   * @param {string} characterId - 캐릭터 ID
   */
  resetCharacterQuests(characterId) {
    if (this.weeklyQuests.has(characterId)) {
      this.weeklyQuests.delete(characterId);
      console.log(`WeeklyQuest: Reset all quests for ${characterId}`);
    }
  }

  /**
   * 주간 퀘스트 통계
   * @param {string} characterId - 캐릭터 ID
   * @returns {Object} 통계 데이터
   */
  getWeeklyQuestStats(characterId) {
    const characterQuests = this.weeklyQuests.get(characterId);

    if (!characterQuests) {
      return {
        total: 0,
        completed: 0,
        claimed: 0,
        inProgress: 0
      };
    }

    const quests = Array.from(characterQuests.values());

    return {
      total: quests.length,
      completed: quests.filter(q => q.completed).length,
      claimed: quests.filter(q => q.claimed).length,
      inProgress: quests.filter(q => !q.completed && q.progress > 0).length,
      notStarted: quests.filter(q => q.progress === 0).length
    };
  }

  /**
   * 퀘스트 ID 생성
   * @returns {string} 퀘스트 ID
   */
  generateQuestId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * 한 주 끝 시간 계산 (일요일 23:59:59)
   * @returns {Date} 한 주 끝 시간
   */
  getEndOfWeek() {
    const now = new Date();
    const endOfWeek = new Date(now);

    // 일요일 (0)로 이동
    const dayOfWeek = now.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;

    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);

    return endOfWeek;
  }

  /**
   * 이번 주 퀘스트 유효한지 확인
   * @param {string} characterId - 캐릭터 ID
   * @returns {boolean} 유효 여부
   */
  isThisWeekQuestsValid(characterId) {
    const quests = this.getCharacterWeeklyQuests(characterId);
    return quests.length > 0;
  }

  /**
   * 이번 주 남은 기간 계산
   * @returns {Object} 남은 기간 정보
   */
  getRemainingWeekInfo() {
    const now = new Date();
    const endOfWeek = this.getEndOfWeek();

    const remainingMilliseconds = endOfWeek - now;
    const remainingDays = Math.floor(remainingMilliseconds / (24 * 60 * 60 * 1000));
    const remainingHours = Math.floor((remainingMilliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingMilliseconds % (60 * 60 * 1000)) / (60 * 1000));

    return {
      endOfWeek: endOfWeek,
      remainingDays,
      remainingHours,
      remainingMinutes,
      totalRemainingHours: Math.floor(remainingMilliseconds / (60 * 60 * 1000))
    };
  }
}

// 싱글톤 인스턴스
const weeklyQuest = new WeeklyQuest();

module.exports = {
  WeeklyQuest,
  weeklyQuest,
  WeeklyQuestCategory,
  WEEKLY_QUEST_TEMPLATES
};