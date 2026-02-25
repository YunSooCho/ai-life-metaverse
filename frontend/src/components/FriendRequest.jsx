import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import './FriendList.css'; // FriendList와 동일한 스타일 사용

/**
 * 친구 요청 UI 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.visible - 표시 여부
 * @param {Array<Object>} props.requests - 친구 요청 목록 [{ id, fromId, fromName, message, createdAt }]
 * @param {function} props.onAccept - 요청 수락 콜백
 * @param {function} props.onReject - 요청 거절 콜백
 * @param {function} props.onClose - 닫기 버튼 콜백
 * @param {Object} props.socket - Socket.io 소켓 인스턴스
 * @param {string} props.characterId - 현재 캐릭터 ID
 */
function FriendRequest({
  visible = true,
  requests = [],
  onAccept,
  onReject,
  onClose,
  socket,
  characterId
}) {
  const { t } = useI18n();
  const [requestsWithStatus, setRequestsWithStatus] = useState(requests);
  const [loading, setLoading] = useState(false);

  // 친구 요청 목록 로드
  useEffect(() => {
    if (socket && characterId && visible) {
      loadRequests();
    }
  }, [socket, characterId, visible]);

  // requests prop이 변경되면 업데이트
  useEffect(() => {
    setRequestsWithStatus(requests);
  }, [requests]);

  // 친구 요청 목록 로드
  const loadRequests = () => {
    setLoading(true);
    if (socket) {
      socket.emit('getPendingRequests', { characterId }, (response) => {
        setLoading(false);
        if (response.success && response.requests) {
          setRequestsWithStatus(response.requests);
        }
      });
    }
  };

  // 요청 수락
  const handleAccept = (request) => {
    if (socket) {
      socket.emit('acceptFriendRequest', {
        characterId,
        requestId: request.id,
        senderId: request.fromId
      }, (response) => {
        if (response.success) {
          // 요청 목록에서 제거
          setRequestsWithStatus(prev => prev.filter(r => r.id !== request.id));
          if (onAccept) {
            onAccept(request);
          }
        } else {
          alert(response.message || t('ui.friends.acceptFailed'));
        }
      });
    }
  };

  // 요청 거절
  const handleReject = (request) => {
    if (!window.confirm(`${t('ui.friends.confirmReject')} ${request.fromName}?`)) {
      return;
    }

    if (socket) {
      socket.emit('rejectFriendRequest', {
        characterId,
        requestId: request.id,
        senderId: request.fromId
      }, (response) => {
        if (response.success) {
          // 요청 목록에서 제거
          setRequestsWithStatus(prev => prev.filter(r => r.id !== request.id));
          if (onReject) {
            onReject(request);
          }
        } else {
          alert(response.message || t('ui.friends.rejectFailed'));
        }
      });
    }
  };

  if (!visible) return null;

  const requestCount = requestsWithStatus.length;

  return (
    <div className="friendlist-overlay">
      <div className="friendlist-window friendrequest-window">
        {/* 헤더 */}
        <div className="friendlist-header">
          <h2 className="friendlist-title">{t('ui.friends.requests')}</h2>
          <button className="pixel-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 요청 개수 */}
        <div className="friendlist-stats">
          <span className="friendlist-count">
            {t('ui.friends.pendingCount')}: {requestCount}
          </span>
        </div>

        {/* 요청 목록 */}
        <div className="friendlist-content">
          {loading ? (
            <div className="friendlist-loading">
              <p>{t('ui.common.loading')}</p>
            </div>
          ) : requestCount === 0 ? (
            <div className="friendlist-empty">
              <p className="empty-text">
                {t('ui.friends.noPendingRequests')}
              </p>
            </div>
          ) : (
            <div className="friendlist-items">
              {requestsWithStatus.map(request => (
                <div key={request.id} className="friendrequest-item">
                  {/* 요청자 정보 */}
                  <div className="request-info">
                    <span className="request-name">{request.fromName}</span>
                    {request.message && (
                      <span className="request-message">
                        "{request.message}"
                      </span>
                    )}
                    {request.createdAt && (
                      <span className="request-date">
                        {new Date(request.createdAt).toLocaleDateString()} {new Date(request.createdAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {/* 동작 버튼 */}
                  <div className="request-actions">
                    <button
                      className="pixel-button small accept-button"
                      onClick={() => handleAccept(request)}
                      title={t('ui.friends.accept')}
                    >
                      ✅
                    </button>
                    <button
                      className="pixel-button small reject-button"
                      onClick={() => handleReject(request)}
                      title={t('ui.friends.reject')}
                    >
                      ❌
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

export default FriendRequest;