/**
 * CORS 미들웨어 테스트
 * Issue #141: CORS 에러 - 이벤트 로드 실패
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'

describe('CORS Middleware', () => {
  let app

  beforeAll(() => {
    app = express()

    // 서버와 동일한 CORS 설정
    app.use(cors({
      origin: ['http://localhost:3000', 'http://10.76.29.91:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }))

    app.get('/test', (req, res) => {
      res.json({ message: 'ok' })
    })
  })

  it('should allow requests from localhost:3000', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://localhost:3000')

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000')
  })

  it('should allow requests from 10.76.29.91:3000', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://10.76.29.91:3000')

    expect(response.headers['access-control-allow-origin']).toBe('http://10.76.29.91:3000')
  })

  it('should support OPTIONS preflight', async () => {
    const response = await request(app)
      .options('/test')
      .set('Origin', 'http://10.76.29.91:3000')
      .set('Access-Control-Request-Method', 'GET')

    expect(response.headers['access-control-allow-origin']).toBe('http://10.76.29.91:3000')
    expect(response.headers['access-control-allow-methods']).toContain('GET')
  })

  it('should include credentials header', async () => {
    const response = await request(app)
      .get('/test')
      .set('Origin', 'http://10.76.29.91:3000')

    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })
})