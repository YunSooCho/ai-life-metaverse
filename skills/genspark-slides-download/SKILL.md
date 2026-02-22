---
name: genspark-slides-download
description: Genspark.ai에서 이미 생성된 슬라이드 완료 후 PDF 자동 다운로드
---

# Genspark 슬라이드 PDF 다운로드 (v5.0 - 2026-02-08)

## 🧙 전제 조건

- **브라우저**: `openclaw` 프로필 (CDP 포트 18800)
- ✅ 로그인 상태

---

## [Step 1] 브라우저 시작

```
browser action=start profile=openclaw
```

---

## [Step 2] Genspark 접속

```
browser action=navigate targetUrl="https://www.genspark.ai/"
```

---

## [Step 3] 사이드메뉴 열기 + 첫 번째 링크 ID 취득

사이드메뉴 토글 버튼을 JavaScript로 클릭해서 "작업 목록"을 표시.

```
browser action=act request={"kind":"evaluate","fn":"function(){var el=document.querySelector('div.index-layout-content div.header svg');if(el){el.dispatchEvent(new MouseEvent('click',{bubbles:true}));return 'clicked';}return 'not found';}"}
```

사이드메뉴가 열리면 스냅샷을 찍어서 "작업 목록" 밑 첫 번째 링크의 ID를 취득.

```
browser action=snapshot (compact=true)
```

첫 번째 링크 URL 형식: `/agents?id=<PROJECT_ID>`
→ `<PROJECT_ID>` 부분을 취득

---

## [Step 4] 첫 번째 링크 클릭 → 슬라이드 페이지로 이동

먼저 첫 번째 링크를 클릭해서 agents 페이지로 이동한 후,
슬라이드 페이지로 navigate.

```
browser action=act request={"kind":"click","ref":"<첫번째_링크_ref>"}
```

5초 대기 후:

```
browser action=navigate targetUrl="https://www.genspark.ai/slides?project_id=<PROJECT_ID>&pdf"
```

⚠️ **중요:** 메인 페이지에서 직접 `/slides?project_id=...` URL로 navigate하면 리다이렉트됨.
반드시 먼저 agents 링크를 클릭한 후에 슬라이드 URL로 이동할 것.

---

## [Step 5] 내보내기 버튼 클릭

5초 대기 후 스냅샷을 찍어서 "내보내기" 버튼을 찾고 클릭.

```
browser action=snapshot
browser action=act request={"kind":"click","ref":"<내보내기_ref>"}
```

---

## [Step 6] 팝업에서 내보내기 클릭

내보내기 형식 선택 팝업이 나옴 (PDF/PPTX/Google Slides).
PDF가 기본 선택됨. "내보내기" 버튼 클릭.

```
browser action=snapshot
browser action=act request={"kind":"click","ref":"<팝업_내보내기_ref>"}
```

---

## [Step 7] Export Successful 팝업에서 Download 클릭

"내보내는 중..." → "Export Successful" 팝업이 나올 때까지 대기.
15초 대기 후 스냅샷. 아직 "내보내는 중..."이면 15초 더 대기.

```
browser action=act request={"kind":"wait","timeMs":15000}
browser action=snapshot
```

"Export Successful" 확인 후 "Download" 버튼 클릭.

```
browser action=act request={"kind":"click","ref":"<Download_ref>"}
```

---

## [Step 8] 다운로드 확인

5초 대기 후 확인.

```bash
ls -lt ~/Downloads/ | head -n 5
```

---

## [Step 9] 텔레그램 전송 (옵션)

```
message action=send media="~/Downloads/<파일>.pdf" to="8129283040"
```

---

## [Step 10] 브라우저 종료

```
browser action=stop
```
