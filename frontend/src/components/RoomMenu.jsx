import PropTypes from 'prop-types'

export default function RoomMenu({ show, rooms, currentRoom, onJoinRoom, onCreateRoom, onClose }) {
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
            const isActive = room.id === currentRoom
            const memberCount = room.members?.length || 0

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

RoomMenu.propTypes = {
  show: PropTypes.bool.isRequired,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      members: PropTypes.array
    })
  ).isRequired,
  currentRoom: PropTypes.string,
  onJoinRoom: PropTypes.func.isRequired,
  onCreateRoom: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

RoomMenu.defaultProps = {
  currentRoom: null,
  rooms: []
}