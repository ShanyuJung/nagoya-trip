import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.resolve("public/images/places");
const outputDirectory = path.join(sourceDirectory, "thumbs");
const optimizedDirectory = path.join(sourceDirectory, "optimized");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

await mkdir(outputDirectory, { recursive: true });
await mkdir(optimizedDirectory, { recursive: true });

const files = (await readdir(sourceDirectory, { withFileTypes: true }))
  .filter(
    (entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()),
  )
  .map((entry) => entry.name);

await Promise.all(
  files.map(async (file) => {
    const filename = `${path.parse(file).name}.webp`;
    await sharp(path.join(sourceDirectory, file))
      .rotate()
      .resize(320, 240, { fit: "cover", position: "centre", withoutEnlargement: true })
      .webp({ quality: 68, effort: 5 })
      .toFile(path.join(outputDirectory, filename));
  }),
);

await Promise.all(
  files.map(async (file) => {
    const source = path.join(sourceDirectory, file);
    if ((await stat(source)).size <= 1024 * 1024) return;

    await sharp(source)
      .rotate()
      .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(optimizedDirectory, `${path.parse(file).name}.webp`));
  }),
);
