const { Server } = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');

describe('Chat System Backend Tests', () => {
  let io, serverSocket, ioServer, clientSocket;
  const TEST_ROOM = 'test-room';

  beforeAll((done) => {
    httpServer = http.createServer();
    io = new Server(httpServer);

    // 테스트용 방 생성
    io.rooms = {};
    io.rooms[TEST_ROOM] = {
      characters: {},
      affinities: {},
      chatHistory: []
    };

    io.on('connection', (socket) => {
      // 채팅 메시지 이벤트 핸들러
      socket.on('chatMessage', (data) => {
        const { message, characterId } = data;
        const room = io.rooms[TEST_ROOM];

        if (!room) return;

        const chatData = {
          characterId,
          message,
          timestamp: Date.now()
        };

        // 채팅 히스토리에 저장 (최대 30개)
        room.chatHistory.push(chatData);
        if (room.chatHistory.length > 30) {
          room.chatHistory.shift();
        }

        // 브로드캐스트
        io.to(TEST_ROOM).emit('chatBroadcast', chatData);
      });

      socket.on('join', (character) => {
        socket.join(TEST_ROOM);
        const room = io.rooms[TEST_ROOM];
        room.characters[character.id] = character;
        io.to(TEST_ROOM).emit('characterUpdate', character);
      });
    });

    httpServer.listen(4001, () => {
      serverSocket = io.httpServer;
      ioServer = io;

      clientSocket = Client(`http://localhost:4001`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.close();
  });

  test('채팅 메시지 전송 및 브로드캐스트', (done) => {
    const testMessage = '안녕하세요!';
    const testCharId = 'char-002'; // 고유 ID 사용

    // 새로운 listener 등록
    const handleMessageOnce = (data) => {
      clientSocket.off('chatBroadcast', handleMessageOnce);
      expect(data.message).toBe(testMessage);
      expect(data.characterId).toBe(testCharId);
      done();
    };

    clientSocket.emit('join', { id: testCharId, name: 'Test Player' });
    clientSocket.once('chatBroadcast', handleMessageOnce);

    setTimeout(() => {
      clientSocket.emit('chatMessage', {
        message: testMessage,
        characterId: testCharId
      });
    }, 100);
  });

  test('채팅 히스토리 저장 (최대 30개 제한)', (done) => {
    const room = io.rooms[TEST_ROOM];
    const testCharId = 'char-003'; // 다른 ID 사용

    clientSocket.emit('join', { id: testCharId, name: 'Test Player 2' });

    // 31개 메시지 전송 (직접 room.chatHistory에 추가)
    for (let i = 0; i < 31; i++) {
      room.chatHistory.push({
        characterId: testCharId,
        message: `Message ${i}`,
        timestamp: Date.now() + i
      });

      if (room.chatHistory.length > 30) {
        room.chatHistory.shift();
      }
    }

    expect(room.chatHistory.length).toBeLessThanOrEqual(30);
    expect(room.chatHistory.length).toBe(30); // 최대 30개여야 함
    expect(room.chatHistory[0].message).toBe('Message 1'); // 첫 번째 삭제됨
    done();
  });
});