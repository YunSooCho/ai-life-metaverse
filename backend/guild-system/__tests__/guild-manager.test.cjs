/**
 * 길드 매니저 테스트
 */

const GuildManager = require('../guild-manager.cjs');

describe('GuildManager', () => {
  let guildManager;

  beforeEach(() => {
    guildManager = new GuildManager();
  });

  describe('createGuild', () => {
    test('길드를 생성할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드', '🏰');

      expect(guild).toBeDefined();
      expect(guild.leaderId).toBe('leader-1');
      expect(guild.name).toBe('테스트 길드');
      expect(guild.emblem).toBe('🏰');
      expect(guild.level).toBe(1);
      expect(guild.members).toHaveLength(1);
      expect(guild.members[0].role).toBe('leader');
    });

    test('이미 길드가 있는 플레이어는 길드를 생성할 수 없다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드', '🏰');

      expect(() => {
        guildManager.createGuild('leader-1', '길드장2', '테스트 길드2');
      }).toThrow('이미 길드에 소속되어 있습니다.');
    });

    test('같은 이름의 길드를 생성할 수 없다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      expect(() => {
        guildManager.createGuild('leader-2', '길드장2', '테스트 길드');
      }).toThrow('이미 존재하는 길드 이름입니다.');
    });
  });

  describe('disbandGuild', () => {
    test('길드장만 길드를 해체할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      const result = guildManager.disbandGuild(guild.id, 'leader-1');

      expect(result.success).toBe(true);
      expect(guildManager.guilds.has(guild.id)).toBe(false);
    });

    test('길드장이 아니면 길드를 해체할 수 없다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      expect(() => {
        guildManager.disbandGuild(guild.id, 'other-player');
      }).toThrow('길드장만 길드를 해체할 수 있습니다.');
    });
  });

  describe('requestJoin', () => {
    test('플레이어가 길드에 가입할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      const result = guildManager.requestJoin(guild.id, 'player-1', '플레이어1');

      expect(result.success).toBe(true);
      expect(guild.members.length).toBe(2);
      expect(guildManager.playerGuilds.has('player-1')).toBe(true);
    });

    test('이미 길드에 있는 플레이어는 가입할 수 없다', () => {
      guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      expect(() => {
        guildManager.requestJoin('guild-x', 'leader-1', '길드장');
      }).toThrow('이미 길드에 소속되어 있습니다.');
    });
  });

  describe('leaveGuild', () => {
    test('멤버가 길드를 탈퇴할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      guildManager.requestJoin(guild.id, 'player-1', '플레이어1');

      const result = guildManager.leaveGuild('player-1');

      expect(result.success).toBe(true);
      expect(guild.members.length).toBe(1);
      expect(guildManager.playerGuilds.has('player-1')).toBe(false);
    });

    test('길드장은 탈퇴할 수 없다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      expect(() => {
        guildManager.leaveGuild('leader-1');
      }).toThrow('길드장은 탈퇴할 수 없습니다.');
    });
  });

  describe('kickMember', () => {
    test('길드장이 멤버를 추방할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      guildManager.requestJoin(guild.id, 'player-1', '플레이어1');

      const result = guildManager.kickMember(guild.id, 'leader-1', 'player-1');

      expect(result.success).toBe(true);
      expect(guild.members.length).toBe(1);
    });

    test('길드장은 추방할 수 없다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      expect(() => {
        guildManager.kickMember(guild.id, 'leader-1', 'leader-1');
      }).toThrow('길드장은 추방할 수 없습니다.');
    });
  });

  describe('transferLeadership', () => {
    test('길드장을 위임할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');
      guildManager.requestJoin(guild.id, 'player-1', '플레이어1');

      const result = guildManager.transferLeadership(guild.id, 'leader-1', 'player-1');

      expect(result.success).toBe(true);
      expect(guild.leaderId).toBe('player-1');
    });
  });

  describe('getGuildInfo', () => {
    test('길드 정보를 조회할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      const info = guildManager.getGuildInfo(guild.id);

      expect(info).toBeDefined();
      expect(info.id).toBe(guild.id);
      expect(info.name).toBe('테스트 길드');
    });
  });

  describe('getPlayerGuild', () => {
    test('플레이어의 길드를 조회할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      const playerGuild = guildManager.getPlayerGuild('leader-1');

      expect(playerGuild).toBeDefined();
      expect(playerGuild.id).toBe(guild.id);
    });

    test('길드가 없는 플레이어는 null을 반환한다', () => {
      const playerGuild = guildManager.getPlayerGuild('unknown-player');

      expect(playerGuild).toBeNull();
    });
  });

  describe('addExp', () => {
    test('경험치를 추가할 수 있다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      guildManager.addExp(guild.id, 500);

      expect(guild.exp).toBe(500);
    });

    test('경험치가 최대치를 넘으면 레벨업한다', () => {
      const guild = guildManager.createGuild('leader-1', '길드장', '테스트 길드');

      guildManager.addExp(guild.id, 1500);

      expect(guild.level).toBe(2);
    });
  });
});