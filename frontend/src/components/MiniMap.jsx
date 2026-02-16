import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import tilemapData from '../data/tilemap.json'

export const MAP_SIZE = { width: 1000, height: 700 }
export const MINIMAP_SIZE = { width: 200, height: 140 }

function MiniMap({
  myCharacter,
  characters,
  buildings,
  onClick
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = MINIMAP_SIZE.width / MAP_SIZE.width
    const scaleY = MINIMAP_SIZE.height / MAP_SIZE.height

    const render = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 타일맵 배경 렌더링 (픽셀 아트 스타일)
      ctx.imageSmoothingEnabled = false
      
      // Ground 레이어
      if (tilemapData.layers.ground && tilemapData.layers.ground.tiles) {
        tilemapData.layers.ground.tiles.forEach((tile) => {
          if (tile.color) {
            ctx.fillStyle = tile.color
            ctx.fillRect(
              tile.x * scaleX,
              tile.y * scaleY,
              tile.width * scaleX,
              tile.height * scaleY
            )
          }
          
          if (tile.path) {
            ctx.fillStyle = tile.color
            tile.path.forEach(path => {
              ctx.fillRect(
                path.x * scaleX,
                path.y * scaleY,
                path.width * scaleX,
                path.height * scaleY
              )
            })
          }
          
          if (tile.rects) {
            ctx.fillStyle = tile.color
            tile.rects.forEach(rect => {
              ctx.fillRect(
                rect.x * scaleX,
                rect.y * scaleY,
                rect.width * scaleX,
                rect.height * scaleY
              )
            })
          }
        })
      }

      // 픽셀 아트 그리드 렌더링
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // 건물 렌더링 (픽셀 아트 스타일)
      buildings.forEach(building => {
        const bx = building.x * scaleX
        const by = building.y * scaleY
        const bw = building.width * scaleX
        const bh = building.height * scaleY

        // 건물 색상 (타입별로 픽셀 아트 풍 색상)
        const colors = {
          shop: '#4CAF50',      // 상점: 초록
          cafe: '#FF9800',      // 카페: 주황
          park: '#8BC34A',      // 공원: 연두
          library: '#2196F3',   // 도서관: 파랑
          gym: '#F44336'        // 체육관: 빨강
        }

        ctx.fillStyle = colors[building.type] || '#888888'
        ctx.fillRect(bx, by, bw, bh)
        
        // 픽셀 아트 스타일 테두리 (강조)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.strokeRect(bx, by, bw, bh)
      })

      // AI 캐릭터 렌더링 (픽셀 아트 스타일)
      Object.values(characters).forEach(char => {
        if (char.isAi) {
          const x = char.x * scaleX
          const y = char.y * scaleY

          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#FFFF00'
          ctx.fill()
          ctx.strokeStyle = '#FFA000'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      // 플레이어 캐릭터 렌더링 (픽셀 아트 스타일)
      const px = myCharacter.x * scaleX
      const py = myCharacter.y * scaleY

      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.strokeStyle = '#FF6B6B'
      ctx.lineWidth = 2
      ctx.stroke()

      requestAnimationFrame(render)
    }

    render()
  }, [myCharacter, characters, buildings])

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    const scaleX = MAP_SIZE.width / MINIMAP_SIZE.width
    const scaleY = MAP_SIZE.height / MINIMAP_SIZE.height

    const mapX = x * scaleX
    const mapY = y * scaleY

    onClick(mapX, mapY)
  }

  return (
    <div className="minimap">
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE.width}
        height={MINIMAP_SIZE.height}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        style={{
          border: '3px solid #ffffff',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.5)',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  )
}

MiniMap.propTypes = {
  myCharacter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    isAi: PropTypes.bool.isRequired
  }).isRequired,
  characters: PropTypes.object.isRequired,
  buildings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired,
  onClick: PropTypes.func.isRequired
}

export default MiniMap