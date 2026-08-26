import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, ZoomControl } from "react-leaflet";
import type { Place, PlaceCategory } from "./data/places";

type MappablePlace = Place & { position: [number, number] };

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
}: {
  places: MappablePlace[];
  selected: Place | null;
  colors: Record<PlaceCategory, string>;
  onSelect: (place: Place) => void;
}) {
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
      {places.map((item) => (
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
          <Popup>
            <strong>{item.name}</strong>
            <br />
            {item.address} · {item.stay}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
