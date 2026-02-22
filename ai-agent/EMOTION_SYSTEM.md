# AI 캐릭터 감정 표현 시스템 (Emotion System)

## 개요
AI 캐릭터의 감정 상태를 관리하고, 대화 내용에 따른 감정 변화를 감지하여 표현하는 시스템입니다.

## 구성 요소

### 1. EmotionManager 클래스
- **위치**: `ai-agent/emotion-manager.js`
- **기능**:
  - 5가지 감정 상태 관리 (happy, sad, angry, surprised, neutral)
  - 텍스트 기반 감정 분석
  - 감정 이력 추적
  - 다국어 지원 (한국어/영어)

### 2. 감정 상태 타입
```javascript
const emotionTypes = ['happy', 'sad', 'angry', 'surprised', 'neutral']
```

### 3. 감정 이모지 매핑
```javascript
const emotionEmojis = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  neutral: '😐'
}
```

## 테스트 실행 방법

### 1. 의존성 설치
```bash
cd ai-agent
npm install
```

### 2. 테스트 실행

#### 단일 실행 모드 (일회성 실행)
```bash
npm test -- --run
```

#### 감시 모드 (Watch Mode - 파일 변경 시 자동 재실행)
```bash
npm test
```

#### UI 모드
```bash
npm test -- --ui
```

### 3. 테스트覆盖 범위

#### EmotionManager 테스트 (`test/emotion-manager.test.js`)
- 기본 감정 상태 초기화
- 감정 설정 및 변경
- 감정 기록 관리
- 텍스트 기반 감정 분석
- 다국어 키워드 감지
- 감정 상태 정보 조회

#### 감정 변화 로직 테스트 (`test/emotion-change-logic.test.js`)
- 채팅 기반 감정 전이
- 순차적 감정 변화 체인
- 감정 점수 계산
- 다국어 감지 (한국어/영어)
- 캐릭터 인터랙션 감정 컨텍스트
- 감정 상태 지속성
- 엣지 케이스 처리

## 기능 사용 예시

### 감정 분석
```javascript
import { EmotionManager } from './emotion-manager.js'

const emotionManager = new EmotionManager('neutral')

// 메시지 분석 및 감정 업데이트
const result = emotionManager.analyzeEmotion('I am so happy today!')
console.log(result)
// {
//   emotion: 'happy',
//   scores: { happy: 1, sad: 0, angry: 0, surprised: 0, neutral: 0 },
//   emoji: '😊'
// }
```

### 감정 설정
```javascript
emotionManager.setEmotion('sad', 'Received bad news')
console.log(emotionManager.currentEmotion) // 'sad'
console.log(emotionManager.currentEmoji) // '😢'
```

### 감정 기록 조회
```javascript
const history = emotionManager.getHistory(5)
console.log(history)
// [
//   { from: 'neutral', to: 'happy', timestamp: 1234567890, reason: '...' },
//   { from: 'happy', to: 'sad', timestamp: 1234567900, reason: 'Received bad news' }
// ]
```

## AI Agent 통합

### agent.js에서의 사용
- `generateChatResponse()` 함수에서 메시지 감정 분석
- 캐릭터 이동 시 감정 상태 포함하여 전송
-emotion 객체가 socket을 통해 프론트엔드로 전달

### 캐릭터 표시 (Character.jsx)
- Emotion 타입 prop 추가
- 감정 이모지 렌더링 (AI 캐릭터에만 표시)

## 테스트 통과 확인

모든 테스트가 통과해야 합니다:

```
Test Files  2 passed (2)
Tests  47 passed (47)
```

## 테스트 구조

### 감정 키워드 분석 로직
1. 메시지 텍스트 소문자 변환
2. 감정별 키워드 매칭 (한국어/영어)
3. 각 감정별 점수 계산
4. 최고 점수 감정 선택
5. 감정 상태 업데이트 및 기록

### 감정 점수 계산 규칙
- 각 감정 키워드 발견 시 +1 점
- 감정 키워드 없을 경우 neutral에 0.5 점
- 감정 키워드 있을 경우 neutral 0 점

## 주요 기능
1. **자동 감정 분석**: 채팅 메시지에서 감정 키워드 자동 감지
2. **이력 추적**: 감정 변경 이력 저장 및 조회
3. **다국어 지원**: 한국어/영어 키워드 모두 감지
4. **UI 표시**: AI 캐릭터 옆에 감정 이모지 표시
5. **테스트 커버리지**: 47개 테스트 케이스로 코드质量 보장