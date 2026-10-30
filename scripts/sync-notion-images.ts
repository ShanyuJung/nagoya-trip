import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { places } from "../src/data/places";

const notionHost = "https://rainbow-gosling-80b.notion.site";
const collectionId = "356ecbe1-8409-81c2-91e7-000be4e7955e";
const collectionViewId = "356ecbe1-8409-8177-a50b-000ce8034dd8";
const spaceId = "824d7a7c-93ce-43c5-b8b9-604ef9d574d7";
const photoProperty = "@)Dm";

type RichText = Array<[string, Array<[string, string]>?]>;
type NotionBlock = {
  id: string;
  type: string;
  parent_table?: string;
  properties?: Record<string, RichText>;
};

type RecordMap = {
  block?: Record<string, { value?: { value?: NotionBlock } }>;
};

type NotionQueryResponse = { recordMap?: RecordMap };

const aliases: Record<string, string[]> = {
  "nara-park": ["吃完麵虐鹿"],
  "nipponbashi-denden-town": ["日本橋當肥宅"],
  "bon-condominium-namba-ebisu": ["BON(1600 check in)"],
};

const manualImages: Record<string, string> = {
  "pokemon-center-nagoya": "/images/places/pokemon-center-nagoya.png",
};

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[（(].*?[）)]/g, "")
    .replace(/[\s・·—–\-_／/]/g, "")
    .replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}a-z0-9]/gu, "");
}

function richText(value?: RichText) {
  return (
    value
      ?.map(([text]) => text)
      .join("")
      .trim() ?? ""
  );
}

function links(properties: Record<string, RichText> = {}) {
  return Object.values(properties).flatMap((value) =>
    value.flatMap(
      ([, marks]) => marks?.filter(([type]) => type === "a").map(([, url]) => url) ?? [],
    ),
  );
}

const queryResponse = await fetch(`${notionHost}/api/v3/queryCollection`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    collection: { id: collectionId, spaceId },
    collectionView: { id: collectionViewId, spaceId },
    loader: {
      type: "reducer",
      reducers: {
        collection_group_results: { type: "results", limit: 500 },
        "table:uncategorized": { type: "results", limit: 500 },
      },
      searchQuery: "",
      userTimeZone: "Asia/Taipei",
    },
  }),
});

if (!queryResponse.ok) throw new Error(`Notion query failed: ${queryResponse.status}`);
const query = (await queryResponse.json()) as NotionQueryResponse;
const rows = Object.values(query.recordMap?.block ?? {})
  .map((entry) => entry.value?.value)
  .filter(
    (block): block is NotionBlock => block?.type === "page" && block.parent_table === "collection",
  )
  .map((block) => {
    const photo = block.properties?.[photoProperty]?.[0];
    const attachment = photo?.[1]?.find(([type]) => type === "a")?.[1];
    return {
      blockId: block.id,
      title: richText(block.properties?.title),
      normalizedTitle: normalize(richText(block.properties?.title)),
      links: links(block.properties),
      attachment,
      filename: photo?.[0],
    };
  })
  .filter((row) => row.attachment?.startsWith("attachment:") && row.filename);

function findRow(place: (typeof places)[number]) {
  const names = [place.name, place.nameJa, ...(aliases[place.id] ?? [])]
    .map(normalize)
    .filter(Boolean);
  const directLinks = [place.maps, place.official, place.tabelog?.url].filter(Boolean);
  return rows.find((row) => {
    if (directLinks.some((url) => row.links.includes(url!))) return true;
    return names.some(
      (name) =>
        row.normalizedTitle === name ||
        (name.length >= 5 &&
          (row.normalizedTitle.includes(name) || name.includes(row.normalizedTitle))),
    );
  });
}

const matches = places.flatMap((place) => {
  const row = findRow(place);
  return row ? [{ place, row }] : [];
});

const signedResponse = await fetch(`${notionHost}/api/v3/getSignedFileUrls`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    urls: matches.map(({ row }) => ({
      url: row.attachment,
      permissionRecord: { table: "block", id: row.blockId },
    })),
  }),
});

if (!signedResponse.ok) throw new Error(`Notion signing failed: ${signedResponse.status}`);
const { signedUrls } = (await signedResponse.json()) as { signedUrls: string[] };
const outputDir = path.resolve("public/images/places");
await mkdir(outputDir, { recursive: true });

const imageMap: Record<string, string> = { ...manualImages };
for (const [index, { place, row }] of matches.entries()) {
  const signedUrl = signedUrls[index];
  if (!signedUrl) continue;
  const extension = path.extname(row.filename ?? "").toLocaleLowerCase() || ".jpg";
  const safeExtension = /^\.(?:avif|gif|jpe?g|png|webp)$/.test(extension) ? extension : ".jpg";
  const filename = `${place.id}${safeExtension}`;
  const response = await fetch(signedUrl);
  if (!response.ok) {
    console.warn(`Skipped ${place.name}: ${response.status}`);
    continue;
  }
  await writeFile(path.join(outputDir, filename), Buffer.from(await response.arrayBuffer()));
  imageMap[place.id] = `/images/places/${filename}`;
}

const source = `// Generated by scripts/sync-notion-images.ts\nexport const placeImages: Record<string, string> = ${JSON.stringify(imageMap, null, 2)};\n`;
await writeFile(path.resolve("src/data/place-images.ts"), source);

console.log(
  `Downloaded ${matches.length} Notion images; ${Object.keys(imageMap).length} of ${places.length} places now have photos.`,
);
const unmatched = places.filter((place) => !imageMap[place.id]);
console.log(`No Notion photo matched: ${unmatched.length}`);
console.log(unmatched.map((place) => place.name).join("\n"));
