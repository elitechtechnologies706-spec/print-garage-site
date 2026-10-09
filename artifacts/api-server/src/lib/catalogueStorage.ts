import { Storage } from '@google-cloud/storage';

// Replit's sidecar exchanges credentials automatically; no application keys.
const REPLIT_SIDECAR_ENDPOINT = 'http://127.0.0.1:1106';
export const catalogueStorage = new Storage({
  credentials: {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: 'external_account',
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: 'json', subject_token_field_name: 'access_token' },
    },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});

export function catalogueAssetFile(filename: string) {
  const searchPath = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(',')[0]?.trim();
  if (!searchPath) throw new Error('Public catalogue storage is not configured');
  const [bucket, ...prefix] = searchPath.replace(/^\/+/, '').split('/');
  if (!bucket) throw new Error('Invalid public catalogue storage path');
  return catalogueStorage.bucket(bucket).file([...prefix, 'print-garage-catalogues', filename].join('/'));
}
