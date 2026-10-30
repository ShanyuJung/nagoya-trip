import { z } from "zod";
import { places } from "../src/data/places";

const url = z.string().url();
const foodTypeTags = new Set([
  "巴西烤肉",
  "燒肉",
  "成吉思汗烤肉",
  "羊肉",
  "牛肉",
  "炸豬排",
  "味噌烏龍麵",
  "烏龍麵",
  "鍋物",
  "鰻魚飯",
  "日式料理",
  "咖啡廳",
  "喫茶店",
  "豬排飯",
  "洋食",
  "拉麵",
  "沾麵",
  "中華料理",
  "餃子",
  "內臟燒肉",
  "海鮮",
  "牡蠣",
  "河豚",
  "炸雞",
  "炭烤",
  "壽喜燒",
  "松阪牛",
  "居酒屋",
  "可樂餅",
  "和菓子",
  "甜點",
  "伊勢烏龍麵",
  "天婦羅",
  "牛肉料理",
  "漢堡",
  "巧克力",
  "飯糰",
  "壽司",
  "法式塔可",
  "燒鳥",
]);
const placeholderValues = new Set([
  "出發前確認最新營業時間",
  "候選清單",
  "收錄於 Notion 旅遊資料的候選餐廳，出發前可依當天路線與候位狀況安排。",
]);
const placeSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    category: z.enum(["餐廳", "景點", "購物", "住宿", "活動"]),
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
    verified: z.boolean().optional(),
    tabelog: z
      .object({
        url: url.refine((value) => new URL(value).hostname === "tabelog.com"),
        rating: z.number().min(0).max(5).optional(),
        verifiedAt: z.iso.date().optional(),
      })
      .optional(),
  })
  .superRefine((place, context) => {
    if (place.category === "餐廳" && place.position === null)
      context.addIssue({ code: "custom", path: ["position"], message: "餐廳必須有座標" });
    if (place.category === "餐廳" && place.verified !== false && !place.tabelog)
      context.addIssue({ code: "custom", path: ["tabelog"], message: "餐廳必須有 Tabelog 資料" });
    if (
      place.category === "餐廳" &&
      place.verified !== false &&
      (!place.tabelog?.rating || !place.tabelog.verifiedAt)
    )
      context.addIssue({
        code: "custom",
        path: ["tabelog"],
        message: "已核對餐廳必須有 Tabelog 評分與核對日期",
      });
    if (place.category === "餐廳" && !place.tags.some((tag) => foodTypeTags.has(tag)))
      context.addIssue({ code: "custom", path: ["tags"], message: "餐廳必須有食物種類標籤" });
    for (const field of ["hours", "stay", "note"] as const) {
      if (placeholderValues.has(place[field]))
        context.addIssue({ code: "custom", path: [field], message: "不得使用共用模板內容" });
    }
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
const restaurantsWithTabelog = restaurants.filter(({ tabelog }) => tabelog);
console.log(
  `Validated ${places.length} places (${restaurants.length} restaurants, ${restaurantsWithTabelog.length} with Tabelog links).`,
);
