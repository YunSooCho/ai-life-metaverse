const { Server } = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');

describe('Interaction System Backend Tests', () => {
  let io, serverSocket, ioServer, clientSocket;
  const TEST_ROOM = 'test-room';
  const AFFINITY_CHANGES = {
    'greet': 5,
    'chat': 3,
    'gift': 10,
    'fight': -20
  };

  beforeAll((done) => {
    httpServer = http.createServer();
    io = new Server(httpServer);

    // 테스트용 방 생성
    io.rooms = {};
    io.rooms[TEST_ROOM] = {
      characters: {},
      affinities: {},
      interactionHistory: {}
    };

    io.on('connection', (socket) => {
      socket.on('join', (character) => {
        socket.join(TEST_ROOM);
        const room = io.rooms[TEST_ROOM];
        room.characters[character.id] = character;
        io.to(TEST_ROOM).emit('characterUpdate', character);
      });

      // interact 이벤트 핸들러
      socket.on('interact', (data) => {
        const { targetCharacterId, sourceCharacterId } = data;
        const room = io.rooms[TEST_ROOM];

        if (!room || !room.characters[targetCharacterId]) {
          return;
        }

        // 호감도 업데이트 (기본: greet)
        const interactionType = data.interactionType || 'greet';
        const affinityChange = AFFINITY_CHANGES[interactionType] || 0;

        if (!room.affinities[targetCharacterId]) {
          room.affinities[targetCharacterId] = {};
        }

        room.affinities[targetCharacterId][sourceCharacterId] =
          (room.affinities[targetCharacterId][sourceCharacterId] || 0) + affinityChange;

        // 브로드캐스트
        io.to(TEST_ROOM).emit('affinities', room.affinities);
        io.to(TEST_ROOM).emit('characterInteractionBroadcast', {
          fromCharacterId: sourceCharacterId,
          toCharacterId: targetCharacterId,
          interactionType,
          affinity: room.affinities[targetCharacterId][sourceCharacterId],
          fromCharacterName: room.characters[sourceCharacterId]?.name || 'Unknown',
          toCharacterName: room.characters[targetCharacterId]?.name || 'Unknown',
          timestamp: Date.now()
        });
      });
    });

    httpServer.listen(4002, () => {
      serverSocket = io.httpServer;
      ioServer = io;

      clientSocket = Client(`http://localhost:4002`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.close();
  });

  test('interact 이벤트 - 호감도 +5 업데이트', (done) => {
    const room = io.rooms[TEST_ROOM];
    const targetId = 'npc-001';
    const sourceId = 'player-001';

    // 캐릭터 등록
    clientSocket.emit('join', { id: targetId, name: 'NPC 1', isAi: true });
    clientSocket.emit('join', { id: sourceId, name: 'Player', isAi: false });

    setTimeout(() => {
      // interact 이벤트 발송
      clientSocket.emit('interact', {
        targetCharacterId: targetId,
        sourceCharacterId: sourceId,
        interactionType: 'greet'
      });

      // affinities 브로드캐스트 확인
      clientSocket.once('affinities', (data) => {
        const affinity = data[targetId]?.[sourceId];
        expect(affinity).toBe(5); // greet: +5
        done();
      });
    }, 50);
  });

  test('interact 이벤트 - 여러 작업 누적', (done) => {
    const room = io.rooms[TEST_ROOM];
    const targetId = 'npc-002';
    const sourceId = 'player-002';

    clientSocket.emit('join', { id: targetId, name: 'NPC 2', isAi: true });
    clientSocket.emit('join', { id: sourceId, name: 'Player 2', isAi: false });

    let callCount = 0;

    clientSocket.on('affinities', (data) => {
      callCount++;

      if (callCount === 1) {
        expect(data[targetId]?.[sourceId]).toBe(5); // 첫 interact: +5

        setTimeout(() => {
          clientSocket.emit('interact', {
            targetCharacterId: targetId,
            sourceCharacterId: sourceId,
            interactionType: 'chat' // +3
          });
        }, 50);
      }

      if (callCount === 2) {
        expect(data[targetId]?.[sourceId]).toBe(8); // 두 번째 interact: 5 + 3 = 8
        done();
      }
    });

    setTimeout(() => {
      clientSocket.emit('interact', {
        targetCharacterId: targetId,
        sourceCharacterId: sourceId,
        interactionType: 'greet'
      });
    }, 50);
  });
});