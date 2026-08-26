import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { JourneyMap } from "./journey-map";
import { PlaceCategory, places, type Place } from "./data/places";

const categories = [
  "全部",
  PlaceCategory.Restaurant,
  PlaceCategory.Attraction,
  PlaceCategory.Shopping,
  PlaceCategory.Lodging,
  PlaceCategory.Event,
] as const;
type CategoryFilter = (typeof categories)[number];
type MappablePlace = Place & { position: [number, number] };

const colors: Record<PlaceCategory, string> = {
  [PlaceCategory.Restaurant]: "#e0a52b",
  [PlaceCategory.Attraction]: "#187f8c",
  [PlaceCategory.Shopping]: "#ee4b2b",
  [PlaceCategory.Lodging]: "#7656a8",
  [PlaceCategory.Event]: "#bd762b",
};

function hasPosition(place: Place): place is MappablePlace {
  return place.position !== null;
}

export default function App() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const updateVisibility = () => {
      const isMobile = window.matchMedia("(max-width: 820px)").matches;
      setShowScrollTop((isMobile ? window.scrollY : (sidebar?.scrollTop ?? 0)) > 500);
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    sidebar?.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
      sidebar?.removeEventListener("scroll", updateVisibility);
    };
  }, []);

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
      return [item.name, item.nameJa, item.address, item.hours, item.stay, item.note, ...item.tags]
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

  function scrollToTop() {
    const isMobile = window.matchMedia("(max-width: 820px)").matches;
    if (isMobile) window.scrollTo({ top: 0, behavior: "smooth" });
    else sidebarRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <section ref={sidebarRef} className="sidebar">
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
              className={`filter ${category === item ? "active" : ""}`}
              style={
                {
                  "--category-color": item === "全部" ? "#15221f" : colors[item],
                  "--category-contrast": item === PlaceCategory.Restaurant ? "#15221f" : "#fff",
                } as CSSProperties
              }
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

        <div className="tag-filter">
          <div className="tag-filter-heading">
            <span>依日期與地區篩選</span>
            <div className="tag-filter-actions">
              <button type="button" onClick={reset}>
                重置篩選
              </button>
            </div>
          </div>
          <div className="tag-options">
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
              style={
                {
                  "--category": colors[item.category],
                  "--category-color": colors[item.category],
                  "--category-contrast":
                    item.category === PlaceCategory.Restaurant ? "#15221f" : "#fff",
                } as CSSProperties
              }
              onClick={() => setSelected(item)}
            >
              <div className="card-topline">
                <span className="number">{String(index + 1).padStart(2, "0")}</span>
                <span className="category">{item.categoryEn}</span>
                <span className={`status ${item.verified === false ? "pending" : ""}`}>
                  <i />
                  {item.verified === false ? "營業資訊待核對" : "營業資訊已核對"}
                </span>
              </div>
              <h2>{item.name}</h2>
              <div className="place-subline">
                <p className="jp">{item.nameJa}</p>
                {item.tabelog?.rating && (
                  <span className="tabelog-meta">
                    <span className="tabelog-score">
                      <span>Tabelog</span>
                      <strong>{item.tabelog.rating.toFixed(2)}</strong>
                    </span>
                    {item.tabelog.verifiedAt && (
                      <small>{item.tabelog.verifiedAt.replace(/-/g, ".")}</small>
                    )}
                  </span>
                )}
              </div>
              <div className="facts">
                <div>
                  <span>營業時間</span>
                  <strong>{item.hours}</strong>
                </div>
                <div>
                  <span>安排建議</span>
                  <strong>{item.stay}</strong>
                </div>
              </div>
              <p className="description">{item.note}</p>
              <div className="tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="actions">
                <a className="primary" href={item.maps} target="_blank" rel="noreferrer">
                  開啟 Google Maps ↗
                </a>
                {item.official && (
                  <a className="secondary" href={item.official} target="_blank" rel="noreferrer">
                    官方資料
                  </a>
                )}
                {item.tabelog && (
                  <a className="secondary" href={item.tabelog.url} target="_blank" rel="noreferrer">
                    Tabelog
                  </a>
                )}
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <div className="empty-state">
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
        <div className="map-legend">
          {Object.values(PlaceCategory).map((item) => (
            <span key={item}>
              <i style={{ background: colors[item] }} />
              {item}
            </span>
          ))}
        </div>
      </section>
      <button
        type="button"
        className={`scroll-to-top ${showScrollTop ? "visible" : ""}`}
        aria-label="回到頁面頂端"
        onClick={scrollToTop}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 5h14M12 20V9m0 0-5 5m5-5 5 5" />
        </svg>
        <b>回到頂端</b>
      </button>
    </main>
  );
}
