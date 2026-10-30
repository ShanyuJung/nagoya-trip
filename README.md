# 名古屋旅程

以 [`ShanyuJung/okinawa-map`](https://github.com/ShanyuJung/okinawa-map) 的互動地圖體驗與技術架構為參考，整理 11/7–11/14 名古屋、伊勢、鳥羽、大阪與奈良的八日旅程。

## 功能

- 依美食、景點、住宿與活動分類篩選
- 依日期、地區與行程狀態標籤篩選
- 搜尋名稱、地區、日期或標籤
- 點選卡片或地圖標記聚焦地點
- 連結至 Google Maps、Tabelog 與住宿頁面
- 八日跨城市行程地圖
- 桌面與行動裝置響應式版面

## 資料

旅遊地點與連結整理自公開的 [Notion「行程安排」資料庫](https://rainbow-gosling-80b.notion.site/356ecbe18409811d9345f09574f50886?v=356ecbe184098177a50b000ce8034dd8)；相同住宿的跨日紀錄在地圖中合併呈現。

## 開始使用

```bash
npm install
npm run dev
```

## 常用指令

- `npm run dev`：啟動本機開發伺服器
- `npm run build`：建立正式版本
- `npm run preview`：預覽正式版本
- `npm run lint`：執行 ESLint
- `npm run format`：使用 Prettier 格式化程式碼
- `npm run format:check`：檢查程式碼格式

提交前檢查與 Conventional Commits 規範請參考 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 主要結構

- `src/App.tsx`：搜尋、篩選、卡片與旅程資訊
- `src/journey-map.tsx`：Leaflet 互動地圖
- `src/data/places.ts`：Notion 旅遊資料
- `app/globals.css`：全域與響應式樣式
