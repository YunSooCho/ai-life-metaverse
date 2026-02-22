/**
 * DailyQuest - 일일 퀘스트 시스템
 *
 * 매일 리셋되는 일일 퀘스트 관리
 */

/**
 * 일일 퀘스트 카테고리
 */
const DailyQuestCategory = {
  SOCIAL: 'social',       // 소셜 활동 (채팅, 인터랙션)
  EXPLORATION: 'exploration', // 탐험 (이동, 건물 방문)
  COLLECTION: 'collection',   // 수집 (아이템, 코인)
  COMBAT: 'combat',       // 전투 (예정)
  EVENT: 'event'         // 이벤트 참여
};

/**
 * 기본 일일 퀘스트 템플릿
 */
const DAILY_QUEST_TEMPLATES = [
  {
    id: 'daily_chat_10',
    name: '채팅 10회 참여',
    description: '다른 캐릭터와 채팅을 10번 진행하세요',
    category: DailyQuestCategory.SOCIAL,
    target: 10,
    reward: { type: 'experience', amount: 50 },
    difficulty: 'easy'
  },
  {
    id: 'daily_interaction_5',
    name: '캐릭터 상호작용 5회',
    description: 'AI 캐릭터와 상호작용 5회 진행하세요',
    category: DailyQuestCategory.SOCIAL,
    target: 5,
    reward: { type: 'experience', amount: 80 },
    difficulty: 'easy'
  },
  {
    id: 'daily_move_20',
    name: '이동 20회',
    description: '캐릭터를 20회 이동하세요',
    category: DailyQuestCategory.EXPLORATION,
    target: 20,
    reward: { type: 'experience', amount: 60 },
    difficulty: 'easy'
  },
  {
    id: 'daily_building_visit_3',
    name: '건물 방문 3회',
    description: '다양한 건물을 3회 방문하세요',
    category: DailyQuestCategory.EXPLORATION,
    target: 3,
    reward: { type: 'experience', amount: 100 },
    difficulty: 'normal'
  },
  {
    id: 'daily_collect_item_10',
    name: '아이템 수집 10개',
    description: '아이템 10개를 수집하세요',
    category: DailyQuestCategory.COLLECTION,
    target: 10,
    reward: { type: 'coin', amount: 50, itemType: 'any' },
    difficulty: 'normal'
  },
  {
    id: 'daily_chat_30',
    name: '채팅 30회 도전',
    description: '채팅 30회 참여로 도전하세요',
    category: DailyQuestCategory.SOCIAL,
    target: 30,
    reward: { type: 'experience', amount: 150 },
    difficulty: 'hard'
  },
  {
    id: 'daily_building_visit_10',
    name: '건물 방문 10회 도전',
    description: '건물을 10회 방문으로 도전하세요',
    category: DailyQuestCategory.EXPLORATION,
    target: 10,
    reward: { type: 'experience', amount: 200 },
    difficulty: 'hard'
  }
];

/**
 * DailyQuest 클래스
 */
class DailyQuest {
  constructor() {
    this.dailyQuests = new Map(); // 캐릭터별 일일 퀘스트
    this.questTemplates = DAILY_QUEST_TEMPLATES;
    this.lastResetDate = null;
  }

  /**
   * 일일 퀘스트 생성
   * @param {string} characterId - 캐릭터 ID
   * @param {Array} customTemplates - 커스텀 퀘스트 템플릿 (선택)
   * @returns {Array} 생성된 퀘스트 목록
   */
  createDailyQuests(characterId, customTemplates = null) {
    const templates = customTemplates || this.questTemplates;

    // 랜덤 3개 퀘스트 선택 (easy: 1개, normal: 1개, hard: 1개)
    const easyQuest = templates.filter(q => q.difficulty === 'easy');
    const normalQuest = templates.filter(q => q.difficulty === 'normal');
    const hardQuest = templates.filter(q => q.difficulty === 'hard');

    const selectedQuests = [];

    if (easyQuest.length > 0) {
      selectedQuests.push(
        easyQuest[Math.floor(Math.random() * easyQuest.length)]
      );
    }

    if (normalQuest.length > 0) {
      selectedQuests.push(
        normalQuest[Math.floor(Math.random() * normalQuest.length)]
      );
    }

    if (hardQuest.length > 0) {
      selectedQuests.push(
        hardQuest[Math.floor(Math.random() * hardQuest.length)]
      );
    }

    const dailyQuests = selectedQuests.map(template => {
      const quest = {
        ...template,
        id: `${template.id}_${this.generateQuestId()}`,
        characterId,
        target: template.target,
        progress: 0,
        completed: false,
        claimed: false,
        createdAt: new Date(),
        expiresAt: this.getEndOfDay()
      };

      return quest;
    });

    // 캐릭터별 퀘스트 저장
    if (!this.dailyQuests.has(characterId)) {
      this.dailyQuests.set(characterId, new Map());
    }

    const characterQuests = this.dailyQuests.get(characterId);
    dailyQuests.forEach(quest => {
      characterQuests.set(quest.id, quest);
    });

    console.log(`DailyQuest: Created ${dailyQuests.length} daily quests for ${characterId}`);
    return dailyQuests;
  }

