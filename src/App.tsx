import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { JourneyMap } from "./journey-map";
import { itineraryDays } from "./data/itinerary";
import { PlaceCategory, places, type Place } from "./data/places";
import { placeImages } from "./data/place-images";

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
type PageView = "places" | "itinerary";
type TravelMode = "driving" | "transit";

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

function initialItineraryDay() {
  const today = new Date();
  if (today.getFullYear() === 2026) {
    const date = `${today.getMonth() + 1}/${today.getDate()}`;
    if (itineraryDays.some((day) => day.id === date)) return date;
  }
  return itineraryDays[0]?.id ?? "11/7";
}

function navigationUrl(from: MappablePlace, to: MappablePlace, mode: TravelMode) {
  const origin = from.position.join(",");
  const destination = to.position.join(",");
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
}

function PlaceCard({
  item,
  index,
  selected,
  onSelect,
}: {
  item: Place;
  index: number;
  selected: boolean;
  onSelect: (place: Place) => void;
}) {
  return (
    <article
      className={`place-card ${selected ? "selected" : ""}`}
      style={
        {
          "--category": colors[item.category],
          "--category-color": colors[item.category],
          "--category-contrast": item.category === PlaceCategory.Restaurant ? "#15221f" : "#fff",
        } as CSSProperties
      }
      onClick={() => onSelect(item)}
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
            {item.tabelog.verifiedAt && <small>{item.tabelog.verifiedAt.replace(/-/g, ".")}</small>}
          </span>
        )}
      </div>
      {placeImages[item.id] && (
        <figure className="place-photo">
          <img src={placeImages[item.id]} alt={`${item.name} 的 Notion 行程照片`} loading="lazy" />
        </figure>
      )}
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
  );
}

