/**
 * BattleManager - PvP 전투 관리 시스템
 *
 * 기능:
 * - 전투 생성/종료
 * - 턴 기반 전투 시스템
 * - 전투 상태 관리 (준비, 진행 중, 종료)
 * - 전투 로그 기록
 */

import { randomUUID as uuidv4 } from 'crypto';

/**
 * 전투 상태
 */
const BattleStatus = {
  PREPARING: 'preparing', // 준비 중
  IN_PROGRESS: 'in_progress', // 진행 중
  COMPLETED: 'completed', // 종료
  CANCELLED: 'cancelled' // 취소
};

/**
 * 전퍰이터
 */
class Battle {
  constructor(player1, player2) {
    this.id = uuidv4();
    this.player1Id = player1.id;
    this.player2Id = player2.id;
    this.players = {
      [player1.id]: this._createPlayerState(player1),
      [player2.id]: this._createPlayerState(player2)
    };
    this.status = BattleStatus.PREPARING;
    this.turn = 0;
    this.currentPlayer = null;
    this.winner = null;
    this.createdAt = new Date();
    this.startedAt = null;
    this.endedAt = null;
    this.actions = [];
    this.logs = [];
  }

  /**
   * 플레이어 상태 생성
   */
  _createPlayerState(player) {
    return {
      id: player.id,
      name: player.name,
      hp: player.stats.hp,
      maxHp: player.stats.maxHp,
      mp: player.stats.mp,
      maxMp: player.stats.maxMp,
      attack: player.stats.attack,
      defense: player.stats.defense,
      speed: player.stats.speed,
      skills: player.skills || [],
      buffs: [],
      debuffs: []
    };
  }

  /**
   * 전투 시작
   */
  start() {
    if (this.status !== BattleStatus.PREPARING) {
      throw new Error('Battle is already started or completed');
    }

    this.status = BattleStatus.IN_PROGRESS;
    this.startedAt = new Date();
    this.turn = 1;

    // 첫 번째 턴 플레이어 결정 (속도 기반)
    this.currentPlayer = this._determineFirstPlayer();

    this._addLog('battle', `Battle ${this.id} started between ${this.players[this.player1Id].name} and ${this.players[this.player2Id].name}`);
  }

  /**
   * 첫 번째 턴 플레이어 결정
   */
  _determineFirstPlayer() {
    const p1 = this.players[this.player1Id];
    const p2 = this.players[this.player2Id];

    return p1.speed >= p2.speed ? this.player1Id : this.player2Id;
  }

  /**
   * 공격 수행
   */
  executeAttack(action) {
    if (this.status !== BattleStatus.IN_PROGRESS) {
      throw new Error('Battle is not in progress');
    }

    const attackerId = action.playerId;
    const defenderId = attackerId === this.player1Id ? this.player2Id : this.player1Id;

    if (this.currentPlayer !== attackerId) {
      throw new Error('Not your turn');
    }

    const attacker = this.players[attackerId];
    const defender = this.players[defenderId];

    let damage = 0;

    if (action.type === 'normal_attack') {
      // 일반 공격
      damage = Math.max(1, attacker.attack - defender.defense + Math.floor(Math.random() * 5));
    } else if (action.type === 'skill') {
      // 스킬 사용
      const skill = attacker.skills.find(s => s.id === action.skillId);
      if (!skill) {
        throw new Error('Skill not found');
      }

      damage = this._calculateSkillDamage(attacker, defender, skill);
    }

    // 데미지 적용
    defender.hp = Math.max(0, defender.hp - damage);

    // 액션 기록
    this.actions.push({
      turn: this.turn,
      playerId: attackerId,
      type: action.type,
      skillId: action.skillId || null,
      targetId: defenderId,
      damage
    });

    this._addLog('action', `${attacker.name} dealt ${damage} damage to ${defender.name}`);

    // 전투 종료 확인
    if (defender.hp <= 0) {
      this._endBattle(attackerId);
      return;
    }

    // 턴 넘기기
    this._nextTurn();
  }

  /**
   * 스킬 데미지 계산
   */
  _calculateSkillDamage(attacker, defender, skill) {
    const baseDamage = skill.power || 1;
    const randomFactor = Math.random() * 0.2 + 0.9; // 0.9~1.1
    const defenseReduction = defender.defense * 0.5;

    return Math.floor((baseDamage * randomFactor * attacker.attack / 100) - defenseReduction);
  }

