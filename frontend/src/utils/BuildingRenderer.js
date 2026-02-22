/**
 * BuildingRenderer - 건물 스프라이트 렌더러
 * Phase 2 마무리: 건물 스프라이트 시스템 리팩토링
 */

// 건물 스프라이트 소스 좌표 (buildings.svg viewBox 0 0 800 200)
const BUILDING_SOURCES = {
  shop: { x: 0, y: 0, width: 128, height: 128 },
  cafe: { x: 128, y: 0, width: 128, height: 128 },
  park: { x: 256, y: 0, width: 200, height: 160 },
  library: { x: 464, y: 0, width: 150, height: 140 },
  gym: { x: 620, y: 0, width: 160, height: 140 }
}

// 건물 타입별 기본 색상 (fallback용)
const BUILDING_COLORS = {
  shop: '#4CAF50',
  cafe: '#FF9800',
  park: '#8BC34A',
  library: '#2196F3',
  gym: '#F44336'
}

/**
 * 건물 스프라이트 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} building - 건물 데이터
 * @param {number} scale - 스케일 팩터
 * @param {Object} spriteSheets - 스프라이트 시트 객체
 * @param {Function} renderEntranceHighlight - 입장 하이라이트 함수
 * @param {boolean} isHighlighted - 하이라이트 여부
 */
export function renderBuilding(ctx, building, scale, spriteSheets, renderEntranceHighlight, isHighlighted = false) {
  const bx = building.x * scale
  const by = building.y * scale
  const bw = building.width * scale
  const bh = building.height * scale

  // 스프라이트 사용 여부 확인
  const hasSprite = spriteSheets && spriteSheets.buildings && (
    spriteSheets.buildings instanceof Image ||
    (typeof spriteSheets.buildings === 'object' && spriteSheets.buildings.width > 0)
  )
  
  // 건물 스프라이트 속성 결정 (sprite 속성 우선, type fallback)
  const spriteKey = building.sprite || building.type
  const source = BUILDING_SOURCES[spriteKey]

  if (hasSprite && source) {
    // 스프라이트 렌더링
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      spriteSheets.buildings,
      source.x, source.y, source.width, source.height, // 소스 좌표
      bx, by, bw, bh // 목표 좌표
    )
  } else {
    // Fallback: 기본 색상 건물 렌더링
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = BUILDING_COLORS[building.type] || building.color || '#888888'
    ctx.fillRect(bx, by, bw, bh)

    // 픽셀 아트 스타일 테두리
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(bx, by, bw, bh)
  }

  // 입장 하이라이트
  if (isHighlighted && renderEntranceHighlight) {
    renderEntranceHighlight(ctx, building.entrance, scale)
  }

  // 건물 이름 (레트로 폰트 스타일)
  const fontSize = Math.max(10, 12 * scale)
  ctx.font = `${fontSize}px 'Courier New', monospace`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#000000'
  ctx.shadowBlur = 2
  ctx.fillText(building.name, bx + bw / 2, by + bh / 2)
  ctx.shadowBlur = 0
}

/**
 * 모든 건물 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} buildings - 건물 배열
 * @param {number} scale - 스케일 팩터
 * @param {Object} spriteSheets - 스프라이트 시트 객체
 * @param {Function} renderEntranceHighlight - 입장 하이라이트 함수
 * @param {boolean} isHighlighted - 하이라이트 여부
 */
export function renderBuildings(ctx, buildings, scale, spriteSheets, renderEntranceHighlight, isHighlighted = false) {
  buildings.forEach(building => {
    renderBuilding(ctx, building, scale, spriteSheets, renderEntranceHighlight, isHighlighted)
  })
}

/**
 * 건물 하이라이트 확인 (마우스 오버)
 * @param {number} mouseX - 마우스 X 좌표
 * @param {number} mouseY - 마우스 Y 좌표
 * @param {Object} building - 건물 데이터
 * @param {number} scale - 스케일 팩터
 * @returns {boolean} 하이라이트 필요 여부
 */
