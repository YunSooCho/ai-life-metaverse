import { io } from 'socket.io-client'

// 현재 페이지의 hostname으로 backend 연결
const hostname = window.location.hostname
const backendUrl = `http://${hostname}:4000`

console.log('Connecting to backend:', backendUrl)

export const socket = io(backendUrl, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,           // 자동 재연결
  reconnectionAttempts: 5,      // 재연결 시도 횟수
  reconnectionDelay: 1000,      // 재연결 대기 시간 (ms)
  reconnectionDelayMax: 5000,   // 최대 재연결 대기 시간 (ms)
  timeout: 20000,               // 연결 타임아웃 (ms)
  forceNew: false               // 기존 연결 유지
})

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from server:', reason)
  if (reason === 'io server disconnect') {
    // 서버가 연결을 끊었으면 자동 재연결
    socket.connect()
  }
})

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message)
})

export default socket