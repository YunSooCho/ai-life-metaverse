import React from 'react'
import { useI18n } from '../i18n/I18nContext'
import './LanguageSelector.css'

/**
 * 언어 선택 컴포넌트
 * 드롭다운으로 언어 변경 가능
 */
export default function LanguageSelector() {
  const { language, changeLanguage, languages } = useI18n()

  return (
    <div className="language-selector">
      <label className="language-label">🌐 언어 / Language</label>
      <select
        className="language-select"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}