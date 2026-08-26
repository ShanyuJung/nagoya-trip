import { places } from "../src/data/places";

type TabelogSchema = {
  name?: string;
  servesCuisine?: string;
  aggregateRating?: { ratingValue?: string; ratingCount?: string };
};

const restaurants = places.filter((place) => place.category === "餐廳" && place.tabelog);
const results = [];

for (const place of restaurants) {
  const response = await fetch(place.tabelog!.url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; nagoya-trip-data-check/1.0)" },
  });
  const html = await response.text();
  const jsonLd = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)?.[1];
  const schema = jsonLd ? (JSON.parse(jsonLd) as TabelogSchema) : null;
  results.push({
    id: place.id,
    localName: place.name,
    remoteName: schema?.name,
    localRating: place.tabelog!.rating,
    remoteRating: schema?.aggregateRating?.ratingValue
      ? Number(schema.aggregateRating.ratingValue)
      : null,
    ratingCount: schema?.aggregateRating?.ratingCount
      ? Number(schema.aggregateRating.ratingCount)
      : null,
    cuisine: schema?.servesCuisine?.split("、") ?? [],
    status: response.status,
    url: place.tabelog!.url,
  });
}

console.log(JSON.stringify(results, null, 2));