  /**
   * 다음 턴으로
   */
  _nextTurn() {
    this.currentPlayer = this.currentPlayer === this.player1Id ?
      this.player2Id : this.player1Id;

    // 플레이어가 HP가 0이면 다른 플레이어에게 턴
    const currentPlayer = this.players[this.currentPlayer];
    if (currentPlayer.hp <= 0) {
      this._endBattle(this.currentPlayer === this.player1Id ? this.player2Id : this.player1Id);
      return;
    }

    this.turn++;
  }

  /**
   * 전투 종료
   */
  _endBattle(winnerId) {
    this.status = BattleStatus.COMPLETED;
    this.winner = winnerId;
    this.endedAt = new Date();

    const winner = this.players[winnerId];
    const loserId = winnerId === this.player1Id ? this.player2Id : this.player1Id;
    const loser = this.players[loserId];

    this._addLog('battle', `Battle ${this.id} ended. Winner: ${winner.name}, Loser: ${loser.name}`);
  }

  /**
   * 전투 취소
   */
  cancel() {
    if (this.status === BattleStatus.COMPLETED) {
      throw new Error('Cannot cancel completed battle');
    }

    this.status = BattleStatus.CANCELLED;
    this.endedAt = new Date();

    this._addLog('battle', `Battle ${this.id} cancelled`);
  }

  /**
   * 로그 추가
   */
  _addLog(type, message) {
    this.logs.push({
      type,
      message,
      timestamp: new Date()
    });
  }

  /**
   * 전투 정보 반환
   */
  toSummary() {
    return {
      id: this.id,
      status: this.status,
      turn: this.turn,
      player1: this.players[this.player1Id].name,
      player2: this.players[this.player2Id].name,
      winner: this.winner ? this.players[this.winner].name : null,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt
    };
  }
}

/**
 * BattleManager 클래스
 */
class BattleManager {
  constructor() {
    this.activeBattles = new Map(); // battleId -> Battle
    this.playerBattles = new Map(); // playerId -> battleId
  }

  /**
   * 전투 생성
   */
  createBattle(player1, player2) {
    if (!player1 || !player2) {
      throw new Error('Both players are required');
    }

    if (player1.id === player2.id) {
      throw new Error('Cannot battle with yourself');
    }

    // 기존 전투 확인
    const existingBattle1 = this.playerBattles.get(player1.id);
    const existingBattle2 = this.playerBattles.get(player2.id);

    if (existingBattle1 && existingBattle1 !== existingBattle2) {
      throw new Error('Player 1 is already in a battle');
    }

    if (existingBattle2 && existingBattle2 !== existingBattle1) {
      throw new Error('Player 2 is already in a battle');
    }

    const battle = new Battle(player1, player2);
    this.activeBattles.set(battle.id, battle);
    this.playerBattles.set(player1.id, battle.id);
    this.playerBattles.set(player2.id, battle.id);

    return battle;
  }

  /**
   * 전투 시작
   */
  startBattle(battleId) {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    battle.start();
    return battle;
  }

  /**
   * 플레이어의 전투 가져오기
   */
  getPlayerBattle(playerId) {
    const battleId = this.playerBattles.get(playerId);
    if (!battleId) {
      return null;
    }

    return this.activeBattles.get(battleId);
  }

  /**
   * 공격 수행
   */
  executeAction(battleId, action) {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    battle.executeAttack(action);

    // 전투 종료 후 정리
    if (battle.status === BattleStatus.COMPLETED) {
      this._cleanupBattle(battle);
    }

    return battle;
  }

  /**
   * 전투 취소
   */
  cancelBattle(battleId) {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    battle.cancel();
    this._cleanupBattle(battle);

    return battle;
  }

  /**
   * 전투 정리
   */
  _cleanupBattle(battle) {
    if (battle.status === BattleStatus.COMPLETED || battle.status === BattleStatus.CANCELLED) {
      this.playerBattles.delete(battle.player1Id);
      this.playerBattles.delete(battle.player2Id);
      this.activeBattles.delete(battle.id);
    }
  }

  /**
   * 모든 활성 전투 가져오기
   */
  getAllActiveBattles() {
    return Array.from(this.activeBattles.values())
      .map(battle => battle.toSummary());
  }

  /**
   * 전통계
   */
  getStatistics() {
    const battles = Array.from(this.activeBattles.values());

    return {
      totalActive: battles.length,
      byStatus: {
        preparing: battles.filter(b => b.status === BattleStatus.PREPARING).length,
        inProgress: battles.filter(b => b.status === BattleStatus.IN_PROGRESS).length,
        completed: battles.filter(b => b.status === BattleStatus.COMPLETED).length,
        cancelled: battles.filter(b => b.status === BattleStatus.CANCELLED).length
      }
    };
  }
}

export {
  BattleManager,
  Battle,
  BattleStatus
};