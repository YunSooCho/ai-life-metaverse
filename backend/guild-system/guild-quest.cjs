/**
 * 길드 퀘스트 시스템
 * 길드 전용 협동 퀘스트 기능
 */

class GuildQuest {
  /**
   * 퀘스트 생성
   */
  static createQuest(guildLevel) {
    const questTypes = ['collect', 'social', 'combat', 'cooperation'];
    const type = questTypes[Math.floor(Math.random() * questTypes.length)];

    const baseReward = {
      exp: 100 + guildLevel * 10,
      coin: 50 + guildLevel * 5,
      guildExp: 50 + guildLevel * 5
    };

    let objectives = [];

    switch (type) {
      case 'collect':
        objectives = [
          {
            id: 'collect_coins',
            description: `${500 + guildLevel * 50} 코인 수집`,
            type: 'collect',
            targetId: 'coin',
            requiredCount: 500 + guildLevel * 50,
            currentCount: 0,
            unit: 'count'
          }
        ];
        break;

      case 'social':
        objectives = [
          {
            id: 'chat_count',
            description: `${5 + Math.floor(guildLevel / 2)}번 채팅`,
            type: 'chat',
            requiredCount: 5 + Math.floor(guildLevel / 2),
            currentCount: 0
          },
          {
            id: 'greet_members',
            description: `${3 + guildLevel}명 멤버에게 인사`,
            type: 'interact',
            requiredCount: 3 + guildLevel,
            currentCount: 0
          }
        ];
        break;

      case 'combat':
        objectives = [
          {
            id: 'defeat_monsters',
            description: `${10 + guildLevel * 2} 몬스터 처치`,
            type: 'combat',
            targetId: 'monster',
            requiredCount: 10 + guildLevel * 2,
            currentCount: 0,
            unit: 'count'
          }
        ];
        break;

      case 'cooperation':
        objectives = [
          {
            id: 'party_quest',
            description: '파티 퀘스트 1회 완료',
            type: 'party_quest',
            requiredCount: 1,
            currentCount: 0
          },
          {
            id: 'team_work',
            description: '팀 협동 미션 완료',
            type: 'cooperation',
            requiredCount: 1,
            currentCount: 0
          }
        ];
        break;
    }

    return {
      id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: this.generateQuestTitle(type, guildLevel),
      description: this.generateQuestDescription(type),
      objectives,
      reward: baseReward,
      difficulty: this.calculateDifficulty(guildLevel),
      expireAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간 후 만료
      status: 'active',
      progress: {},
      createdAt: Date.now()
    };
  }

  static generateQuestTitle(type, guildLevel) {
    const titles = {
      collect: `자원 수집 Lv.${guildLevel}`,
      social: `소셜 활동 Lv.${guildLevel}`,
      combat: `몬스터 사냥 Lv.${guildLevel}`,
      cooperation: `팀 협동 Lv.${guildLevel}`
    };
    return titles[type] || '퀘스트';
  }

  static generateQuestDescription(type) {
    const descriptions = {
      collect: '길드를 위해 자원을 수집하세요.',
      social: '길드원들과 소통하며 유대감을 쌓으세요.',
      combat: '위험한 몬스터를 처치하여 길드를 위협하는 요소를 제거하세요.',
      cooperation: '팀워크를 발휘하여 협동 미션을 완료하세요.'
    };
    return descriptions[type] || '퀘스트를 완료하세요.';
  }

  static calculateDifficulty(guildLevel) {
    if (guildLevel <= 5) return 'easy';
    if (guildLevel <= 10) return 'normal';
    if (guildLevel <= 20) return 'hard';
    return 'extreme';
  }
}

class GuildQuestManager {
  constructor(guildManager) {
    this.guildManager = guildManager;
    this.activeQuests = new Map(); // guildId -> [quests]
    this.questDefinitions = new Map(); // questId -> quest
  }

  /**
   * 길드 퀘스트 생성
   */
  generateGuildQuest(guildId) {
    const guild = this.guildManager.getGuildInfo(guildId);
    if (!guild) {
      throw new Error('길드를 찾을 수 없습니다.');
    }

    const quest = GuildQuest.createQuest(guild.level);

    if (!this.activeQuests.has(guildId)) {
      this.activeQuests.set(guildId, []);
    }

    this.activeQuests.get(guildId).push(quest);
    this.questDefinitions.set(quest.id, quest);

    return quest;
  }

  /**
   * 활성 퀘스트 목록 조회
   */
  getActiveQuests(guildId) {
    return this.activeQuests.get(guildId) || [];
  }

  /**
   * 퀘스트 진행 업데이트
   */
  updateQuestProgress(guildId, playerId, eventType, data) {
    const quests = this.activeQuests.get(guildId);
    if (!quests || quests.length === 0) {
      return [];
    }

    const updatedQuests = [];

    for (const quest of quests) {
      let progress = quest.progress[playerId] || {};

      for (const objective of quest.objectives) {
        if (objective.type === eventType) {
          // 진행 상황 업데이트
          if (eventType === 'collect' && data.itemId === objective.targetId) {
            objective.currentCount += data.amount || 1;
          } else if (eventType === 'chat') {
            objective.currentCount += 1;
          } else if (eventType === 'combat') {
            objective.currentCount += 1;
          } else if (eventType === 'party_quest' || eventType === 'cooperation') {
            objective.currentCount += 1;
          }

          progress[objective.id] = objective.currentCount;
        }
      }

      quest.progress[playerId] = progress;

      // 퀘스트 완료 여부 확인
      let allComplete = true;
      for (const objective of quest.objectives) {
        if (objective.currentCount < objective.requiredCount) {
          allComplete = false;
          break;
        }
      }

      if (allComplete && quest.status !== 'completed') {
        quest.status = 'completed';
        quest.completedAt = Date.now();
        updatedQuests.push(quest);
      }
    }

    return updatedQuests;
  }

  /**
   * 퀘스트 완료 (보상 수령)
   */
  completeQuest(guildId, questId) {
    const quest = this.questDefinitions.get(questId);
    if (!quest) {
      throw new Error('퀘스트를 찾을 수 없습니다.');
    }

    if (quest.status !== 'completed') {
      throw new Error('아직 완료되지 않은 퀘스트입니다.');
    }

    // 길드 경험치 추가
    this.guildManager.addExp(guildId, quest.reward.guildExp);
    this.guildManager.incrementQuestCompleted(guildId);

    // 활성 퀘스트에서 제거
    const quests = this.activeQuests.get(guildId) || [];
    const index = quests.findIndex(q => q.id === questId);
    if (index !== -1) {
      quests.splice(index, 1);
    }

    this.questDefinitions.delete(questId);

    return {
      success: true,
      reward: quest.reward,
      message: '퀘스트 완료! 보상이 지급되었습니다.'
    };
  }

  /**
   * 만료된 퀘스트 정리
   */
  cleanupExpiredQuests() {
    const now = Date.now();
    let cleaned = 0;

    for (const [guildId, quests] of this.activeQuests.entries()) {
      const activeOnly = quests.filter(q => {
        if (q.expireAt < now && q.status !== 'completed') {
          this.questDefinitions.delete(q.id);
          cleaned++;
          return false;
        }
        return true;
      });

      this.activeQuests.set(guildId, activeOnly);
    }

    return { success: true, cleaned };
  }

  /**
   * 시스템 통계
   */
  getStats() {
    return {
      totalActiveQuests: this.questDefinitions.size,
      totalQuestsGenerated: Array.from(this.activeQuests.values())
        .reduce((sum, quests) => sum + quests.length, 0)
    };
  }
}

module.exports = { GuildQuest, GuildQuestManager };