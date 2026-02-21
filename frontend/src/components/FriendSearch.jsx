import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import './FriendList.css'; // FriendList와 동일한 스타일 사용

/**
 * 친구 검색 UI 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.visible - 표시 여부
 * @param {function} props.onSearch - 검색 콜백 (keyword) => void
 * @param {function} props.onSelect - 친구 선택 콜백 (character) => void
 * @param {function} props.onClose - 닫기 버튼 콜백
 * @param {Object} props.socket - Socket.io 소켓 인스턴스
 * @param {string} props.characterId - 현재 캐릭터 ID
 */
function FriendSearch({
  visible = true,
  onSearch,
  onSelect,
  onClose,
  socket,
  characterId
}) {
  const { t } = useI18n();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();

    if (!keyword.trim()) {
      setMessage(t('ui.friends.searchPlaceholder'));
      return;
    }

    setLoading(true);
    setMessage('');

    if (socket) {
      socket.emit('searchCharacters', {
        characterId,
        keyword: keyword.trim()
      }, (response) => {
        setLoading(false);
        if (response.success && response.characters) {
          setResults(response.characters);
          if (response.characters.length === 0) {
            setMessage(t('ui.friends.noResults'));
          }
        } else {
          setMessage(response.message || t('ui.friends.noResults'));
          setResults([]);
        }
      });
    }
  };

  // 키워드 변경
  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  // 캐릭터 선택
  const handleSelect = (character) => {
    if (onSelect) {
      onSelect(character);
    }
    onClose();
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

        {/* 검색 폼 */}
        <div className="friendlist-search-form">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="pixel-input"
              placeholder={t('ui.friends.searchPlaceholder')}
              value={keyword}
              onChange={handleKeywordChange}
            />
            <button type="submit" className="pixel-button">
              {t('ui.buttons.search')}
            </button>
          </form>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div className="friendlist-message">{message}</div>
        )}

        {/* 검색 결과 목록 */}
        <div className="friendlist-content">
          {loading ? (
            <div className="friendlist-loading">
              <p>{t('ui.common.loading')}</p>
            </div>
          ) : results.length === 0 ? (
            !message && (
              <div className="friendlist-empty">
                <p className="empty-text">
                  {t('ui.friends.searchPlaceholder')}
                </p>
              </div>
            )
          ) : (
            <div className="friendlist-items">
              {results.map(character => (
                <div
                  key={character.id}
                  className="friendlist-item clickable"
                  onClick={() => handleSelect(character)}
                >
                  {/* 캐릭터 정보 */}
                  <div className="friend-info">
                    <span className="friend-name">{character.name}</span>
                    {character.level && (
                      <span className="friend-level">
                        Lv.{character.level}
                      </span>
                    )}
                  </div>

                  {/* 선택 버튼 */}
                  <div className="friend-actions">
                    <button
                      className="pixel-button small"
                      title={t('ui.buttons.select')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(character);
                      }}
                    >
                      +
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