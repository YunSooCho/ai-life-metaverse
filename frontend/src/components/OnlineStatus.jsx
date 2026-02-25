import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';

/**
 * 온라인 상태 표시 컴포넌트
 * 현재 온라인인 모든 유저를 표시하고 실시간 업데이트
 *
 * @param {Object} props
 * @param {boolean} props.visible - 표시 여부
 * @param {string} props.characterId - 현재 캐릭터 ID
 * @param {Object} props.socket - Socket.io 소켓 인스턴스
 * @param {function} props.onChat - 채팅 시작 콜백
 * @param {function} props.onClose - 닫기 버튼 콜백
 */
function OnlineStatus({
  visible = true,
  characterId,
  socket,
  onChat,
  onClose
}) {
  const { t } = useI18n();

  // Translation helper with namespace support
  const tc = (key) => {
    if (!key.startsWith('ui.')) {
      key = `ui.onlineStatus.${key}`;
    }
    return t(key);
  };

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'friends'
  const [friends, setFriends] = useState([]);

  // 온라인 유저 목록 로드
  useEffect(() => {
    if (socket && visible) {
      loadOnlineUsers();
      loadFriends();
    }
  }, [socket, visible]);

  // Socket 이벤트 리스너 등록
  useEffect(() => {
    if (!socket) return;

    // 유저 온라인 이벤트
    socket.on('userOnline', handleUserOnline);
    // 유저 오프라인 이벤트
    socket.on('userOffline', handleUserOffline);

    return () => {
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
    };
  }, [socket, onlineUsers]);

  const handleUserOnline = (data) => {
    console.log('User online:', data);
    // 자신은 제외
    if (data.characterId === characterId) return;

    setOnlineUsers(prev => {
      // 이미 있는지 확인
      if (prev.some(u => u.id === data.characterId)) {
        return prev;
      }
      return [...prev, {
        id: data.characterId,
        name: data.characterName,
        online: true,
        statusMessage: data.statusMessage || ''
      }];
    });
  };

  const handleUserOffline = (data) => {
    console.log('User offline:', data);
    setOnlineUsers(prev => prev.filter(u => u.id !== data.characterId));
  };

  // 온라인 유저 목록 로드
  const loadOnlineUsers = () => {
    setLoading(true);
    if (socket) {
      socket.emit('getOnlineUsers', {}, (response) => {
        setLoading(false);
        if (response.success && response.users) {
          // 자신은 제외
          const others = response.users.filter(u => u.characterId !== characterId);
          setOnlineUsers(others.map(u => ({
            id: u.characterId,
            name: u.characterName,
            online: true,
            statusMessage: u.statusMessage || ''
          })));
        }
      });
    }
  };

  // 친구 목록 로드
  const loadFriends = () => {
    if (socket && characterId) {
      socket.emit('getFriends', { characterId }, (response) => {
        if (response.success && response.friends) {
          // 친구 ID 목록 추출
          setFriends(response.friends.map(f => f.id));
        }
      });
    }
  };

  // 필터링된 유저 목록
  const filteredUsers = onlineUsers.filter(user => {
    if (filter === 'friends') {
      return friends.includes(user.id);
    }
    return true;
  });

  if (!visible) return null;

  return (
    <div className="onlinestatus-overlay">
      <div className="onlinestatus-window">
        {/* 헤더 */}
        <div className="onlinestatus-header">
          <h2 className="onlinestatus-title">{tc('title')}</h2>
          <button
            className="pixel-close-button"
            onClick={onClose}
            aria-label={tc('close')}
          >
            ✕
          </button>
        </div>

        {/* 상태 요약 */}
        <div className="onlinestatus-stats">
          <span className="onlinestatus-count">
            {tc('onlineCount')}: {onlineUsers.length}
          </span>
        </div>

        {/* 필터 탭 */}
        <div className="onlinestatus-filter">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {tc('allUsers')}
            <span className="filter-badge">
              {onlineUsers.length}
            </span>
          </button>
          <button
            className={`filter-tab ${filter === 'friends' ? 'active' : ''}`}
            onClick={() => setFilter('friends')}
          >
            {tc('friendsOnly')}
            <span className="filter-badge">
              {onlineUsers.filter(u => friends.includes(u.id)).length}
            </span>
          </button>
        </div>

        {/* 새로고침 버튼 */}
        <div className="onlinestatus-actions">
          <button
            className="pixel-button small refresh-button"
            onClick={loadOnlineUsers}
            title={tc('refresh')}
          >
            🔄 {tc('refresh')}
          </button>
        </div>

        {/* 온라인 유저 목록 */}
        <div className="onlinestatus-content">
          {loading ? (
            <div className="onlinestatus-loading">
              <p>{t('ui.common.loading')}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="onlinestatus-empty">
              <p className="empty-text">
                {filter === 'friends'
                  ? tc('noFriendsOnline')
                  : tc('noUsersOnline')}
              </p>
            </div>
          ) : (
            <div className="onlinestatus-items">
              {filteredUsers.map(user => (
                <div key={user.id} className="onlinestatus-item">
                  {/* 온라인 상태 인디케이터 */}
                  <div className={`user-status-indicator ${user.online ? 'online' : 'offline'}`} />

                  {/* 유저 정보 */}
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    {user.statusMessage && (
                      <span className="user-status-message">
                        {user.statusMessage}
                      </span>
                    )}
                    {friends.includes(user.id) && (
                      <span className="user-friend-badge">
                        {tc('friend')}
                      </span>
                    )}
                  </div>

                  {/* 동작 버튼 */}
                  <div className="user-actions">
                    {onChat && (
                      <button
                        className="pixel-button small chat-button"
                        onClick={() => onChat(user)}
                        title={tc('chat')}
                      >
                        💬
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnlineStatus;