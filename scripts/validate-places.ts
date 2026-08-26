import { z } from "zod";
import { places } from "../src/data/places";

const url = z.string().url();
const placeSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    category: z.enum(["餐廳", "景點", "住宿", "活動"]),
    categoryEn: z.string().min(1),
    position: z.tuple([z.number(), z.number()]).nullable(),
    nameJa: z.string().min(1),
    address: z.string().min(1),
    hours: z.string().min(1),
    stay: z.string().min(1),
    note: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    maps: url,
    official: url.optional(),
    tabelog: z
      .object({
        url: url.refine((value) => new URL(value).hostname === "tabelog.com"),
        rating: z.number().min(0).max(5),
        verifiedAt: z.iso.date(),
      })
      .optional(),
  })
  .superRefine((place, context) => {
    if (place.category === "餐廳" && place.position === null)
      context.addIssue({ code: "custom", path: ["position"], message: "餐廳必須有座標" });
    if (place.category === "餐廳" && !place.tabelog)
      context.addIssue({ code: "custom", path: ["tabelog"], message: "餐廳必須有 Tabelog 資料" });
  });

const result = z.array(placeSchema).safeParse(places);
if (!result.success) {
  console.error(z.prettifyError(result.error));
  process.exit(1);
}
const ids = places.map(({ id }) => id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) {
  console.error(`重複的地點 ID：${[...new Set(duplicates)].join(", ")}`);
  process.exit(1);
}
const restaurants = places.filter(({ category }) => category === "餐廳");
console.log(
  `Validated ${places.length} places (${restaurants.length} restaurants with map and Tabelog data).`,
);
