import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import './FriendList.css'; // FriendList와 동일한 스타일 사용

/**
 * 친구 검색 UI 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.visible - 표시 여부
 * @param {function} props.onSendRequest - 요청 전송 콜백
 * @param {function} props.onClose - 닫기 버튼 콜백
 * @param {Object} props.socket - Socket.io 소켓 인스턴스
 * @param {string} props.characterId - 현재 캐릭터 ID
 * @param {string} props.characterName - 현재 캐릭터 이름
 */
function FriendSearch({
  visible = true,
  onSendRequest,
  onClose,
  socket,
  characterId,
  characterName
}) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  // 검색 처리
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchMessage(t('ui.friends.searchEmpty'));
      return;
    }

    setLoading(true);
    setSearched(true);
    setSearchMessage('');

    if (socket) {
      // 친구 검색 - 서버에서 처리해야 함
      // 현재는 임시 구현: 모든 캐릭터 조회 후 필터링
      socket.emit('getAllCharacters', {}, (response) => {
        setLoading(false);
        if (response.success && response.characters) {
          // 검색어로 필터링 (자신 제외)
          const filtered = response.characters.filter(char => 
            char.id !== characterId &&
            (
              char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              char.id.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
          setSearchResults(filtered);

          if (filtered.length === 0) {
            setSearchMessage(t('ui.friends.noSearchResults'));
          }
        } else {
          setSearchMessage(t('ui.friends.searchFailed'));
        }
      });
    }
  };

  // 요청 전송
  const handleSendRequest = (targetCharacter) => {
    if (socket) {
      socket.emit('sendFriendRequest', {
        fromId: characterId,
        fromName: characterName,
        toId: targetCharacter.id,
        message: '' // 나중에 메시지 입력 기능 추가
      }, (response) => {
        if (response.success) {
          // 요청 목록에서 제거
          setSearchResults(prev => prev.filter(c => c.id !== targetCharacter.id));
          if (onSendRequest) {
            onSendRequest(targetCharacter);
          }
          alert(t('ui.friends.requestSent'));
        } else {
          alert(response.message || t('ui.friends.requestFailed'));
        }
      });
    }
  };

  // Enter 키로 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!visible) return null;

  return (
    <div className="friendlist-overlay">
      <div className="friendlist-window friendsearch-window">
        {/* 헤더 */}
        <div className="friendlist-header">
          <h2 className="friendlist-title">{t('ui.friends.search')}</h2>
          <button className="pixel-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 검색창 */}
        <div className="friendsearch-input-container">
          <input
            type="text"
            className="friendsearch-input"
            placeholder={t('ui.friends.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="pixel-button search-button"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? t('ui.common.searching') : t('ui.common.search')}
          </button>
        </div>

        {/* 메시지 */}
        {searchMessage && (
          <div className="friendsearch-message">
            {searchMessage}
          </div>
        )}

        {/* 검색 결과 */}
        <div className="friendlist-content">
          {!searched ? (
            <div className="friendlist-empty">
              <p className="empty-text">
                {t('ui.friends.searchHint')}
              </p>
            </div>
          ) : loading ? (
            <div className="friendlist-loading">
              <p>{t('ui.common.loading')}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="friendlist-empty">
              <p className="empty-text">
                {searchMessage || t('ui.friends.noResults')}
              </p>
            </div>
          ) : (
            <div className="friendlist-items">
              {searchResults.map(character => (
                <div key={character.id} className="friendsearch-item">
                  {/* 캐릭터 정보 */}
                  <div className="search-character">
                    <span className="character-name">{character.name}</span>
                    <span className="character-id">ID: {character.id}</span>
                    {character.level && (
                      <span className="character-level">
                        {t('ui.common.level')}: {character.level}
                      </span>
                    )}
                  </div>

                  {/* 요청 버튼 */}
                  <div className="request-actions">
                    <button
                      className="pixel-button small send-button"
                      onClick={() => handleSendRequest(character)}
                      title={t('ui.friends.sendRequest')}
                    >
                      ➕ {t('ui.friends.add')}
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

export default FriendSearch;