export function isBuildingHighlighted(mouseX, mouseY, building, scale) {
  const bx = building.x * scale
  const by = building.y * scale
  const bw = building.width * scale
  const bh = building.height * scale
  return mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh
}

// ============================================================================
// 인테리어 렌더링 함수들 (Issue #71)
// ============================================================================

/**
 * 인테리어 배경 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} interior - 인테리어 데이터
 * @param {number} canvasWidth - 캔버스 너비
 * @param {number} canvasHeight - 캔버스 높이
 */
export function renderInteriorBackground(ctx, interior, canvasWidth, canvasHeight) {
  const bg = interior.background || {}

  // 배경색
  ctx.fillStyle = bg.color || '#F5F5DC'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 바닥 패턴 (픽셀 아트 스타일)
  if (bg.floorColor) {
    const tileSize = 64
    for (let x = 0; x < canvasWidth; x += tileSize) {
      for (let y = 0; y < canvasHeight; y += tileSize) {
        ctx.fillStyle = ((x / tileSize + y / tileSize) % 2 === 0) ? bg.floorColor : darkenColor(bg.floorColor, 0.1)
        ctx.fillRect(x, y, tileSize, tileSize)
      }
    }
  }

  // 그리드 효과
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.lineWidth = 1
  for (let x = 0; x < canvasWidth; x += 32) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
    ctx.stroke()
  }
  for (let y = 0; y < canvasHeight; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
    ctx.stroke()
  }
}

/**
 * 인테리어 가구 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} furniture - 가구 배열
 * @param {number} scale - 스케일 팩터
 */
export function renderInteriorFurniture(ctx, furniture, scale) {
  if (!furniture || !Array.isArray(furniture)) return

  furniture.forEach(item => {
    const x = item.x * scale
    const y = item.y * scale
    const width = item.width * scale
    const height = item.height * scale

    // 기본 색상으로 렌더링 (픽셀 아트 스타일)
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = item.color || '#888888'
    ctx.fillRect(x, y, width, height)

    // 테두리
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)

    // 하이라이트 효과
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(x, y, width, 4)
  })
}

/**
 * 인테리어 아이템 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} items - 아이템 배열
 * @param {number} scale - 스케일 팩터
 */