export default function App() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pageView, setPageView] = useState<PageView>("itinerary");
  const [activeDay, setActiveDay] = useState(initialItineraryDay);
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);

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
  const itineraryDay = itineraryDays.find((day) => day.id === activeDay) ?? itineraryDays[0];
  const itineraryPlaces = useMemo(() => {
    const ids = itineraryDay?.items.flatMap((item) => (item.placeId ? [item.placeId] : [])) ?? [];
    return ids
      .filter((id, index) => ids.indexOf(id) === index)
      .flatMap((id) => {
        const place = places.find((item) => item.id === id);
        return place && hasPosition(place) ? [place] : [];
      });
  }, [itineraryDay]);
  const mapPlaces = pageView === "itinerary" ? itineraryPlaces : mappable;
  const travelMode: TravelMode = ["11/10", "11/11"].includes(activeDay) ? "driving" : "transit";

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
            <span>NAGOYA · ISE · OSAKA · NARA</span>
            <span>11.07 — 11.14</span>
          </div>
          <h1>
            名古屋
            <br />
            旅程
          </h1>
          <p>從名古屋、伊勢一路走到大阪與奈良。八日安排、住宿與候選餐廳，全都收進同一張地圖。</p>
        </header>

        <nav className="view-switcher" aria-label="頁面切換">
          <button
            type="button"
            className={pageView === "itinerary" ? "active" : ""}
            onClick={() => {
              setPageView("itinerary");
              setSelected(null);
              setDetailPlace(null);
            }}
          >
            每日行程
          </button>
          <button
            type="button"
            className={pageView === "places" ? "active" : ""}
            onClick={() => {
              setPageView("places");
              setSelected(null);
              setDetailPlace(null);
            }}
          >
            地點總覽
          </button>
        </nav>

        {pageView === "places" ? (
          <>
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
                <PlaceCard
                  key={item.id}
                  item={item}
                  index={index}
                  selected={selected?.id === item.id}
                  onSelect={setSelected}
                />
              ))}
              {visible.length === 0 && (
                <div className="empty-state">
                  <b>找不到符合條件的地點</b>
                  <span>試試其他關鍵字或重置篩選。</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <section className="itinerary-view">
            <div className="itinerary-intro">
              <span>NOTION ITINERARY</span>
              <h2>每日行程表</h2>
              <p>依 Notion「第幾天」欄位同步；點選已有地點資料的行程，可在右側地圖定位。</p>
            </div>
            <div className="day-tabs" aria-label="選擇行程日期">
              {itineraryDays.map((day, index) => (
                <button
                  key={day.id}
                  type="button"
                  className={activeDay === day.id ? "active" : ""}
                  onClick={() => {
                    setActiveDay(day.id);
                    setSelected(null);
                    setDetailPlace(null);
                  }}
                >
                  <small>DAY {index + 1}</small>
                  <strong>{day.id}</strong>
                  <span>{day.items.length}</span>
                </button>
              ))}
            </div>
            <div className="itinerary-heading">
              <div>
                <span>DAY {itineraryDays.indexOf(itineraryDay) + 1}</span>
                <h3>{itineraryDay.label}</h3>
              </div>
              <b>
                {itineraryPlaces.length} 個地圖標記 ·
                {travelMode === "driving" ? " 自駕導航" : " 大眾運輸導航"}
              </b>
            </div>
            <div className="timeline">
              {itineraryDay.items.map((item, index) => {
                const place = item.placeId
                  ? places.find((candidate) => candidate.id === item.placeId)
                  : undefined;
                const mappablePlace = place && hasPosition(place) ? place : undefined;
                const nextPlace = itineraryDay.items.slice(index + 1).flatMap((nextItem) => {
                  const candidate = nextItem.placeId
                    ? places.find((placeItem) => placeItem.id === nextItem.placeId)
                    : undefined;
                  return candidate && hasPosition(candidate) ? [candidate] : [];
                })[0];
                return (
                  <article
                    key={item.id}
                    className={`itinerary-item ${place ? "mapped" : ""} ${selected?.id === place?.id ? "selected" : ""}`}
                    style={
                      {
                        "--itinerary-category": place ? colors[place.category] : "#9a9186",
                      } as CSSProperties
                    }
                    onClick={() => {
                      if (!place) return;
                      setSelected(place);
                      setDetailPlace(place);
                    }}
                  >
                    <div className="timeline-index">{String(index + 1).padStart(2, "0")}</div>
                    <div className="timeline-content">
                      {place && placeImages[place.id] && (
                        <div className="itinerary-media">
                          <img
                            className="itinerary-thumbnail"
                            src={placeImages[place.id]}
                            alt=""
                            loading="lazy"
                          />
                          {mappablePlace && nextPlace && (
                            <a
                              href={navigationUrl(mappablePlace, nextPlace, travelMode)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {travelMode === "driving" ? "自駕" : "大眾運輸"}到下一站 ↗
                            </a>
                          )}
                        </div>
                      )}
                      <span>{item.category}</span>
                      <h4>{item.title}</h4>
                      {item.description && <p>{item.description}</p>}
                      {place && (
                        <div className="itinerary-item-actions">
                          <b>查看地點卡片 ＋</b>
                        </div>
                      )}
                    </div>
                    <i aria-label={place ? "已有地圖標記" : "尚無地圖座標"} />
                  </article>
                );
              })}
            </div>
          </section>
        )}
        <footer>資料來源 · 旅程 Notion · 出發前請再次確認最新營業資訊</footer>
      </section>

      <section className="map-panel" aria-label="名古屋、三重、大阪與奈良旅程地圖">
        <div className="map-caption">
          <i />
          <div>
            <small>
              {selected
                ? "SELECTED PLACE"
                : pageView === "itinerary"
                  ? `${activeDay} ITINERARY`
                  : "MAPPED PLACES"}
            </small>
            <strong>{selected?.name ?? `${mapPlaces.length} 個已定位地點`}</strong>
          </div>
        </div>
        <JourneyMap
          places={mapPlaces}
          selected={selected}
          colors={colors}
          onSelect={setSelected}
          showRoute={pageView === "itinerary"}
        />
        <div className="route-note">
          <span>ROUTE</span>
          <div>
            <strong>
              {pageView === "itinerary" ? itineraryDay.label : "名古屋 → 伊勢・鳥羽 → 大阪 → 奈良"}
            </strong>
            <small>
              {pageView === "itinerary"
                ? `${itineraryDay.items.length} 項行程 · ${itineraryPlaces.length} 個地圖標記`
                : "11/7 至 11/14 · 八日旅程"}
            </small>
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
      {detailPlace && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setDetailPlace(null)}
        >
          <div
            className="place-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${detailPlace.name} 地點資訊`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="關閉地點資訊"
              onClick={() => setDetailPlace(null)}
            >
              ×
            </button>
            <div className="place-detail-scroll">
              <PlaceCard
                item={detailPlace}
                index={itineraryDay.items.findIndex((item) => item.placeId === detailPlace.id)}
                selected={false}
                onSelect={setSelected}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
