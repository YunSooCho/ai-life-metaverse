import React, { useState, useEffect } from 'react';
import './Guild.css';

function Guild({ characterId, characterName }) {
  const [guilds, setGuilds] = useState([]);
  const [myGuild, setMyGuild] = useState(null);
  const [guildMembers, setGuildMembers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'info', 'chat', 'create'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDescription, setNewGuildDescription] = useState('');

  // 길드 목록 로드
  const loadGuilds = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/guilds');
      const data = await response.json();
      setGuilds(data);
    } catch (error) {
      console.error('길드 목록 로드 실패:', error);
    }
  };

  // 내 길드 정보 로드 (characterId로)
  const loadMyGuild = async () => {
    if (!characterId) return;

    try {
      const response = await fetch('http://localhost:4000/api/guilds');
      const allGuilds = await response.json();

      // 내 길드 찾기
      const myGuild = allGuilds.find(guild =>
        guild.members.some(member => member.id === characterId)
      );

      if (myGuild) {
        setMyGuild(myGuild);
        setGuildMembers(myGuild.members);
        loadGuildChat(myGuild.id);
      }
    } catch (error) {
      console.error('내 길드 정보 로드 실패:', error);
    }
  };

  // 길드 채팅 로드
  const loadGuildChat = async (guildId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/guild-chat/${guildId}`);
      const messages = await response.json();
      setChatMessages(messages);
    } catch (error) {
      console.error('길드 채팅 로드 실패:', error);
    }
  };

  // 길드 생성
  const createGuild = async (e) => {
    e.preventDefault();
    if (!newGuildName.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGuildName,
          description: newGuildDescription,
          leaderId: characterId,
          leaderName: characterName,
        }),
      });

      if (response.ok) {
        const newGuild = await response.json();
        alert('길드가 생성되었습니다!');
        setShowCreateForm(false);
        setNewGuildName('');
        setNewGuildDescription('');
        loadGuilds();
      } else {
        const error = await response.json();
        alert(error.error || '길드 생성 실패');
      }
    } catch (error) {
      console.error('길드 생성 실패:', error);
      alert('길드 생성 실패');
    }
  };

  // 길드 가입
  const joinGuild = async (guildId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/guilds/${guildId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: characterId,
          playerName: characterName,
        }),
      });

      if (response.ok) {
        alert('길드에 가입했습니다!');
        loadMyGuild();
        loadGuilds();
      } else {
        const error = await response.json();
        alert(error.error || '길드 가입 실패');
      }
    } catch (error) {
      console.error('길드 가입 실패:', error);
      alert('길드 가입 실패');
    }
  };

  // 길드 탈퇴
  const leaveGuild = async () => {
    if (!myGuild) return;

    try {
      const response = await fetch(`http://localhost:4000/api/guilds/${myGuild.id}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: characterId,
        }),
      });

      if (response.ok) {
        alert('길드에서 탈퇴했습니다.');
        setMyGuild(null);
        setGuildMembers([]);
        setChatMessages([]);
        loadGuilds();
      } else {
        const error = await response.json();
        alert(error.error || '길드 탈퇴 실패');
      }
    } catch (error) {
      console.error('길드 탈퇴 실패:', error);
      alert('길드 탈퇴 실패');
    }
  };

  // 길드 채팅 전송
  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !myGuild) return;

    try {
      const myMember = myGuild.members.find(m => m.id === characterId);
      const response = await fetch('http://localhost:4000/api/guild-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: myGuild.id,
          senderId: characterId,
          senderName: characterName,
          senderRole: myMember?.role || 'member',
          content: messageInput,
          type: 'normal',
        }),
      });

      if (response.ok) {
        setMessageInput('');
        loadGuildChat(myGuild.id);
      }
    } catch (error) {
      console.error('채팅 전송 실패:', error);
    }
  };

  useEffect(() => {
    loadGuilds();
    loadMyGuild();

    // 길드 채팅 실시간 업데이트 (3초마다)
    const chatInterval = setInterval(() => {
      if (myGuild) {
        loadGuildChat(myGuild.id);
      }
    }, 3000);

    return () => clearInterval(chatInterval);
  }, [myGuild]);

  return (
    <div className="guild-container">
      <div className="guild-header">
        <h2>🏰 길드 시스템</h2>
        {!myGuild && (
          <button className="create-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '취소' : '길드 생성'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="guild-create-form">
          <h3>새 길드 만들기</h3>
          <form onSubmit={createGuild}>
            <div className="form-group">
              <label>길드 이름:</label>
              <input
                type="text"
                value={newGuildName}
                onChange={(e) => setNewGuildName(e.target.value)}
                placeholder="길드 이름을 입력하세요"
                required
              />
            </div>
            <div className="form-group">
              <label>설명:</label>
              <textarea
                value={newGuildDescription}
                onChange={(e) => setNewGuildDescription(e.target.value)}
                placeholder="길드 설명을 입력하세요"
                rows={3}
              />
            </div>
            <button type="submit">생성</button>
          </form>
        </div>
      )}

      {myGuild ? (
        <div className="guild-detail">
          <div className="guild-info">
            <h3>{myGuild.name}</h3>
            <p className="guild-level">Lv. {myGuild.level}</p>
            <p className="guild-desc">{myGuild.description}</p>
            <p className="guild-stats">
              멤버: {myGuild.members.length}명 | 경험치: {myGuild.experience}
            </p>
            <button className="leave-btn" onClick={leaveGuild}>탈퇴</button>
          </div>

          <div className="guild-tabs">
            <button
              className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              멤버 ({guildMembers.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              채팅
            </button>
          </div>

          {activeTab === 'members' && (
            <div className="guild-members">
              <h4>길드 멤버</h4>
              <ul className="member-list">
                {guildMembers.map(member => (
                  <li key={member.id} className="member-item">
                    <span className="member-role-badge">{member.role === 'leader' ? '길드장' : member.role === 'officer' ? '임원' : '멤버'}</span>
                    <span className="member-name">{member.name}</span>
                    <span className="member-joined">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="guild-chat">
              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <p className="no-messages">아직 메시지가 없습니다.</p>
                ) : (
                  chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`chat-message ${
                        msg.senderId === characterId ? 'my-message' : ''
                      }`}
                    >
                      <span className={`message-sender role-${msg.senderRole}`}>
                        {msg.senderName}
                      </span>
                      <span className="message-content">{msg.content}</span>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <form className="chat-input" onSubmit={sendChatMessage}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                />
                <button type="submit">전송</button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="guild-list">
          <h3>길드 목록</h3>
          {guilds.length === 0 ? (
            <p className="no-guilds">가입 가능한 길드가 없습니다.</p>
          ) : (
            <ul className="guild-cards">
              {guilds.map(guild => (
                <li key={guild.id} className="guild-card">
                  <div className="card-header">
                    <h4>{guild.name}</h4>
                    <span className="guild-level-badge">Lv. {guild.level}</span>
                  </div>
                  <p className="card-desc">{guild.description}</p>
                  <p className="card-stats">
                    멤버: {guild.memberCount}명
                  </p>
                  <button className="join-btn" onClick={() => joinGuild(guild.id)}>
                    가입
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Guild;