---
name: genspark-slides-download
description: Genspark.ai에서 이미 생성된 슬라이드 완료 후 PDF 자동 다운로드
---

# 🎯 Genspark 슬라이드 PDF 다운로드 (v2.0 - 2026-02-08)

## 📝 교훈 (2026-02-08)

| 교훈 | 설명 |
|------|------|
| ❌ `? calming` | ✅ `/agents?id=` 사용! HTML에서도 이 형식! |
| 🌐: `outerHTML` | ✅ `document.documentElement.outerHTML` 사용! |
| `matches[0]` ✅ | 첫 번째 ID = 최신 프로젝트 🎯 |

---

## 🧙 전제 조건

- **브라우저**: `openclaw` 프로필 (CDP 포트 18800)
- ✅ 로그인 상태

---

## [Step 1] 🛠️ 브라우저 시작

```bash
browser action=start profile=openclaw
```

---

## [Step 2] 🌐 Genspark 접속

```bash
browser action=navigate targetUrl="https://www.genspark.ai/"
```

---

## [Step 3] 🕸 HTML 파싱

**JavaScript Code:**

```javascript
{
  "kind": "evaluate",
  "fn": "function(){ const html = document.documentElement.outerHTML; const regex = /agents\\?id=([a-f0-9-]{36})/gi; const matches=[]; let m; while((m = regex.exec(html)) !== null){matches.push(m[1]);} return 'FOUND: '+matches.length+' IDs: ' + matches.slice(0,10).join(', ');}"
}
```

**🎯 `matches[0]` = 최신 프로젝트 ID!**

---

## [Step 4] 📄 PDF 다운로드

```bash
browser action=navigate targetUrl="https://www.genspark.ai/slides?project_id=<PROJECT_ID>;&amp;pdf"
```

---

## [Step 5] 🎯 다운로드 확인

```bash
ls -lt ~/Downloads/ | head -n 10
```

---

## [Step 6] 📱 텔레그램 전송

```bash
message action=send media="~/Downloads/&lt;파일명&gt;.pdf" to="8129283040" caption="✅ 슬라이드 PDF 다운로드 완료!"
```

---

## [Step 7] 🚮 브라우저 종료;

```bash
browser action=stop
```

---

## 🎯 핵심 포인트

| 항목 | 설명 |
|------|------|
| **Pattern**: `/agents?=([a-f0-9-]{36})` | ✅ 올바른 형식 |
| **Source**: `outerHTML` | ✅ 캐시 X, 실시간! |
| **Selection**: `matches[0]` | ✅ 최신 프로젝트 |

---

## ⚠️ 주의사항

- **반드시 `/` 포함**: `?id=` 스크립트에서 사용 ❌!
- **`matches[0]`만 사용**: 첫 번째 ✅, 두 번째 ❌
- **데이터 검증**: 다운로드된 파일 확인 후 전송하기 ✅
- **브라우저 리소스**: 작업 후 종료 필수 ✅

---

## 🚀 실제 실행 예시

```bash
# 1. 브라우저 시작
browser action=start profile=openclaw

# 2. 접속
browser action=navigate targetUrl="https://www.genspark.ai/"

# 3. ID 추출
browser request={"kind":"evaluate","fn":"function(){...}"}

# 4. PDF 다운로드
browser action=navigate targetUrl="https://www.genspark.ai/slides?project_id=1da2b244-1036-4b94-81aa-9a69a4c4f&pdf"

# 5. 확인
ls -lt ~/Downloads/

# 6. 전송
message action=send media="~/Downloads/슬라.pdf" to="8129283040"

# 7. 종료
browser action=stop
```

---
**✨ v2.0 완료! (2026-02-08)** 🧙