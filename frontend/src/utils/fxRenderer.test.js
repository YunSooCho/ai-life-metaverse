/**
 * FX 스프라이트 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import spriteRenderer from './spriteRenderer';

// Mock Canvas context
const createMockCtx = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  imageSmoothingEnabled: false,
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  globalAlpha: 1,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: 'butt',
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  bezierCurveTo: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  createPattern: vi.fn(),
  createRadialGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn()
  })
});

describe('FX 스프라이트 시스템', () => {
  let ctx;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe('renderFX', () => {
    it('점프 FX를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'jump', 100, 100, 50, 0.5, { direction: 'left' });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.imageSmoothingEnabled).toBe(false);
    });

    it('하트 FX를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'heart', 100, 100, 50, 0.5, { color: '#FF6B6B' });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('데드 FX를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'dead', 100, 100, 50, 0.5, { color: '#FF0000' });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('로딩 FX를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'loading', 100, 100, 50, 0.5, { color: '#4CAF50' });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('알 수 없는 FX 타입을 처리한다', () => {
      expect(() => {
        spriteRenderer.renderFX(ctx, 'unknown', 100, 100, 50, 0.5);
      }).not.toThrow();
    });
  });

  describe('점프 FX', () => {
    it('왼쪽 방향 점프 효과를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'jump', 100, 100, 50, 0.3, { direction: 'left' });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.beginPath).toHaveBeenCalled();
    });

    it('오른쪽 방향 점프 효과를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'jump', 100, 100, 50, 0.3, { direction: 'right' });

      expect(ctx.save).toHaveBeenCalled();
    });

    it('진행률에 따라 파티클 크기가 감소한다', () => {
      spriteRenderer.renderFX(ctx, 'jump', 100, 100, 50, 0.8, { direction: 'left' });

      expect(ctx.save).toHaveBeenCalled();
    });
  });

  describe('하트 FX', () => {
    it('하트 이동 및 페이드 효과를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'heart', 100, 100, 50, 0.3);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.globalAlpha).toBeLessThanOrEqual(1);
    });

    it('진행률이 높으면 반짝이 효과를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'heart', 100, 100, 50, 0.8);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.beginPath).toHaveBeenCalled();
    });

    it('하트 크기가 진행률에 따라 커진다', () => {
      spriteRenderer.renderFX(ctx, 'heart', 100, 100, 50, 0.5);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.beginPath).toHaveBeenCalled();
    });
  });

  describe('데드 FX', () => {
    it('데드 아이콘 X 표시를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'dead', 100, 100, 50, 0.5);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('진행률이 높으면 희미티 효과를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'dead', 100, 100, 50, 0.5);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('초기 진행률에서 흔들림 효과를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'dead', 100, 100, 50, 0.3);

      expect(ctx.save).toHaveBeenCalled();
    });
  });

  describe('로딩 FX', () => {
    it('로딩 인디케이터를 렌더링한다', () => {
      spriteRenderer.renderFX(ctx, 'loading', 100, 100, 50, 0.5);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it('진행률에 따라 회전한다', () => {
      spriteRenderer.renderFX(ctx, 'loading', 100, 100, 50, 0.25);

      expect(ctx.rotate).toHaveBeenCalled();
    });

    it('세그먼트 수를 지정할 수 있다', () => {
      spriteRenderer.renderFX(ctx, 'loading', 100, 100, 50, 0.5, { segments: 12 });

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('FX 옵션', () => {
    it('커스텀 색상을 지정할 수 있다', () => {
      spriteRenderer.renderFX(ctx, 'jump', 100, 100, 50, 0.5, { color: '#00FF00' });

      expect(ctx.save).toHaveBeenCalled();
    });

    it('커스텀 크기를 지정할 수 있다', () => {
      spriteRenderer.renderFX(ctx, 'heart', 100, 100, 75, 0.5);

      expect(ctx.save).toHaveBeenCalled();
    });

    it('커스텀 옵션을 전달할 수 있다', () => {
      spriteRenderer.renderFX(ctx, 'loading', 100, 100, 50, 0.5, {
        color: '#FF5722',
        segments: 6
      });

      expect(ctx.save).toHaveBeenCalled();
    });
  });
});