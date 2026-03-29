import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/**
 * MAPBOX_ACCESS_TOKEN lives only in repo-root .env (never VITE_*).
 * - Geocoding: proxied at /api/mapbox/* so the token is not in client source or geocode URLs.
 * - Mapbox GL still needs a token in the browser for tiles; it is injected at build time via `define`.
 *   Use Mapbox dashboard URL restrictions on that token to limit abuse.
 */
export default defineConfig(({ mode }) => {
  const envRoot = loadEnv(mode, repoRoot, '');
  const envFrontend = loadEnv(mode, __dirname, '');
  const mapboxToken =
    envRoot.MAPBOX_ACCESS_TOKEN ||
    envFrontend.MAPBOX_ACCESS_TOKEN ||
    '';

  const mapboxProxy = {
    '/api/mapbox': {
      target: 'https://api.mapbox.com',
      changeOrigin: true,
      secure: true,
      rewrite: (requestPath) => {
        const stripped = requestPath.replace(/^\/api\/mapbox/, '');
        const joiner = stripped.includes('?') ? '&' : '?';
        return `${stripped}${joiner}access_token=${encodeURIComponent(mapboxToken)}`;
      },
    },
    '/api/recommendations': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
    },
    '/api/chat': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
    },
  };

  return {
    plugins: [tailwindcss(), react()],
    envDir: repoRoot,
    define: {
      'import.meta.env.VITE_MAPBOX_TOKEN': JSON.stringify(mapboxToken),
    },
    server: { proxy: mapboxProxy },
    preview: { proxy: mapboxProxy },
  };
});
