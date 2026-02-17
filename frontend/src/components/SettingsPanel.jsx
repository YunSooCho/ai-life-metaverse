import { useState } from 'react'
import PropTypes from 'prop-types'
import soundSystem from '../utils/soundSystem'

function SettingsPanel({ onClose }) {
  const [bgmVolume, setBgmVolume] = useState(soundSystem.bgmVolume)
  const [sfxVolume, setSfxVolume] = useState(soundSystem.sfxVolume)
  const [muted, setMuted] = useState(soundSystem.muted)

  const handleBgmVolumeChange = (e) => {
    const value = parseFloat(e.target.value)
    setBgmVolume(value)
    soundSystem.setBgmVolume(value)
  }

  const handleSfxVolumeChange = (e) => {
    const value = parseFloat(e.target.value)
    setSfxVolume(value)
    soundSystem.setSfxVolume(value)
  }

  const handleMuteToggle = () => {
    const newMuted = soundSystem.toggleMute()
    setMuted(newMuted)
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ SETTINGS</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="setting-item">
            <label>
              <span className="setting-icon">🎵</span>
              <span>BGM Volume</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={bgmVolume}
              onChange={handleBgmVolumeChange}
              className="volume-slider"
              disabled={muted}
            />
            <span className="volume-value">{Math.round(bgmVolume * 100)}%</span>
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-icon">🔊</span>
              <span>SFX Volume</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              className="volume-slider"
              disabled={muted}
            />
            <span className="volume-value">{Math.round(sfxVolume * 100)}%</span>
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-icon">🔇</span>
              <span>Mute</span>
            </label>
            <button
              className={`mute-toggle ${muted ? 'active' : ''}`}
              onClick={handleMuteToggle}
            >
              {muted ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

SettingsPanel.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default SettingsPanel