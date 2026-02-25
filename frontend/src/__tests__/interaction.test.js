import { describe, test, expect } from 'vitest';

describe('Interaction System Frontend Tests', () => {
  const CHARACTER_SIZE = 40;

  describe('캐릭터 클릭 감지', () => {
    test('캐릭터 반경 내 클릭 감지', () => {
      const character = { x: 100, y: 100 };
      const clickX = 110;
      const clickY = 100;

      const distance = Math.sqrt(
        Math.pow(clickX - character.x, 2) + Math.pow(clickY - character.y, 2)
      );

      const isClicked = distance <= CHARACTER_SIZE / 2;

      expect(isClicked).toBe(true); // 반경 내 클릭
      expect(distance).toBe(10); // 거리 10
    });

    test('캐릭터 반경 외 클릭 무시', () => {
      const character = { x: 100, y: 100 };
      const clickX = 150;
      const clickY = 100;

      const distance = Math.sqrt(
        Math.pow(clickX - character.x, 2) + Math.pow(clickY - character.y, 2)
      );

      const isClicked = distance <= CHARACTER_SIZE / 2;

      expect(isClicked).toBe(false); // 반경 외 클릭
      expect(distance).toBe(50); // 거리 50 > 20 (반경)
    });

    test('캐릭터 경계 클릭 감지 (반위치)', () => {
      const character = { x: 100, y: 100 };
      const clickX = 120; // 정확히 경계
      const clickY = 100;

      const distance = Math.sqrt(
        Math.pow(clickX - character.x, 2) + Math.pow(clickY - character.y, 2)
      );

      const isClicked = distance <= CHARACTER_SIZE / 2;

      expect(isClicked).toBe(true); // 경계 포함
      expect(distance).toBe(20); // 경계 = 반경
    });
  });

  describe('클릭 효과 관리', () => {
    test('하트 클릭 효과 추가 및 500ms 후 제거', () => {
      const mockEffects = [];
      const now = Date.now();

      // 효과 추가
      mockEffects.push({
        x: 100,
        y: 100,
        timestamp: now,
        type: 'heart'
      });

      expect(mockEffects.length).toBe(1);
      expect(mockEffects[0].type).toBe('heart');

      // 500ms 후 제거 로직
      const filtered = mockEffects.filter(
        effect => Date.now() - effect.timestamp <= 500
      );

      // 현재 시간에서 600ms 경과 시 제거됨
      const futureTime = now + 600;
      const futureFiltered = mockEffects.filter(
        effect => futureTime - effect.timestamp <= 500
      );

      expect(futureFiltered.length).toBe(0); // 500ms 초과 효과 제거됨
    });

    test('다중 효과 동시 관리', () => {
      const mockEffects = [];
      const now = Date.now();

      mockEffects.push({ x: 100, y: 100, timestamp: now, type: 'heart' });
      mockEffects.push({ x: 200, y: 200, timestamp: now + 100, type: 'heart' });
      mockEffects.push({ x: 300, y: 300, timestamp: now + 300, type: 'heart' });

      expect(mockEffects.length).toBe(3);

      // 가장 오래된 효과 (now) 제거
      const futureTime = now + 600; // 600ms 경과
      const filtered = mockEffects.filter(
        effect => futureTime - effect.timestamp <= 500
      );

      // now+100, now+300 효과만 남음 (502ms, 302ms 경과)
      expect(filtered.length).toBe(2);
      expect(filtered[0].timestamp).toBe(now + 100);
      expect(filtered[1].timestamp).toBe(now + 300);
    });
  });

  describe('호감도 표시', () => {
    test('호감도 없으면 0 표시', () => {
      const affinities = {};
      const myId = 'char-001';
      const targetId = 'char-002';

      const affinity = affinities[myId]?.[targetId] || 0;

      expect(affinity).toBe(0);
    });

    test('호감도 데이터 있으면 해당 값 표시', () => {
      const affinities = {
        'char-001': {
          'char-002': 50,
          'char-003': 25
        }
      };

      const affinity = affinities['char-001']?.['char-002'] || 0;

      expect(affinity).toBe(50);
    });
  });
});