import PropTypes from 'prop-types'

export default function RoomMenu({
  show,
  rooms,
  currentRoom,
  onChangeRoom,
  onClose,
  onCreateRoom,
  newRoomName,
  onNewRoomNameChange
}) {
  if (!show) return null

  return (
    <>
      <div className="room-overlay" onClick={onClose} />
      <div className="room-menu">
        <div className="room-menu-header">
          <h3>🏠 방 리스트</h3>
          <button
            className="room-menu-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="room-list">
          {rooms.map(room => (
            <button
              key={room.id}
              className={`room-item ${currentRoom.id === room.id ? 'room-item-active' : ''}`}
              onClick={() => onChangeRoom(room.id)}
            >
              <span className="room-name">{room.name}</span>
              <span className="room-characters">
                {Object.keys(room.characters || {}).length}명
              </span>
            </button>
          ))}
        </div>
        <div className="room-create">
          <input
            type="text"
            className="room-input"
            placeholder="새 방 이름..."
            value={newRoomName}
            onChange={(e) => onNewRoomNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onCreateRoom()
              }
            }}
          />
          <button
            className="room-create-button"
            onClick={onCreateRoom}
          >
            ➕ 생성
          </button>
        </div>
      </div>
    </>
  )
}

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
  }).isRequired,
  onChangeRoom: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateRoom: PropTypes.func.isRequired,
  newRoomName: PropTypes.string.isRequired,
  onNewRoomNameChange: PropTypes.func.isRequired
}