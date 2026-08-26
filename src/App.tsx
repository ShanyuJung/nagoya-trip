import { useMemo, useState, type CSSProperties } from "react";
import { JourneyMap } from "./journey-map";
import { places, type Place, type PlaceCategory } from "./data/places";

const categories = ["全部", "美食", "景點", "住宿", "活動"] as const;
type CategoryFilter = (typeof categories)[number];
type MappablePlace = Place & { position: [number, number] };

const colors: Record<PlaceCategory, string> = {
  美食: "#c94732",
  景點: "#315f63",
  住宿: "#665b7c",
  活動: "#bd762b",
};

function hasPosition(place: Place): place is MappablePlace {
  return place.position !== null;
}

export default function App() {
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    places
      .flatMap((item) => item.tags)
      .forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hant"));
  }, []);

  const visible = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return places.filter((item) => {
      if (category !== "全部" && item.category !== category) return false;
      if (activeTag && !item.tags.includes(activeTag)) return false;
      if (!keyword) return true;
      return [item.name, item.area, item.schedule, item.note, ...item.tags]
        .join(" ")
        .toLocaleLowerCase()
        .includes(keyword);
    });
  }, [activeTag, category, query]);

  const mappable = useMemo(() => visible.filter(hasPosition), [visible]);

  function reset() {
    setCategory("全部");
    setQuery("");
    setActiveTag(null);
    setSelected(null);
  }

  return (
    <main className="app-shell">
      <section className="sidebar">
        <header className="brand">
          <div className="eyebrow">
            <span>NAGOYA · ISE · TRIP MAP</span>
            <span>11.07 — 11.11</span>
          </div>
          <h1>
            名古屋
            <br />
            旅程
          </h1>
          <p>從名古屋一路走到伊勢、鳥羽與志摩。五日安排、住宿與候選餐廳，全都收進同一張地圖。</p>
          <button className="notes-button" type="button" onClick={() => setShowNotes(true)}>
            五日行程速覽 <span aria-hidden="true">＋</span>
          </button>
        </header>

        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            placeholder="搜尋名稱、地區或標籤"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
            }}
          />
          {query && (
            <button type="button" aria-label="清除搜尋" onClick={() => setQuery("")}>
              ×
            </button>
          )}
        </label>

        <div className="filters" aria-label="地點分類">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "active" : ""}
              onClick={() => {
                setCategory(item);
                setSelected(null);
              }}
            >
              {item}
              <b>
                {item === "全部"
                  ? places.length
                  : places.filter((place) => place.category === item).length}
              </b>
            </button>
          ))}
        </div>

        <div className="tag-area">
          <div className="tag-heading">
            <span>依日期與地區篩選</span>
            <button type="button" onClick={reset}>
              重置篩選
            </button>
          </div>
          <div className="tag-list">
            {tags.slice(0, 14).map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className={activeTag === tag ? "active" : ""}
                onClick={() => {
                  setActiveTag(activeTag === tag ? null : tag);
                  setSelected(null);
                }}
              >
                {tag} <b>{count}</b>
              </button>
            ))}
          </div>
        </div>

        <div className="results-line">
          <span>{String(visible.length).padStart(2, "0")} PLACES</span>
          <i />
        </div>
        <div className="place-list">
          {visible.map((item, index) => (
            <article
              key={item.id}
              className={`place-card ${selected?.id === item.id ? "selected" : ""}`}
              style={{ "--category": colors[item.category] } as CSSProperties}
              onClick={() => setSelected(item)}
            >
              <div className="card-meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{item.categoryEn}</b>
                <small>{item.area}</small>
              </div>
              <h2>{item.name}</h2>
              <div className="facts">
                <div>
                  <span>安排</span>
                  <strong>{item.schedule}</strong>
                </div>
                <div>
                  <span>地區</span>
                  <strong>{item.area}</strong>
                </div>
              </div>
              <p className="description">{item.note}</p>
              <div className="card-tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="actions">
                <a className="primary" href={item.maps} target="_blank" rel="noreferrer">
                  開啟地圖 ↗
                </a>
                {item.official && (
                  <a href={item.official} target="_blank" rel="noreferrer">
                    相關連結
                  </a>
                )}
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <div className="empty">
              <b>找不到符合條件的地點</b>
              <span>試試其他關鍵字或重置篩選。</span>
            </div>
          )}
        </div>
        <footer>資料來源 · 旅程 Notion · 出發前請再次確認最新營業資訊</footer>
      </section>

      <section className="map-panel" aria-label="名古屋與三重旅程地圖">
        <div className="map-caption">
          <i />
          <div>
            <small>{selected ? "SELECTED PLACE" : "MAPPED PLACES"}</small>
            <strong>{selected?.name ?? `${mappable.length} 個已定位地點`}</strong>
          </div>
        </div>
        <JourneyMap places={mappable} selected={selected} colors={colors} onSelect={setSelected} />
        <div className="route-note">
          <span>ROUTE</span>
          <div>
            <strong>名古屋 → 伊勢 → 鳥羽・志摩</strong>
            <small>11/7 至 11/11 · 五日旅程</small>
          </div>
        </div>
        <div className="legend">
          {(["美食", "景點", "住宿", "活動"] as PlaceCategory[]).map((item) => (
            <span key={item}>
              <i style={{ background: colors[item] }} />
              {item}
            </span>
          ))}
        </div>
      </section>

      {showNotes && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowNotes(false)}>
          <section
            className="travel-notes"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notes-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="關閉"
              onClick={() => setShowNotes(false)}
            >
              ×
            </button>
            <span>NAGOYA · ISE · 5 DAYS</span>
            <h2 id="notes-title">五天，從愛知走進三重。</h2>
            <div className="note-grid">
              <article>
                <b>DAY 01 · 11/7</b>
                <h3>抵達名古屋</h3>
                <p>入住 Domus OZONE，先熟悉市區交通與周邊動線。</p>
              </article>
              <article>
                <b>DAY 02 · 11/8</b>
                <h3>名古屋與 YOASOBI</h3>
                <p>白天從候選餐廳挑一間，晚間前往演唱會場館並預留散場時間。</p>
              </article>
              <article>
                <b>DAY 03 · 11/9</b>
                <h3>移動至伊勢</h3>
                <p>轉往三重並入住伊勢住宿；依抵達時間安排市區晚餐。</p>
              </article>
              <article>
                <b>DAY 04 · 11/10</b>
                <h3>鳥羽與志摩</h3>
                <p>鳥羽水族館、二見興玉神社或橫山展望台可依天候擇一至二處。</p>
              </article>
              <article>
                <b>DAY 05 · 11/11</b>
                <h3>伊勢神宮內宮</h3>
                <p>內宮、御蔭橫丁與赤福等周邊美食串成一條步行路線。</p>
              </article>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