  /**
   * 일일 퀘스트 진행 업데이트
   * @param {string} characterId - 캐릭터 ID
   * @param {string} questId - 퀘스트 ID
   * @param {number} amount - 진행량
   * @returns {boolean|null} 완료 여부 (null: 퀘스트 없음)
   */
  updateQuestProgress(characterId, questId, amount = 1) {
    const characterQuests = this.dailyQuests.get(characterId);

    if (!characterQuests) {
      return null;
    }

    const quest = characterQuests.get(questId);

    if (!quest) {
      return null;
    }

    // 퀘스트 만료 확인
    if (quest.expiresAt && new Date() > quest.expiresAt) {
      console.warn(`DailyQuest: Quest expired - ${questId}`);
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
      console.log(`DailyQuest: Quest completed - ${quest.name} (${quest.progress}/${quest.target})`);
      return true;
    }

    console.log(`DailyQuest: Quest progress updated - ${quest.name} (${quest.progress}/${quest.target})`);
    return false;
  }

  /**
   * 일일 퀘스트 보상 수령
   * @param {string} characterId - 캐릭터 ID
   * @param {string} questId - 퀘스트 ID
   * @returns {Object|null} 보상 데이터
   */
  claimQuestReward(characterId, questId) {
    const characterQuests = this.dailyQuests.get(characterId);

    if (!characterQuests) {
      console.error(`DailyQuest: No quests for character - ${characterId}`);
      return null;
    }

    const quest = characterQuests.get(questId);

    if (!quest) {
      console.error(`DailyQuest: Quest not found - ${questId}`);
      return null;
    }

    if (!quest.completed) {
      console.warn(`DailyQuest: Quest not completed - ${questId}`);
      return null;
    }

    if (quest.claimed) {
      console.warn(`DailyQuest: Reward already claimed - ${questId}`);
      return null;
    }

    quest.claimed = true;
    quest.claimedAt = new Date();

    console.log(`DailyQuest: Reward claimed for ${characterId} from ${questId}`, quest.reward);
    return quest.reward;
  }

  /**
   * 캐릭터의 모든 일일 퀘스트 조회
   * @param {string} characterId - 캐릭터 ID
   * @returns {Array} 퀘스트 목록
   */
  getCharacterDailyQuests(characterId) {
    const characterQuests = this.dailyQuests.get(characterId);

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
   * 기간별 일일 퀘스트 리셋
   */
  resetDailyQuests() {
    const now = new Date();

    // 모든 캐릭터의 퀘스트 확인
    for (const [characterId, characterQuests] of this.dailyQuests) {
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

      console.log(`DailyQuest: Reset ${questsToReset.length} quests for ${characterId}`);
    }

    this.lastResetDate = now;
  }

  /**
   * 캐릭터별 퀘스트 리셋
   * @param {string} characterId - 캐릭터 ID
   */
  resetCharacterQuests(characterId) {
    if (this.dailyQuests.has(characterId)) {
      this.dailyQuests.delete(characterId);
      console.log(`DailyQuest: Reset all quests for ${characterId}`);
    }
  }

  /**
   * 일일 퀘스트 통계
   * @param {string} characterId - 캐릭터 ID
   * @returns {Object} 통계 데이터
   */
  getDailyQuestStats(characterId) {
    const characterQuests = this.dailyQuests.get(characterId);

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
   * 하루 끝 시간 계산 (23:59:59)
   * @returns {Date} 하루 끝 시간
   */
  getEndOfDay() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * 오늘의 퀘스트 유효한지 확인
   * @param {string} characterId - 캐릭터 ID
   * @returns {boolean} 유효 여부
   */
  isTodayQuestsValid(characterId) {
    const quests = this.getCharacterDailyQuests(characterId);
    return quests.length > 0;
  }
}

// 싱글톤 인스턴스
const dailyQuest = new DailyQuest();

module.exports = {
  DailyQuest,
  dailyQuest,
  DailyQuestCategory,
  DAILY_QUEST_TEMPLATES
};