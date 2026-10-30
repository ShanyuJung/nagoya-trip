import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Pane,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";
import type { Place, PlaceCategory } from "./data/places";

type MappablePlace = Place & { position: [number, number] };

function useOsrmRoute(places: MappablePlace[], enabled: boolean) {
  const [routeResult, setRouteResult] = useState<{
    key: string;
    points: [number, number][];
  } | null>(null);
  const routeKey = useMemo(
    () => places.map((place) => place.position.join(",")).join(";"),
    [places],
  );

  useEffect(() => {
    if (!enabled || places.length < 2) return;

    const controller = new AbortController();
    const coordinates = places
      .map((place) => `${place.position[1]},${place.position[0]}`)
      .join(";");

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error(`OSRM returned ${response.status}`);
        return response.json() as Promise<{
          routes?: { geometry?: { coordinates?: [number, number][] } }[];
        }>;
      })
      .then((data) => {
        const points = data.routes?.[0]?.geometry?.coordinates;
        if (points?.length)
          setRouteResult({
            key: routeKey,
            points: points.map(([lng, lat]) => [lat, lng]),
          });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Unable to load OSRM route", error);
      });

    return () => controller.abort();
  }, [enabled, places, routeKey]);

  return enabled && routeResult?.key === routeKey ? routeResult.points : null;
}

function MapView({ places, selected }: { places: MappablePlace[]; selected: Place | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.position) map.flyTo(selected.position, 14, { duration: 0.8 });
    else if (places.length > 1)
      map.fitBounds(
        places.map((item) => item.position),
        { padding: [52, 52] },
      );
    else if (places[0]) map.flyTo(places[0].position, 14, { duration: 0.8 });
  }, [map, places, selected]);
  return null;
}

export function JourneyMap({
  places,
  selected,
  colors,
  onSelect,
  showRoute = false,
}: {
  places: MappablePlace[];
  selected: Place | null;
  colors: Record<PlaceCategory, string>;
  onSelect: (place: Place) => void;
  showRoute?: boolean;
}) {
  const directRoute = places.map((item) => item.position);
  const osrmRoute = useOsrmRoute(places, showRoute);
  const route = osrmRoute ?? directRoute;

  return (
    <MapContainer
      center={[34.9, 136.82]}
      zoom={9}
      zoomControl={false}
      scrollWheelZoom
      className="map"
    >
      <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapView places={places} selected={selected} />
      {showRoute && route.length > 1 && (
        <Pane name="itinerary-route-lines" style={{ zIndex: 350, pointerEvents: "none" }}>
          <Polyline positions={route} pathOptions={{ color: "#fffaf1", weight: 9, opacity: 0.9 }} />
          <Polyline
            positions={route}
            pathOptions={{
              color: "#c94732",
              weight: 4,
              opacity: 0.9,
              dashArray: osrmRoute ? "" : "10 9",
            }}
          />
        </Pane>
      )}
      {places.map((item, index) => (
        <CircleMarker
          key={item.id}
          center={item.position}
          radius={selected?.id === item.id ? 15 : 10}
          eventHandlers={{ click: () => onSelect(item) }}
          pathOptions={{
            color: "#fffaf1",
            weight: 4,
            fillColor: selected?.id === item.id ? "#202c2c" : colors[item.category],
            fillOpacity: 1,
          }}
        >
          {showRoute && (
            <Tooltip permanent direction="center" className="route-order-label">
              {index + 1}
            </Tooltip>
          )}
          <Popup>
            <strong>{item.name}</strong>
            <br />
            {showRoute && <>第 {index + 1} 站 · </>}
            {item.address} · {item.stay}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