export function renderInteriorItems(ctx, items, scale) {
  if (!items || !Array.isArray(items)) return

  items.forEach(item => {
    const x = item.x * scale
    const y = item.y * scale
    const size = 24 * scale

    // 아이템 배경
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(x - size / 2, y - size / 2, size, size)

    // 테두리
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    ctx.strokeRect(x - size / 2, y - size / 2, size, size)

    // 이모지 렌더링
    if (item.emoji) {
      ctx.font = `${size * 0.8}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.emoji, x, y)
    } else {
      // 기본 아이콘
      ctx.fillStyle = '#4CAF50'
      ctx.beginPath()
      ctx.arc(x, y, size / 4, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/**
 * 인테리어 NPC 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} npcs - NPC 배열
 * @param {number} scale - 스케일 팩터
 * @param {Function} renderCharacter - 캐릭터 렌더링 함수
 */
export function renderInteriorNPCs(ctx, npcs, scale, renderCharacter) {
  if (!npcs || !Array.isArray(npcs)) return

  npcs.forEach(npc => {
    const x = npc.x * scale
    const y = npc.y * scale

    // NPC 캐릭터 렌더링 (기본 스타일)
    const charSize = 48 * scale

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.ellipse(x, y + charSize / 2, charSize / 3, charSize / 6, 0, 0, Math.PI * 2)
    ctx.fill()

    // 몸통
    ctx.fillStyle = npc.color || '#888888'
    ctx.fillRect(x - charSize / 4, y - charSize / 4, charSize / 2, charSize / 2)

    // 머리
    ctx.fillStyle = '#FFD5B8'
    ctx.fillRect(x - charSize / 6, y - charSize / 3, charSize / 3, charSize / 4)

    // AI 표시
    ctx.font = `${16 * scale}px Arial`
    ctx.fillStyle = '#FF6B6B'
    ctx.textAlign = 'center'
    ctx.fillText('🤖', x, y - charSize / 2)

    // 이름
    ctx.font = `${10 * scale}px 'Courier New', monospace`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 2
    ctx.fillText(npc.name, x, y + charSize / 2 + 15)
    ctx.shadowBlur = 0
  })
}

/**
 * 퇴장 버튼 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {number} scale - 스케일 팩터
 * @returns {Object} 버튼 영역 {x, y, width, height}
 */
export function renderInteriorExitButton(ctx, x = 30, y = 30, scale = 1) {
  const buttonWidth = 100 * scale
  const buttonHeight = 35 * scale

  // 버튼 배경
  ctx.fillStyle = '#f44336'
  ctx.imageSmoothingEnabled = false
  ctx.fillRect(x, y, buttonWidth, buttonHeight)

  // 테두리
  ctx.strokeStyle = '#d32f2f'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, buttonWidth, buttonHeight)

  // 텍스트
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${12 * scale}px 'Courier New', monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('EXIT', x + buttonWidth / 2, y + buttonHeight / 2)

  return { x, y, width: buttonWidth, height: buttonHeight }
}

/**
 * 인테리어 상단 정보 텍스트 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} buildingName - 건물 이름
 * @param {number} canvasWidth - 캔버스 너비
 * @param {number} scale - 스케일 팩터
 */
export function renderInteriorHeader(ctx, buildingName, canvasWidth, scale = 1) {
  // 배경
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvasWidth, 50 * scale)

  // 건물 이름
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${16 * scale}px 'Courier New', monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#000000'
  ctx.shadowBlur = 2
  ctx.fillText(buildingName, canvasWidth / 2, 25 * scale)
  ctx.shadowBlur = 0
}

/**
 * 인테리어 전체 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} interior - 인테리어 데이터
 * @param {number} canvasWidth - 캔버스 너비
 * @param {number} canvasHeight - 캔버스 높이
 * @param {number} scale - 스케일 팩터
 * @param {Function} renderCharacter - 캐릭터 렌더링 함수 (선택)
 * @returns {Object} 퇴장 버튼 영역
 */
export function renderInterior(ctx, interior, canvasWidth, canvasHeight, scale = 1, renderCharacter = null) {
  // 배경
  renderInteriorBackground(ctx, interior, canvasWidth, canvasHeight)

  // 가구
  if (interior.furniture) {
    renderInteriorFurniture(ctx, interior.furniture, scale)
  }

  // 아이템
  if (interior.items) {
    renderInteriorItems(ctx, interior.items, scale)
  }

  // NPC
  if (interior.npcs) {
    renderInteriorNPCs(ctx, interior.npcs, scale, renderCharacter)
  }

  // 상단 헤더
  renderInteriorHeader(ctx, interior.name || 'Interior', canvasWidth, scale)

  // 퇴장 버튼
  const exitButton = renderInteriorExitButton(ctx, 30 * scale, 30 * scale, scale)

  return exitButton
}

/**
 * 색상 어둡게 처리
 * @param {string} color - 원본 색상 (hex)
 * @param {number} factor - 어둡기 팩터 (0~1)
 * @returns {string} 어두워진 색상
 */
function darkenColor(color, factor = 0.1) {
  // Hex to RGB
  let hex = color.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Darken
  const newR = Math.max(0, Math.floor(r * (1 - factor)))
  const newG = Math.max(0, Math.floor(g * (1 - factor)))
  const newB = Math.max(0, Math.floor(b * (1 - factor)))

  // RGB to Hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * 인테리어 퇴장 버튼 클릭 확인
 * @param {number} mouseX - 마우스 X 좌표
 * @param {number} mouseY - 마우스 Y 좌표
 * @param {Object} exitButton - 퇴장 버튼 영역 {x, y, width, height}
 * @returns {boolean} 클릭 여부
 */
export function isExitButtonClicked(mouseX, mouseY, exitButton) {
  if (!exitButton) return false
  return mouseX >= exitButton.x &&
         mouseX <= exitButton.x + exitButton.width &&
         mouseY >= exitButton.y &&
         mouseY <= exitButton.y + exitButton.height
}