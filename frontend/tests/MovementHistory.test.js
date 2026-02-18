/**
 * MovementHistory 테스트 코드
 *
 * 테스트 항목:
 * 1. 위치 추가 및 히스토리 크기 제한
 * 2. 이동 임계값 무시 (노이즈 제거)
 * 3. 이동 중 여부 계산
 * 4. 이동 벡터 계산 (정규화 포함)
 * 5. 방향 결정 (8방향 포함)
 * 6. 속도 계산
 * 7. MovementHistoryManager 다중 캐릭터 관리
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import MovementHistory, { MovementHistoryManager, DEFAULT_MAX_HISTORY, MOVEMENT_THRESHOLD, DIRECTION_HISTORY_SIZE } from '../src/utils/MovementHistory.js'

describe('MovementHistory', () => {
  let history

  beforeEach(() => {
    history = new MovementHistory('test-char', DEFAULT_MAX_HISTORY)
  })

  afterEach(() => {
    // 테스트 사이 클린업
  })

  describe('위치 추가 및 히스토리 관리', () => {
    it('첫 위치가 정상적으로 추가된다', () => {
      history.addPosition(100, 200)
      expect(history.size()).toBe(1)
      expect(history.getCurrentPosition()).toEqual({ x: 100, y: 200, timestamp: expect.any(Number) })
    })

    it('임계값 이상 이동 시에만 위치가 추가된다', () => {
      history.addPosition(100, 200)
      // 임계값 미만 이동 (무시되어야 함)
      history.addPosition(100.1, 200.1)  // dx=0.1, dy=0.1, distance≈0.14 < 0.5
      expect(history.size()).toBe(1)
    })

    it('임계값 이상 이동 시 새 위치가 추가된다', () => {
      history.addPosition(100, 200)
      // 임계값 이상 이동 (추가되어야 함)
      history.addPosition(105, 205)  // dx=5, dy=5, distance≈7.07 > 0.5
      expect(history.size()).toBe(2)
    })

    it('히스토리 크기가 maxHistory로 제한된다', () => {
      const MAX_SIZE = 10
      const smallHistory = new MovementHistory('test-char', MAX_SIZE)

      // maxHistory + 1개 위치 추가
      for (let i = 0; i < MAX_SIZE + 5; i++) {
        smallHistory.addPosition(100 + i * 10, 200 + i * 10)
      }

      expect(smallHistory.size()).toBe(MAX_SIZE)
    })

    it('최근 N개 위치를 올바르게 반환한다', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)
      history.addPosition(120, 220)
      history.addPosition(130, 230)

      const recent = history.getRecentPositions(2)
      expect(recent).toHaveLength(2)
      expect(recent[0]).toEqual({ x: 120, y: 220, timestamp: expect.any(Number) })
      expect(recent[1]).toEqual({ x: 130, y: 230, timestamp: expect.any(Number) })
    })
  })

  describe('이동 감지', () => {
    it('히스토리가 없으면 이동 중이 아니다', () => {
      expect(history.isMoving()).toBe(false)
    })

    it('하나의 위치만 있으면 이동 중이 아니다', () => {
      history.addPosition(100, 200)
      expect(history.isMoving()).toBe(false)
    })

    it('연속 이동 시 이동 중이다', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)
      history.addPosition(120, 220)
      expect(history.isMoving()).toBe(true)
    })

    it('정지한 후에는 이동 중이 아니다', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)
      history.addPosition(120, 220)
      history.addPosition(120, 220)  // 정지
      history.addPosition(120, 220)  // 정지
      expect(history.isMoving()).toBe(false)
    })
  })

  describe('이동 벡터 계산', () => {
    it('히스토리가 없으면 영 벡터 반환', () => {
      const vector = history.calculateMovementVector()
      expect(vector.dx).toBe(0)
      expect(vector.dy).toBe(0)
      expect(vector.normalized).toEqual({ x: 0, y: 0 })
    })

    it('오른쪽 이동 벡터 계산', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 200)
      const vector = history.calculateMovementVector()
      expect(vector.dx).toBeCloseTo(10, 1)
      expect(vector.dy).toBeCloseTo(0, 1)
      expect(vector.normalized).toEqual({ x: 1, y: 0 })
    })

    it('왼쪽 이동 벡터 계산', () => {
      history.addPosition(100, 200)
      history.addPosition(90, 200)
      const vector = history.calculateMovementVector()
      expect(vector.dx).toBeCloseTo(-10, 1)
      expect(vector.dy).toBeCloseTo(0, 1)
      expect(vector.normalized).toEqual({ x: -1, y: 0 })
    })

    it('위쪽 이동 벡터 계산', () => {
      history.addPosition(100, 200)
      history.addPosition(100, 190)
      const vector = history.calculateMovementVector()
      expect(vector.dx).toBeCloseTo(0, 1)
      expect(vector.dy).toBeCloseTo(-10, 1)
      expect(vector.normalized).toEqual({ x: 0, y: -1 })
    })

    it('아래쪽 이동 벡터 계산', () => {
      history.addPosition(100, 200)
      history.addPosition(100, 210)
      const vector = history.calculateMovementVector()
      expect(vector.dx).toBeCloseTo(0, 1)
      expect(vector.dy).toBeCloseTo(10, 1)
      expect(vector.normalized).toEqual({ x: 0, y: 1 })
    })

    it('대각선 이동 벡터 정규화', () => {
      history.addPosition(0, 0)
      history.addPosition(10, 10)
      const vector = history.calculateMovementVector()
      expect(vector.normalized.x).toBeCloseTo(0.707, 2)
      expect(vector.normalized.y).toBeCloseTo(0.707, 2)
    })

    it('최근 N개 위치의 평균 벡터 계산', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)
      history.addPosition(120, 220)
      history.addPosition(140, 240)  // 더 큰 이동

      // n=2로 설정
      const vector = history.calculateMovementVector(2)
      // 마지막 2개 위치 평균: (120,220) → (140,240) = (20, 20)
      expect(vector.dx).toBeCloseTo(20, 1)
      expect(vector.dy).toBeCloseTo(20, 1)
    })
  })

  describe('방향 결정', () => {
    it('이동 중이 아니면 idle 반환', () => {
      history.addPosition(100, 200)
      expect(history.getDirection()).toBe('idle')
    })

    it('오른쪽 이동 시 right 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 200)
      expect(history.getDirection()).toBe('right')
    })

    it('왼쪽 이동 시 left 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(90, 200)
      expect(history.getDirection()).toBe('left')
    })

    it('위쪽 이동 시 up 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(100, 190)
      expect(history.getDirection()).toBe('up')
    })

    it('아래쪽 이동 시 down 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(100, 210)
      expect(history.getDirection()).toBe('down')
    })

    it('대각선 이동 시 주축 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)  // 대각선 오른쪽 아래
      expect(history.getDirection()).toBe('right')  // dx == dy 이므로 오른쪽/왼쪽 우선
    })
  })

  describe('상세 방향 결정 (8방향)', () => {
    it('오른쪽-위 대각선 이동 시 up-right 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 190)
      expect(history.getDetailedDirection()).toBe('up-right')
    })

    it('오른쪽-아래 대각선 이동 시 down-right 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)
      expect(history.getDetailedDirection()).toBe('down-right')
    })

    it('왼쪽-위 대각선 이동 시 up-left 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(90, 190)
      expect(history.getDetailedDirection()).toBe('up-left')
    })

    it('왼쪽-아래 대각선 이동 시 down-left 반환', () => {
      history.addPosition(100, 200)
      history.addPosition(90, 210)
      expect(history.getDetailedDirection()).toBe('down-left')
    })
  })

  describe('속도 계산', () => {
    it('이동 중이 아니면 속도 0 반환', () => {
      history.addPosition(100, 200)
      expect(history.calculateSpeed()).toBe(0)
    })

    it('속도를 올바르게 계산한다', () => {
      const now = Date.now()
      history.addPosition(100, 200, now)
      history.addPosition(110, 210, now + 100)  // 100ms에 14.14px 이동

      const speed = history.calculateSpeed()
      expect(speed).toBeCloseTo(0.1414, 3)  // 14.14px / 100ms ≈ 0.1414 px/ms
    })

    it('빠른 이동 시 속도가 높다', () => {
      const now = Date.now()
      history.addPosition(100, 200, now)
      history.addPosition(110, 210, now + 50)  // 50ms에 14.14px 이동

      const speed = history.calculateSpeed()
      expect(speed).toBeCloseTo(0.2828, 3)  // 14.14px / 50ms ≈ 0.2828 px/ms
    })
  })

  describe('히스토리 초기화', () => {
    it('clear()로 히스토리를 비운다', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)
      history.addPosition(120, 220)

      expect(history.size()).toBe(3)

      history.clear()

      expect(history.size()).toBe(0)
      expect(history.getCurrentPosition()).toBeNull()
    })
  })

  describe('상태 요약', () => {
    it('getStatus()로 현재 상태를 반환한다', () => {
      history.addPosition(100, 200)
      history.addPosition(110, 210)

      const status = history.getStatus()
      expect(status).toHaveProperty('isMoving')
      expect(status).toHaveProperty('direction')
      expect(status).toHaveProperty('detailedDirection')
      expect(status).toHaveProperty('speed')
      expect(status).toHaveProperty('size')
      expect(status).toHaveProperty('currentPosition')
      expect(status.size).toBe(2)
    })
  })

  describe('MovementHistoryManager', () => {
    let manager

    beforeEach(() => {
      manager = new MovementHistoryManager()
    })

    afterEach(() => {
      manager.clearAll()
    })

    describe('다중 캐릭터 관리', () => {
      it('새 캐릭터의 히스토리를 생성한다', () => {
        const history = manager.getHistory('char-1')
        expect(history).toBeInstanceOf(MovementHistory)
        expect(history.characterId).toBe('char-1')
      })

      it('같은 캐릭터의 히스토리를 재사용한다', () => {
        const history1 = manager.getHistory('char-1')
        const history2 = manager.getHistory('char-1')
        expect(history1).toBe(history2)
      })

      it('여러 캐릭터의 히스토리를 독립적으로 관리한다', () => {
        manager.addPosition('char-1', 100, 200)
        manager.addPosition('char-2', 300, 400)

        expect(manager.isMoving('char-1')).toBe(false)  // 위치 1개
        expect(manager.isMoving('char-2')).toBe(false)  // 위치 1개
      })

      it('캐릭터별로 이동 상태를 추적한다', () => {
        manager.addPosition('char-1', 100, 200)
        manager.addPosition('char-1', 110, 210)

        manager.addPosition('char-2', 300, 400)
        manager.addPosition('char-2', 310, 410)

        expect(manager.isMoving('char-1')).toBe(true)
        expect(manager.isMoving('char-2')).toBe(true)
      })

      it('캐릭터별로 방향을 계산한다', () => {
        manager.addPosition('char-1', 100, 200)
        manager.addPosition('char-1', 110, 200)  // 오른쪽

        manager.addPosition('char-2', 300, 400)
        manager.addPosition('char-2', 300, 390)  // 위쪽

        expect(manager.getDirection('char-1')).toBe('right')
        expect(manager.getDirection('char-2')).toBe('up')
      })
    })

    describe('캐릭터 제거', () => {
      it('clear()로 캐릭터 히스토리를 비운다', () => {
        manager.addPosition('char-1', 100, 200)
        manager.addPosition('char-1', 110, 210)

        expect(manager.isMoving('char-1')).toBe(true)

        manager.clear('char-1')

        expect(manager.isMoving('char-1')).toBe(false)
      })

      it('remove()로 캐릭터 히스토리를 완전히 제거한다', () => {
        manager.addPosition('char-1', 100, 200)
        manager.addPosition('char-1', 110, 210)

        expect(manager.size()).toBe(1)

        manager.remove('char-1')

        expect(manager.size()).toBe(0)
        expect(manager.isMoving('char-1')).toBe(false)
      })
    })

    describe('전체 관리', () => {
      it('clearAll()로 모든 히스토리를 비운다', () => {
        manager.addPosition('char-1', 100, 200)
        manager.addPosition('char-2', 300, 400)
        manager.addPosition('char-3', 500, 600)

        expect(manager.size()).toBe(3)

        manager.clearAll()

        expect(manager.size()).toBe(0)
      })

      it('getCharacterIds()로 관리 중인 캐릭터 목록을 반환한다', () => {
        manager.addPosition('char-1', 100, 200)
        manager.addPosition('char-2', 300, 400)

        const ids = manager.getCharacterIds()
        expect(ids).toHaveLength(2)
        expect(ids).toContain('char-1')
        expect(ids).toContain('char-2')
      })
    })
  })

  describe('전역 인스턴스 동작', () => {
    it('globalMovementHistoryManager가 정상적으로 동작한다', () => {
      const manager = globalMovementHistoryManager

      manager.addPosition('global-char-1', 100, 200)
      manager.addPosition('global-char-1', 110, 210)

      expect(manager.isMoving('global-char-1')).toBe(true)
      expect(manager.getDirection('global-char-1')).toBe('right')

      // 테스트 후 정리
      manager.remove('global-char-1')
    })
  })
})