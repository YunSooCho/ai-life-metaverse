/**
 * BattleManager 테스트
 */

import { BattleManager, Battle, BattleStatus } from '../battle-manager.js';

describe('BattleManager', () => {
  let battleManager;

  beforeEach(() => {
    battleManager = new BattleManager();
  });

  describe('createBattle', () => {
    it('should create a battle between two players', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 12,
          speed: 8
        },
        skills: []
      };

      const battle = battleManager.createBattle(player1, player2);

      expect(battle).toBeInstanceOf(Battle);
      expect(battle.status).toBe(BattleStatus.PREPARING);
      expect(battle.player1Id).toBe('p1');
      expect(battle.player2Id).toBe('p2');
    });

    it('should throw error if players are the same', () => {
      const player = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      expect(() => {
        battleManager.createBattle(player, player);
      }).toThrow('Cannot battle with yourself');
    });

    it('should throw error if player is already in a battle', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 12,
          speed: 8
        },
        skills: []
      };

      const player3 = {
        id: 'p3',
        name: 'Player 3',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 22,
          defense: 8,
          speed: 12
        },
        skills: []
      };

      battleManager.createBattle(player1, player2);

      expect(() => {
        battleManager.createBattle(player1, player3);
      }).toThrow('Player 1 is already in a battle');
    });
  });

  describe('startBattle', () => {
    it('should start a battle', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 12,
          speed: 8
        },
        skills: []
      };

      const battle = battleManager.createBattle(player1, player2);
      battleManager.startBattle(battle.id);

      expect(battle.status).toBe(BattleStatus.IN_PROGRESS);
      expect(battle.turn).toBe(1);
      expect(battle.startedAt).toBeDefined();
    });
  });

  describe('executeAction', () => {
    let battle;

    beforeEach(() => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 30,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 5,
          speed: 8
        },
        skills: []
      };

      battle = battleManager.createBattle(player1, player2);
      battleManager.startBattle(battle.id);
    });

    it('should execute a normal attack', () => {
      const action = {
        playerId: battle.currentPlayer,
        type: 'normal_attack'
      };

      const result = battleManager.executeAction(battle.id, action);

      expect(result.status).toBe(BattleStatus.IN_PROGRESS);
      expect(result.turn).toBe(2);
      expect(result.actions.length).toBe(1);
    });

    it('should throw error if not player\'s turn', () => {
      const action = {
        playerId: battle.currentPlayer === battle.player1Id ? battle.player2Id : battle.player1Id,
        type: 'normal_attack'
      };

      expect(() => {
        battleManager.executeAction(battle.id, action);
      }).toThrow('Not your turn');
    });
  });

  describe('getPlayerBattle', () => {
    it('should retrieve player\'s battle', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 12,
          speed: 8
        },
        skills: []
      };

      const battle = battleManager.createBattle(player1, player2);

      const retrievedBattle = battleManager.getPlayerBattle('p1');

      expect(retrievedBattle.id).toBe(battle.id);
    });

    it('should return null if player is not in a battle', () => {
      const battle = battleManager.getPlayerBattle('p999');

      expect(battle).toBeNull();
    });
  });

  describe('cancelBattle', () => {
    it('should cancel a battle', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 12,
          speed: 8
        },
        skills: []
      };

      const battle = battleManager.createBattle(player1, player2);
      battleManager.cancelBattle(battle.id);

      expect(battle.status).toBe(BattleStatus.CANCELLED);
    });
  });

  describe('getAllActiveBattles', () => {
    it('should return all active battles', () => {
      const player1 = {
        id: 'p1',
        name: 'Player 1',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 20,
          defense: 10,
          speed: 10
        },
        skills: []
      };

      const player2 = {
        id: 'p2',
        name: 'Player 2',
        stats: {
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          attack: 18,
          defense: 12,
          speed: 8
        },
        skills: []
      };

      battleManager.createBattle(player1, player2);

      const activeBattles = battleManager.getAllActiveBattles();

      expect(activeBattles.length).toBe(1);
    });
  });
});

describe('Battle', () => {
  let battle;

  beforeEach(() => {
    const player1 = {
      id: 'p1',
      name: 'Player 1',
      stats: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 30,
        defense: 10,
        speed: 10
      },
      skills: []
    };

    const player2 = {
      id: 'p2',
      name: 'Player 2',
      stats: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 18,
        defense: 5,
        speed: 8
      },
      skills: []
    };

    battle = new Battle(player1, player2);
    battle.start();
  });

  it('should determine first player based on speed', () => {
    const player1 = {
      id: 'p1',
      name: 'Player 1',
      stats: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 20,
        defense: 10,
        speed: 10
      },
      skills: []
    };

    const player2 = {
      id: 'p2',
      name: 'Player 2',
      stats: {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 18,
        defense: 12,
        speed: 12
      },
      skills: []
    };

    const fastBattle = new Battle(player1, player2);
    fastBattle.start(); // Start 필요
    expect(fastBattle.currentPlayer).toBe('p2'); // p2 has higher speed
  });

  it('should calculate damage correctly', () => {
    const initialHp = battle.players[battle.player2Id].hp;

    battle.executeAttack({
      playerId: battle.player1Id,
      type: 'normal_attack'
    });

    const newHp = battle.players[battle.player2Id].hp;

    expect(newHp).toBeLessThan(initialHp);
  });
});