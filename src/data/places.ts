export type PlaceCategory = "美食" | "景點" | "住宿" | "活動";

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  categoryEn: string;
  position: [number, number] | null;
  area: string;
  schedule: string;
  note: string;
  tags: string[];
  maps: string;
  official?: string;
};

const categoryEn: Record<PlaceCategory, string> = {
  美食: "FOOD",
  景點: "ATTRACTION",
  住宿: "STAY",
  活動: "EVENT",
};

function place(data: Omit<Place, "categoryEn">): Place {
  return { ...data, categoryEn: categoryEn[data.category] };
}

function food(
  id: string,
  name: string,
  area: "名古屋" | "三重" | "伊勢內宮",
  maps: string,
  official?: string,
): Place {
  const regionTags =
    area === "名古屋"
      ? ["名古屋候選", "愛知"]
      : [area === "伊勢內宮" ? "內宮周邊" : "三重候選", "三重"];
  return place({
    id,
    name,
    category: "美食",
    position: null,
    area,
    schedule: "候選清單",
    note: "收錄於 Notion 旅遊資料的候選餐廳，出發前可依當天路線與候位狀況安排。",
    tags: ["吃喝", ...regionTags],
    maps,
    official,
  });
}

export const places: Place[] = [
  place({
    id: "domus-ozone",
    name: "Domus OZONE",
    category: "住宿",
    position: [35.1904, 136.9362],
    area: "名古屋",
    schedule: "11/7–11/8",
    note: "名古屋兩晚住宿，行程資料記錄總額 ¥49,032（約 NT$10,297）。",
    tags: ["11/7", "11/8", "愛知", "已排定"],
    maps: "https://maps.app.goo.gl/NGZF7ogoeBGQWzY47",
    official: "https://www.booking.com/Share-7ScNTcz",
  }),
  place({
    id: "yoasobi-nagoya",
    name: "YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026–2027",
    category: "活動",
    position: [35.1859, 136.9474],
    area: "名古屋",
    schedule: "11/8",
    note: "名古屋段的主要活動，當天往返場館請預留散場人潮與交通時間。",
    tags: ["11/8", "演唱會", "已排定"],
    maps: "https://maps.app.goo.gl/GrZgx2pvCXuEo8Rp8",
  }),
  place({
    id: "kirisame-magic-shop",
    name: "霧雨魔法店民泊",
    category: "住宿",
    position: [34.4875, 136.7098],
    area: "伊勢",
    schedule: "11/9–11/11",
    note: "三重段住宿候選，行程資料記錄總額 ¥79,591（約 NT$16,714）。",
    tags: ["11/9", "11/10", "11/11", "三重", "住宿候選"],
    maps: "https://maps.app.goo.gl/mcWo23ismoe1rGui7",
    official: "https://www.booking.com/hotel/jp/kirisame-magic-shop.zh-tw.html",
  }),
  place({
    id: "amayadori",
    name: "天宿り Amayadori",
    category: "住宿",
    position: [34.4865, 136.7081],
    area: "伊勢",
    schedule: "11/9–11/11",
    note: "三重段另一間住宿候選，行程資料記錄總額 ¥95,800（約 NT$20,118）。",
    tags: ["11/9", "11/10", "11/11", "三重", "住宿候選"],
    maps: "https://maps.app.goo.gl/q7YNrpbxr7gL924t6",
    official: "https://www.booking.com/hotel/jp/tian-su-riamayadori.zh-tw.html",
  }),
  place({
    id: "toba-aquarium",
    name: "鳥羽水族館",
    category: "景點",
    position: [34.4813, 136.8468],
    area: "鳥羽",
    schedule: "三重段",
    note: "Notion 景點清單中的鳥羽景點，可和海鮮餐廳或鳥羽市區排在同一天。",
    tags: ["三重", "水族館", "雨天備案"],
    maps: "https://maps.app.goo.gl/t3sxmWNVVeJzr5vq6",
  }),
  place({
    id: "futamiokitama-jinja",
    name: "二見興玉神社",
    category: "景點",
    position: [34.5093, 136.788],
    area: "伊勢・二見",
    schedule: "三重段",
    note: "以夫婦岩聞名的海岸神社，適合安排清晨或黃昏散步。",
    tags: ["三重", "神社", "海景"],
    maps: "https://maps.app.goo.gl/cm7gKpcrRKbzus6E9",
  }),
  place({
    id: "yokoyama-observatory",
    name: "橫山展望台",
    category: "景點",
    position: [34.3159, 136.7814],
    area: "志摩",
    schedule: "三重段",
    note: "從高處眺望英虞灣的代表性展望台，需留意從伊勢往返的移動時間。",
    tags: ["三重", "展望台", "自然景觀"],
    maps: "https://maps.app.goo.gl/GRCY95NhdHsNhzpu5",
  }),
  place({
    id: "ise-jingu-naiku",
    name: "伊勢神宮 內宮",
    category: "景點",
    position: [34.455, 136.7252],
    area: "伊勢內宮",
    schedule: "三重段",
    note: "三重旅程核心景點，可連同御蔭橫丁與內宮前美食一起安排。",
    tags: ["三重", "神社", "內宮周邊"],
    maps: "https://maps.app.goo.gl/gLWv79PXtk9vo3N58",
  }),
  food(
    "alma-de-churrasco",
    "Alma.De Churrasco Nagoya Sakae",
    "名古屋",
    "https://maps.app.goo.gl/YF7xtXbG4bTgGH6K9",
    "https://tabelog.com/aichi/A2301/A230103/23090273/",
  ),
  food(
    "namaramucho",
    "なまらむーちょ羊肉燒烤餐廳",
    "名古屋",
    "https://maps.app.goo.gl/qH2EhTH76ZjfY6Pg8",
    "https://tabelog.com/aichi/A2301/A230110/23049132/",
  ),
  food(
    "setsugekka-tanaka",
    "雪月花たなかさとる",
    "名古屋",
    "https://maps.app.goo.gl/QSiQq2WBnsZPWeKf9",
    "https://tabelog.com/aichi/A2301/A230103/23071686/",
  ),
  food(
    "katuretu-matumura",
    "Katuretu MATUMURA",
    "名古屋",
    "https://maps.app.goo.gl/XsAAJjWjYo1tkCd39",
    "https://tabelog.com/aichi/A2301/A230101/23073675/",
  ),
  food("yamamotoya", "山本屋総本家 本家", "名古屋", "https://maps.app.goo.gl/ZEm3NrPeJjdFoXaGA"),
  food(
    "atsuta-horaiken",
    "熱田蓬萊軒（松阪屋店）",
    "名古屋",
    "https://maps.app.goo.gl/94Mz31ZzTGMunjE58",
  ),
  food(
    "coffee-house-kako",
    "Coffee House Kako",
    "名古屋",
    "https://maps.app.goo.gl/tJyFnpnFvsFEcXA6A",
  ),
  food("yadakatsu", "矢田かつ", "名古屋", "https://maps.app.goo.gl/zPSzN6QHyUU2kuty8"),
  food("raz", "Raz", "名古屋", "https://maps.app.goo.gl/wWQ4zJsHXoX3eneH8"),
  food(
    "rakeiko",
    "極太濁流らーめん ら・けいこ",
    "名古屋",
    "https://maps.app.goo.gl/rsYcQsG1xXW7myVn8",
  ),
  food("ramen-ajisai", "らぁ麺 紫陽花", "名古屋", "https://maps.app.goo.gl/EEsomtdyrpnQxV496"),
  food("katsudon-daiki", "かつ丼 大樹", "名古屋", "https://maps.app.goo.gl/8XN6tzEpxnbDs5wv5"),
  food(
    "taiwan-ramen-koyo",
    "台湾ラーメン 光陽",
    "名古屋",
    "https://maps.app.goo.gl/QaF9kTLHPXeCDT729",
  ),
  food("shishimaru", "獅子丸", "名古屋", "https://maps.app.goo.gl/68fH3u9gzuT9EArq8"),
  food(
    "tsukachan-gyoza",
    "餃子 とんちゃん 専門店 塚ちゃん餃子",
    "名古屋",
    "https://share.google/SdVmUUPkX2icJvlZ6",
  ),
  food(
    "mutsumi",
    "むつみ",
    "三重",
    "https://maps.app.goo.gl/SyBPZTm8Nve5qh2S8",
    "https://tabelog.com/mie/A2403/A240302/24003642/",
  ),
  food(
    "matoya-kaki-terrace",
    "的矢かきテラス生蠔吧餐廳",
    "三重",
    "https://maps.app.goo.gl/cnxTMPpwHPh3VCny8",
    "https://tabelog.com/mie/A2403/A240303/24018818/",
  ),
  food(
    "mizunuma-sazae",
    "水沼サザエ店",
    "三重",
    "https://maps.app.goo.gl/bgLiXMJjrMzkAVaz8",
    "https://tabelog.com/mie/A2403/A240302/24010333/",
  ),
  food(
    "yamatoya-kuroishi",
    "倭庵 黒石",
    "三重",
    "https://maps.app.goo.gl/hY5QHbcQ3AVaUmSq8",
    "https://tabelog.com/mie/A2403/A240301/24001188/",
  ),
  food(
    "gyoza-misuzu",
    "餃子の美鈴",
    "三重",
    "https://maps.app.goo.gl/pcjknCPQRh6QY47Z6",
    "https://tabelog.com/mie/A2403/A240301/24000014/",
  ),
  food(
    "amakoya-hachimankamado",
    "海女小屋 はちまんかまど・あさり浜",
    "三重",
    "https://maps.app.goo.gl/DmJWCMGrxihxDKj26",
    "https://amakoya.com/",
  ),
  food("gyugin", "牛銀 本店", "三重", "https://maps.app.goo.gl/zq1s5qUipaDsAxKN7"),
  food("mukai-sake", "向井酒の店", "三重", "https://maps.app.goo.gl/CvrdzSgVektLKHYEA"),
  food("sazanami-toba", "漣 鳥羽店", "三重", "https://maps.app.goo.gl/8HAefsZxP8Mb888G6"),
  food("isshobin", "一升びん 本店", "三重", "https://maps.app.goo.gl/G9cB7AXG7yG789HGA"),
  food("asahiya", "旭家 酒素饅頭製造本舗", "三重", "https://maps.app.goo.gl/JiboLmKAjmiifNhX7"),
  food("wadakin", "和田金", "三重", "https://maps.app.goo.gl/7puEssUz8GcAVMyp7"),
  food(
    "starbucks-naiku",
    "スターバックス コーヒー 伊勢 内宮前店",
    "伊勢內宮",
    "https://maps.app.goo.gl/adGgJc3WTm934Hk66",
  ),
  food(
    "fukusuke",
    "ふくすけ Udon-ya Fukusuke",
    "伊勢內宮",
    "https://maps.app.goo.gl/K4ePPoYHLDniQ5p7A",
  ),
  food("butasute", "おかげ横丁 豚捨", "伊勢內宮", "https://maps.app.goo.gl/7V5nq27M96T3AMi66"),
  food("akafuku", "赤福 本店", "伊勢內宮", "https://maps.app.goo.gl/J91zwFKEsba4xtFq8"),
];
