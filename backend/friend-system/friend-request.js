/**
 * Friend Request Manager
 * 친구 요청 시스템
 */

class FriendRequestManager {
  constructor(redisClient) {
    this.redisClient = redisClient;
    this.REQUEST_KEY = 'friend_requests';
    this.REQUEST_TTL = 24 * 60 * 60; // 24시간
  }

  /**
   * 캐릭터의 수신한 요청 목록 가져오기
   */
  async getReceivedRequests(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryRequests) {
          this._memoryRequests = {};
        }
        return this._memoryRequests[characterId]?.received || [];
      }

      const key = `${this.REQUEST_KEY}:${characterId}:received`;
      const requests = await this.redisClient.get(key);
      return requests ? JSON.parse(requests) : [];
    } catch (error) {
      console.error('getReceivedRequests error:', error);
      return [];
    }
  }

  /**
   * 캐릭터의 보낸 요청 목록 가져오기
   */
  async getSentRequests(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryRequests) {
          this._memoryRequests = {};
        }
        return this._memoryRequests[characterId]?.sent || [];
      }

      const key = `${this.REQUEST_KEY}:${characterId}:sent`;
      const requests = await this.redisClient.get(key);
      return requests ? JSON.parse(requests) : [];
    } catch (error) {
      console.error('getSentRequests error:', error);
      return [];
    }
  }

  /**
   * 친구 요청 전송
   */
  async sendRequest(fromId, fromName, toId, toName = 'Unknown') {
    try {
      // 이미 친구인지 확인은 외부에서 처리
      // 자기 자신에게 요청 금지
      if (fromId === toId) {
        return { success: false, message: 'Cannot send request to yourself' };
      }

      const request = {
        id: `req_${Date.now()}_${fromId}_${toId}`,
        from: { id: fromId, name: fromName },
        to: { id: toId, name: toName },
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // 보낸 요청에 추가
      const sentRequests = await this.getSentRequests(fromId);
      const pendingRequest = sentRequests.find(
        r => r.to.id === toId && r.status === 'pending'
      );

      if (pendingRequest) {
        return { success: false, message: 'Request already sent' };
      }

      sentRequests.push(request);

      // 수신한 요청에 추가
      const receivedRequests = await this.getReceivedRequests(toId);
      receivedRequests.push(request);

      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryRequests) {
          this._memoryRequests = {};
        }
        if (!this._memoryRequests[fromId]) {
          this._memoryRequests[fromId] = { received: [], sent: [] };
        }
        if (!this._memoryRequests[toId]) {
          this._memoryRequests[toId] = { received: [], sent: [] };
        }
        this._memoryRequests[fromId].sent = sentRequests;
        this._memoryRequests[toId].received = receivedRequests;
        return { success: true, request };
      }

      const sentKey = `${this.REQUEST_KEY}:${fromId}:sent`;
      await this.redisClient.setex(
        sentKey,
        this.REQUEST_TTL,
        JSON.stringify(sentRequests)
      );

      const receivedKey = `${this.REQUEST_KEY}:${toId}:received`;
      await this.redisClient.setex(
        receivedKey,
        this.REQUEST_TTL,
        JSON.stringify(receivedRequests)
      );

      return { success: true, request };
    } catch (error) {
      console.error('sendRequest error:', error);
      return { success: false, message: 'Failed to send request' };
    }
  }

  /**
   * 친구 요청 수락
   */
  async acceptRequest(fromId, toId) {
    try {
      const receivedRequests = await this.getReceivedRequests(toId);

      const requestIndex = receivedRequests.findIndex(
        r => r.from.id === fromId && r.status === 'pending'
      );

      if (requestIndex === -1) {
        return { success: false, message: 'Request not found' };
      }

      const request = receivedRequests[requestIndex];
      request.status = 'accepted';
      request.respondedAt = new Date().toISOString();

      const sentRequests = await this.getSentRequests(fromId);
      const sentRequestIndex = sentRequests.findIndex(
        r => r.to.id === toId && r.status === 'pending'
      );

      if (sentRequestIndex !== -1) {
        sentRequests[sentRequestIndex].status = 'accepted';
        sentRequests[sentRequestIndex].respondedAt = request.respondedAt;
      }

      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryRequests) {
          this._memoryRequests = {};
        }
        if (!this._memoryRequests[fromId]) {
          this._memoryRequests[fromId] = { received: [], sent: [] };
        }
        if (!this._memoryRequests[toId]) {
          this._memoryRequests[toId] = { received: [], sent: [] };
        }
        this._memoryRequests[toId].received = receivedRequests;
        this._memoryRequests[fromId].sent = sentRequests;
        return { success: true, request };
      }

      const receivedKey = `${this.REQUEST_KEY}:${toId}:received`;
      await this.redisClient.setex(
        receivedKey,
        this.REQUEST_TTL,
        JSON.stringify(receivedRequests)
      );

      const sentKey = `${this.REQUEST_KEY}:${fromId}:sent`;
      await this.redisClient.setex(
        sentKey,
        this.REQUEST_TTL,
        JSON.stringify(sentRequests)
      );

      return { success: true, request };
    } catch (error) {
      console.error('acceptRequest error:', error);
      return { success: false, message: 'Failed to accept request' };
    }
  }

  /**
   * 친구 요청 거절
   */
  async rejectRequest(fromId, toId) {
    try {
      const receivedRequests = await this.getReceivedRequests(toId);

      const requestIndex = receivedRequests.findIndex(
        r => r.from.id === fromId && r.status === 'pending'
      );

      if (requestIndex === -1) {
        return { success: false, message: 'Request not found' };
      }

      const request = receivedRequests[requestIndex];
      request.status = 'rejected';
      request.respondedAt = new Date().toISOString();

      const sentRequests = await this.getSentRequests(fromId);
      const sentRequestIndex = sentRequests.findIndex(
        r => r.to.id === toId && r.status === 'pending'
      );

      if (sentRequestIndex !== -1) {
        sentRequests[sentRequestIndex].status = 'rejected';
        sentRequests[sentRequestIndex].respondedAt = request.respondedAt;
      }

      if (!this.redisClient) {
        // Memory mode
        if (!this._memoryRequests) {
          this._memoryRequests = {};
        }
        if (!this._memoryRequests[fromId]) {
          this._memoryRequests[fromId] = { received: [], sent: [] };
        }
        if (!this._memoryRequests[toId]) {
          this._memoryRequests[toId] = { received: [], sent: [] };
        }
        this._memoryRequests[toId].received = receivedRequests;
        this._memoryRequests[fromId].sent = sentRequests;
        return { success: true, request };
      }

      const receivedKey = `${this.REQUEST_KEY}:${toId}:received`;
      await this.redisClient.setex(
        receivedKey,
        this.REQUEST_TTL,
        JSON.stringify(receivedRequests)
      );

      const sentKey = `${this.REQUEST_KEY}:${fromId}:sent`;
      await this.redisClient.setex(
        sentKey,
        this.REQUEST_TTL,
        JSON.stringify(sentRequests)
      );

      return { success: true, request };
    } catch (error) {
      console.error('rejectRequest error:', error);
      return { success: false, message: 'Failed to reject request' };
    }
  }

  /**
   * 대기 중인 요청 수 가져오기
   */
  async getPendingRequestCount(characterId) {
    try {
      const receivedRequests = await this.getReceivedRequests(characterId);
      return receivedRequests.filter(r => r.status === 'pending').length;
    } catch (error) {
      console.error('getPendingRequestCount error:', error);
      return 0;
    }
  }

  /**
   * 특정 요청 찾기
   */
  async findRequest(fromId, toId) {
    try {
      const sentRequests = await this.getSentRequests(fromId);
      const request = sentRequests.find(
        r => r.to.id === toId && r.status === 'pending'
      );
      return request || null;
    } catch (error) {
      console.error('findRequest error:', error);
      return null;
    }
  }

  /**
   * 캐릭터의 모든 요청 데이터 삭제
   */
  async clearRequestData(characterId) {
    try {
      if (!this.redisClient) {
        // Memory mode
        if (this._memoryRequests) {
          delete this._memoryRequests[characterId];
        }
        return { success: true };
      }

      const receivedKey = `${this.REQUEST_KEY}:${characterId}:received`;
      const sentKey = `${this.REQUEST_KEY}:${characterId}:sent`;

      await this.redisClient.del(receivedKey);
      await this.redisClient.del(sentKey);

      return { success: true };
    } catch (error) {
      console.error('clearRequestData error:', error);
      return { success: false };
    }
  }

  /**
   * 메모리 모드 데이터 접근자 (테스트용)
   */
  _getMemoryData() {
    return this._memoryRequests || {};
  }
}

export default FriendRequestManager;