import { Router } from 'express';
import { catalogueAssetFile } from '../lib/catalogueStorage';

const router = Router();

router.get('/catalogue-assets/:filename', async (req, res) => {
  const filename = req.params.filename;
  if (!/^(min|drinkware|eco|bags|portfolio|partner)-p\d{2}-\d{2}\.webp$/.test(filename)) {
    res.status(404).json({ error: 'Catalogue image not found' });
    return;
  }
  try {
    const file = catalogueAssetFile(filename);
    const [exists] = await file.exists();
    if (!exists) {
      res.status(404).json({ error: 'Catalogue image not found' });
      return;
    }
    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    });
    file.createReadStream().on('error', (error) => {
      req.log.error({ err: error, filename }, 'Catalogue image streaming failed');
      if (!res.headersSent) res.status(502).json({ error: 'Unable to load catalogue image' });
      else res.destroy();
    }).pipe(res);
  } catch (error) {
    req.log.error({ err: error, filename }, 'Catalogue storage failed');
    res.status(503).json({ error: 'Catalogue image storage is unavailable' });
  }
});

export default router;
