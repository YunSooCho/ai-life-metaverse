/**
 * Sound Manager Hook
 *
 * 게임 내 사운드 관리
 * - BGM 재생/중지
 * - SFX 재생
 * - 마스터 볼륨 조절
 * - BGM 볼륨 조절
 * - SFX 볼륨 조절
 */

import { useState, useEffect } from 'react';

function useSoundManager() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [bgmVolume, setBgmVolume] = useState(0.6);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // 사운드 매니저 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.soundManager) {
      setIsInitialized(true);
    }
  }, []);

  const playBGM = (bgmName) => {
    if (!isInitialized || !window.soundManager) return;
    window.soundManager.playBGM(bgmName);
  };

  const stopBGM = () => {
    if (!isInitialized || !window.soundManager) return;
    window.soundManager.stopBGM();
  };

  const playSFX = (sfxName) => {
    if (!isInitialized || !window.soundManager) return;
    window.soundManager.playSFX(sfxName);
  };

  const setVolume = (type, volume) => {
    if (!isInitialized || !window.soundManager) return;
    window.soundManager.setVolume(type, volume);

    if (type === 'master') {
      setMasterVolume(volume);
    } else if (type === 'bgm') {
      setBgmVolume(volume);
    } else if (type === 'sfx') {
      setSfxVolume(volume);
    }
  };

  const toggleMute = () => {
    if (!isInitialized || !window.soundManager) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (newMutedState) {
      window.soundManager.setVolume('master', 0);
    } else {
      window.soundManager.setVolume('master', masterVolume);
    }
  };

  return {
    isInitialized,
    masterVolume,
    bgmVolume,
    sfxVolume,
    isMuted,
    playBGM,
    stopBGM,
    playSFX,
    setVolume,
    toggleMute,
  };
}

export default useSoundManager;