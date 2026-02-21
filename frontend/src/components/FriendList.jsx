import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import './FriendList.css';

/**
 * 친구 목록 UI 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.visible - 표시 여부
 * @param {Array<Object>} props.friends - 친구 목록 [{ id, name, online }]
 * @param {function} props.onRemoveFriend - 친구 삭제 콜백
 * @param {function} props.onChat - 친구와 채팅 시작 콜백
 * @param {function} props.onClose - 닫기 버튼 콜백
 * @param {Object} props.socket - Socket.io 소켓 인스턴스
 * @param {string} props.characterId - 현재 캐릭터 ID
 */
function FriendList({
  visible = true,
  friends = [],
  onRemoveFriend,
  onChat,
  onClose,
  socket,
  characterId
}) {
  const { t } = useI18n();

  // Translation helper with namespace support
  const tc = (key) => {
    if (!key.startsWith('ui.')) {
      key = `ui.friends.${key}`;
    }
    return t(key);
  };
  const [friendsWithStatus, setFriendsWithStatus] = useState(friends);
  const [filter, setFilter] = useState('all'); // 'all', 'online', 'offline'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // 친구 목록 로드
  useEffect(() => {
    if (socket && characterId && visible) {
      loadFriends();
    }
  }, [socket, characterId, visible]);

  // friends prop이 변경되면 업데이트
  useEffect(() => {
    setFriendsWithStatus(friends);
  }, [friends]);

  // 친구 목록 로드
  const loadFriends = () => {
    setLoading(true);
    if (socket) {
      socket.emit('getFriends', { characterId }, (response) => {
        setLoading(false);
        if (response.success && response.friends) {
          setFriendsWithStatus(response.friends);
        }
      });
    }
  };

  // 친구 삭제
  const handleRemoveFriend = (friendId, friendName) => {
    if (!window.confirm(`${t('ui.friends.confirmDelete')} ${friendName}?`)) {
      return;
    }

    if (socket) {
      socket.emit('removeFriend', {
        characterId,
        friendId
      }, (response) => {
        if (response.success) {
          // 친구 목록에서 제거
          setFriendsWithStatus(prev => prev.filter(f => f.id !== friendId));
          if (onRemoveFriend) {
            onRemoveFriend(friendId);
          }
        } else {
          alert(response.message || t('ui.friends.removeFailed'));
        }
      });
    }
  };

  // 필터링된 친구 목록
  const filteredFriends = friendsWithStatus.filter(friend => {
    // 상태 필터
    if (filter === 'online' && !friend.online) return false;
    if (filter === 'offline' && friend.online) return false;

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        friend.name.toLowerCase().includes(query) ||
        friend.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // 온라인 친구 수
  const onlineCount = friendsWithStatus.filter(f => f.online).length;
  const totalCount = friendsWithStatus.length;

  if (!visible) return null;

  return (
    <div className="friendlist-overlay">
      <div className="friendlist-window">
        {/* 헤더 */}
        <div className="friendlist-header">
          <h2 className="friendlist-title">{t('ui.friends.title')}</h2>
          <button className="pixel-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 상태 요약 */}
        <div className="friendlist-stats">
          <span className="friendlist-count">
            {t('ui.friends.onlineCount')}: {onlineCount} / {totalCount}
          </span>
        </div>

        {/* 필터 탭 */}
        <div className="friendlist-filter">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('ui.friends.filterAll')}
          </button>
          <button
            className={`filter-tab ${filter === 'online' ? 'active' : ''}`}
            onClick={() => setFilter('online')}
          >
            {t('ui.friends.filterOnline')}
            <span className="filter-badge online">
              {onlineCount}
            </span>
          </button>
          <button
            className={`filter-tab ${filter === 'offline' ? 'active' : ''}`}
            onClick={() => setFilter('offline')}
          >
            {t('ui.friends.filterOffline')}
          </button>
        </div>

        {/* 검색창 */}
        <div className="friendlist-search">
          <input
            type="text"
            className="friendlist-search-input"
            placeholder={t('ui.friends.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 친구 목록 */}
        <div className="friendlist-content">
          {loading ? (
            <div className="friendlist-loading">
              <p>{t('ui.common.loading')}</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="friendlist-empty">
              <p className="empty-text">
                {searchQuery
                  ? t('ui.friends.noResults')
                  : filter === 'all'
                  ? t('ui.friends.noFriends')
                  : t('ui.friends.noFriendsInCategory')}
              </p>
            </div>
          ) : (
            <div className="friendlist-items">
              {filteredFriends.map(friend => (
                <div key={friend.id} className="friendlist-item">
                  {/* 온라인 상태 인디케이터 */}
                  <div className={`friend-status-indicator ${friend.online ? 'online' : 'offline'}`} />

                  {/* 친구 정보 */}
                  <div className="friend-info">
                    <span className="friend-name">{friend.name}</span>
                    <span className={`friend-status ${friend.online ? 'online' : 'offline'}`}>
                      {friend.online ? t('ui.friends.online') : t('ui.friends.offline')}
                    </span>
                    {friend.addedAt && (
                      <span className="friend-added">
                        {t('ui.friends.since')} {new Date(friend.addedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* 동작 버튼 */}
                  <div className="friend-actions">
                    {friend.online && onChat && (
                      <button
                        className="pixel-button small chat-button"
                        onClick={() => onChat(friend)}
                        title={t('ui.friends.chat')}
                      >
                        💬
                      </button>
                    )}
                    <button
                      className="pixel-button small remove-button"
                      onClick={() => handleRemoveFriend(friend.id, friend.name)}
                      title={t('ui.friends.remove')}
                    >
                      🗑️
                    </button>
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

export default FriendList;