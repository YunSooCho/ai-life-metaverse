import React from 'react';
import './DialogBox.css';

/**
 * 픽셀아트 스타일 대화창 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.speaker - 화자 이름
 * @param {string} props.text - 대화 내용
 * @param {boolean} props.visible - 표시 여부
 * @param {Array<Object>} props.choices - 선택지 [{ text: string, onSelect: function }]
 * @param {function} props.onClose - 닫기 버튼 콜백
 */
function DialogBox({ speaker = '', text = '', visible = true, choices = [], onClose }) {
  if (!visible) return null;

  return (
    <div className="dialog-box-container">
      <div className="dialog-box-pixel-border">
        {/* 화자 이름 표시 */}
        {speaker && (
          <div className="dialog-speaker">
            <span className="speaker-name">{speaker}</span>
          </div>
        )}

        {/* 대화 내용 */}
        <div className="dialog-content">
          <p className="dialog-text">{text}</p>
        </div>

        {/* 선택지 (있을 경우) */}
        {choices.length > 0 && (
          <div className="dialog-choices">
            {choices.map((choice, index) => (
              <button
                key={index}
                className="pixel-choice-button"
                onClick={choice.onSelect}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}

        {/* 닫기 버튼 */}
        {onClose && (
          <button className="pixel-close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default DialogBox;