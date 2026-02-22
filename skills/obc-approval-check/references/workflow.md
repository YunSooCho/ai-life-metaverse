# OBIC UI構造と要素参照

## ログイン画面

### パスワード入力画面の構造

**ID入力ページ:**
- `textbox "ＯＢＣｉＤを入力します"` - ID入力フィールド
- `button "パスワードの入力へ"` - パスワード入力進行ボタン

**パスワード入力ページ:**
- `button "1000030"` - 入力済みID表示（確認用）
- `textbox "パスワードを入力します"` - パスワード入力フィールド
- `button "ログイン"` - ログインボタン

## タイムレコーダー（ホーム画面）

### 構造要素

```
- generic [banner]
  - generic "株式会社アセンド" -> 会社名
  - generic "マイタイムレコーダー" -> アプリ名
  - button "通知" -> 通知アイコン
  - generic "曹 閠洙" -> ユーザー名
- main [main]
  - generic
    - generic [datetime display]
      - "2026年 2月6日 (金)" -> 日付
      - "15:00:43" -> 現在時刻
    - generic [buttons]
      - button "出勤" / "退出" / "外出" / "再入"
- navigation [sidebar]
  - list [menu items]
    - button "ホーム" (ホーム)
    - button "タイムレコーダー"
    - button "勤務実績"
    - button "申請"
    - button "承認" (クリックで展開)
      |- generic "承認" (expanded)
         |- button "承認"
         |- button "閲覧"
    - button "勤怠"
    - button "ダウンロード"
    - button "スマホアプリについて"
```

## 承認画面

### メニュー展開と移動

「承認」ボタンをクリックすると、メニュー内部が展開：

```
- listitem [承認]
  - button "承認" [expanded] [active]
    - img (arrow icon)
    - generic "承認"
    - img (expand icon)
  - generic <- 展開されたサブメニュー
    - generic
      - img
      - generic "承認"
    - generic
      - button "承認" (主要リンク)
      - button "閲覧" (閲覧リンク)
```

**重要**: 最初のクリックでメニュー展開、内部の「承認」リンクを再度クリックしてページ遷移

### 承認画面の構造

```
- main
  - generic
    - generic [tab selection]
      - radio "未承認" [checked] -> 未承認タブ
      - generic "未承認" -> ラベル
      - radio "承認済"
      - generic "承認済"
    - generic [selection status]
      - "選択中（承認： 0 件／否認： 0 件）" -> 選択状態
      - button "確定" [disabled] -> 確定ボタン
    - table [approval list]
      - テーブルヘッダー
      - データ行（申請ごと）
```

### データ抽出方法

**スナップショットから抽出すべき情報:**

1. **テーブルのrowgroupを確認**
   - 各rowに申請情報が含まれている
   - cell要素内に詳細情報がある

2. **抽出すべきフィールド:**
   - 申請名（申請名）
   - 申請者名（申請者名）
   - 申請日（申請）- あれば
   - 理由（理由）- あれば

3. **「該当するデータがありません」パターン:**
   ```
   row "該当するデータがありません":
     cell "該当するデータがありません":
       generic: 該当するデータがありません
   ```
   この場合、承認待ち申請はないと判断

## URLパターン

- ログイン: `https://id.obc.jp/jdcifvwfexx2/?manuallogin=True`
- タイムレコーダー: `https://ef.obc.jp/jdcifvwfexx2/mvzse24gz9p6/mytimerecorder/`
- 承認（未承認）: `https://ef.obc.jp/jdcifvwfexx2/mvzse24gz9p6/tmapproval/` または `https://hm.obc.jp/...`
- 承認（承認済）: `https://hm.obc.jp/jdcifvwfexx2/mvzse24gz9p6/tmapproval/`

## エラーハンドリング

### ログイン失敗

"ＯＢＣｉＤ とパスワードを確認して、もう一度入力してください。" が表示された場合:
- パスワードに `?` を忘れている可能性
- IDかパスワードが間違っている可能性

### ブラウザタイムアウト

"Can't reach the OpenClaw browser control service" エラー:
- `action=stop` で終了
- `action=start` で再起動
- 再度ログインから開始

## 要素参照の注意点

1. **refは動的に変わる**: スナップショットごとにref IDが変わるため、常に直近のスナップショットからrefを取得する
2. **メニュー展開のタイミング**: 「承認」ボタンのクリックで展開されるまで待つこと
3. **テキストマッチング**: 日本語のテキストは正確に一致させようとすること（例: "承認" と "承認済" は別ボタン）