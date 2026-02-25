/**
 * PresetManager - 프리셋 관리 UI 컴포넌트
 *
 * 프리셋 목록 표시, 저장/로드/삭제 기능 제공
 *
 * Created: 2026-02-24 10:45
 * PM: Genie
 */

import { useState, useEffect } from 'react'
import { socket } from '../socket'
import './PresetManager.css'

/**
 * PresetManager 컴포넌트
 *
 * @param {Object} props
 * @param {boolean} props.show - 표시 여부
 * @param {Object} props.currentCustomization - 현재 커스터마이징 설정
 * @param {Function} props.onLoadPreset - 프리셋 로드 핸들러
 * @param {Function} props.onClose - 닫기 핸들러
 */
function PresetManager({ show, currentCustomization, onLoadPreset, onClose }) {
  const [presets, setPresets] = useState([])
  const [showNewPreset, setShowNewPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [message, setMessage] = useState('')

  // 프리셋 목록 로드
  useEffect(() => {
    if (show) {
      loadPresets()
    }
  }, [show])

  // 프리셋 목록 로드 함수
  const loadPresets = () => {
    if (socket) {
      socket.emit('getCustomizationPresets')
      socket.on('customizationPresets', (data) => {
        setPresets(data.presets || [])
        socket.off('customizationPresets')
      })
    }
  }

  // 새 프리셋 저장
  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      setMessage('⚠️ 프리셋 이름을 입력하세요')
      return
    }

    if (socket) {
      socket.emit('saveCustomizationPreset', {
        name: newPresetName,
        customization: currentCustomization
      })

      socket.on('presetSaved', (data) => {
        if (data.success) {
          setMessage(`✅ 프리셋 "${newPresetName}" 저장 완료`)
          setNewPresetName('')
          setShowNewPreset(false)
          loadPresets()
        } else {
          setMessage(`⚠️ ${data.message}`)
        }
        socket.off('presetSaved')
      })
    }
  }

  // 프리셋 로드
  const handleLoadPreset = (preset) => {
    if (onLoadPreset) {
      onLoadPreset(preset.customization)
      setMessage(`✅ 프리셋 "${preset.name}" 로드 완료`)
    }
  }

  // 프리셋 삭제
  const handleDeletePreset = (presetId) => {
    if (window.confirm('이 프리셋을 삭제하시겠습니까?')) {
      if (socket) {
        socket.emit('deleteCustomizationPreset', { presetId })

        socket.on('presetDeleted', (data) => {
          if (data.success) {
            setMessage('✅ 프리셋 삭제 완료')
            loadPresets()
          } else {
            setMessage(`⚠️ ${data.message}`)
          }
          socket.off('presetDeleted')
        })
      }
    }
  }

  // 메시지 초기화
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!show) {
    return null
  }

  return (
    <div className="preset-manager-overlay pixel-overlay">
      <div className="preset-manager pixel-panel">
        {/* Header */}
        <div className="preset-manager-header">
          <h2>💾 프리셋 관리</h2>
          <button className="pixel-button pixel-button-red" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="preset-manager-message">
            {message}
          </div>
        )}

        {/* New Preset Form */}
        {showNewPreset ? (
          <div className="preset-manager-new">
            <h3>🆕 새 프리셋</h3>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="프리셋 이름..."
              className="pixel-input"
              maxLength={50}
            />
            <div className="preset-manager-new-actions">
              <button
                className="pixel-button pixel-button-green"
                onClick={handleSavePreset}
              >
                저장
              </button>
              <button
                className="pixel-button pixel-button-red"
                onClick={() => {
                  setShowNewPreset(false)
                  setNewPresetName('')
                }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            className="pixel-button pixel-button-green preset-manager-new-btn"
            onClick={() => setShowNewPreset(true)}
          >
            ➕ 프리셋 저장
          </button>
        )}

        {/* Preset List */}
        <div className="preset-manager-list">
          <h3>📋 프리셋 목록 ({presets.length})</h3>
          {presets.length === 0 ? (
            <div className="preset-manager-empty">
              저장된 프리셋이 없습니다
            </div>
          ) : (
            <div className="preset-manager-items">
              {presets.map((preset) => (
                <div key={preset.id} className="preset-manager-item">
                  <div className="preset-manager-item-info">
                    <div className="preset-manager-item-name">
                      {preset.name}
                    </div>
                    <div className="preset-manager-item-date">
                      {new Date(preset.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="preset-manager-item-preview">
                    {preset.customization.hairStyle && (
                      <span>{preset.customization.hairStyle}</span>
                    )}
                    {preset.customization.accessory && preset.customization.accessory !== 'none' && (
                      <span> {preset.customization.accessory}</span>
                    )}
                  </div>
                  <div className="preset-manager-item-actions">
                    <button
                      className="pixel-button pixel-button-blue pixel-button-sm"
                      onClick={() => handleLoadPreset(preset)}
                      title="로드"
                    >
                      📥
                    </button>
                    <button
                      className="pixel-button pixel-button-red pixel-button-sm"
                      onClick={() => handleDeletePreset(preset.id)}
                      title="삭제"
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
  )
}

export default PresetManager