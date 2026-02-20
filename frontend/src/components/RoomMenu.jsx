import PropTypes from 'prop-types'

// JavaScript default parameters로 defaultProps 마이그레이션 (React 18 권장 사항)
// defaultProps는 폐기 예정이므로 함수 매개변수 기본값 사용

export default function RoomMenu({ 
  show, 
  rooms = [], 
  currentRoom = null, 
  onJoinRoom, 
  onCreateRoom, 
  onClose 
}) {
  if (!show) return null

  return (
    <div className="room-overlay pixel-overlay">
      <div className="room-menu pixel-panel pixel-pop">
        <div className="room-menu-header pixel-panel-header pixel-font pixel-text-lg">
          <h3>🌐 ROOMS</h3>
          <button className="room-menu-close pixel-button pixel-button-red" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="room-create pixel-panel-body">
          <input
            className="room-input pixel-input pixel-text-sm"
            type="text"
            placeholder="NEW ROOM NAME"
            id="newRoomName"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target
                if (input.value.trim()) {
                  onCreateRoom(input.value.trim())
                  input.value = ''
                }
              }
            }}
          />
          <button
            className="room-create-button pixel-button pixel-button-green pixel-text-sm"
            onClick={() => {
              const input = document.getElementById('newRoomName')
              if (input?.value.trim()) {
                onCreateRoom(input.value.trim())
                input.value = ''
              }
            }}
          >
            CREATE
          </button>
        </div>

        <div className="room-list pixel-scroll">
          {rooms.map((room) => {
            // currentRoom이 object인 경우 id 속성으로 비교
            const isActive = currentRoom ? room.id === currentRoom.id : false
            const memberCount = Object.keys(room.characters || {}).length

            return (
              <button
                key={room.id}
                className={`room-item pixel-grid-item ${isActive ? 'room-item-active pixel-badge' : ''}`}
                onClick={() => onJoinRoom(room.id)}
              >
                <span className="room-name pixel-font pixel-text-sm">{room.name}</span>
                <span className="room-characters pixel-badge pixel-badge-blue pixel-text-sm">
                  {memberCount} 👤
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// currentRoom은 object 타입 (id, name 속성 포함)
RoomMenu.propTypes = {
  show: PropTypes.bool.isRequired,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      characters: PropTypes.object
    })
  ).isRequired,
  currentRoom: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  onJoinRoom: PropTypes.func.isRequired,
  onCreateRoom: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

// defaultProps 제거 - JavaScript default parameters 사용 (React 18 호환성)