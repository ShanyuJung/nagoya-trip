import { places } from "../src/data/places";

type TabelogSchema = {
  name?: string;
  servesCuisine?: string;
  aggregateRating?: { ratingValue?: string; ratingCount?: string };
};

type FaqSchema = {
  mainEntity?: Array<{ name?: string; acceptedAnswer?: { text?: string } }>;
};

const restaurants = places.filter((place) => place.category === "餐廳" && place.tabelog);
const results = [];

for (const place of restaurants) {
  const response = await fetch(place.tabelog!.url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; nagoya-trip-data-check/1.0)" },
  });
  const html = await response.text();
  const jsonLdBlocks = [
    ...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g),
  ].map((match) => JSON.parse(match[1]) as (TabelogSchema | FaqSchema) & { "@type"?: string });
  const schema = jsonLdBlocks.find((item) => item["@type"] === "Restaurant") as
    TabelogSchema | undefined;
  const faq = jsonLdBlocks.find((item) => item["@type"] === "FAQPage") as FaqSchema | undefined;
  const hoursHtml = faq?.mainEntity?.find((item) => item.name?.includes("営業時間"))?.acceptedAnswer
    ?.text;
  const hours = hoursHtml
    ?.replace(/<a[\s\S]*?<\/a>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\u3000/g, "")
    .trim();
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
    hours,
    status: response.status,
    url: place.tabelog!.url,
  });
}

console.log(JSON.stringify(results, null, 2));
