import fs from 'node:fs/promises';
import path from 'node:path';
import { catalogueAssetFile } from '../src/lib/catalogueStorage';

const allAssets = JSON.parse(await fs.readFile('generated-artifacts/catalogues/upload.json', 'utf8')) as { file: string; filename: string }[];
const manifest = allAssets.filter((item) => item.filename.startsWith(process.argv[2] ?? ''));
let next = 0;
let done = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < manifest.length) {
    const item = manifest[next++];
    const bytes = await fs.readFile(path.resolve(item.file));
    await catalogueAssetFile(item.filename).save(bytes, {
      resumable: false,
      metadata: { contentType: 'image/webp', cacheControl: 'public, max-age=86400' },
    });
    done++;
    if (done % 25 === 0) process.stdout.write(`Uploaded ${done}/${manifest.length}\n`);
  }
}));
process.stdout.write(`Uploaded all ${done} catalogue assets\n`);
