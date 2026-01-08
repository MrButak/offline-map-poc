/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

declare const self: ServiceWorkerGlobalScope & typeof globalThis

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { getFromIndexDb, storeInIndexDb } from 'src/scripts/managers/indexDbManager'
import { TileData } from 'src/models'

self.skipWaiting()
clientsClaim()

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

if (process.env.PROD) {
    // Non-SSR fallback to index.html
    // Production SSR fallback to offline.html (except for dev)
    if (process.env.MODE !== 'ssr') {
        registerRoute(
            new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
                denylist: [/sw\.js$/, /workbox-(.)*\.js$/],
            })
        )
    }
}

// ========================================
// Self-hosted vector tiles caching indexDB
// ========================================
registerRoute(
    // Match your tile server requests
    ({ url }) => (
        url.hostname === 'tiles.mrbutak.com'
        && url.pathname.startsWith('/planet/')
        && url.pathname.endsWith('.mvt')
    ),

    // Cache-first strategy with IndexedDB
    async ({ url, request, event }) => {
        const tileKey = getTileKey(url.href);

        try {
            // Check IndexedDB cache first
            const cachedTile = await getFromIndexDb<TileData>('tiles', tileKey);

            if (cachedTile) {
                console.log(`[Service Worker] Serving tile from cache: ${tileKey}`);

                // Respond with tile from IndexedDB
                return new Response(cachedTile.data, {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'application/x-protobuf',
                        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year - tiles don't change often
                        'Content-Encoding': 'gzip',
                    }
                });
            }

            console.log(`[Service Worker] Fetching tile from network: ${url.href}`);

            // Not in cache, fetch from your tile server
            const response = await fetch(url.href);

            if (!response.ok) {
                console.error(`[Service Worker] Network error: ${response.status} ${response.statusText}`);
                throw new Error(`Network error: ${response.status}`);
            }

            // Clone response for caching - before consuming
            const responseClone = response.clone();
            const arrayBuffer = await responseClone.arrayBuffer();

            // Store in IndexedDB
            const tileData: TileData = {
                data: arrayBuffer,
                timestamp: Date.now(),
                url: url.href
            };
            await storeInIndexDb('tiles', tileKey, tileData);

            console.log(`[Service Worker] Cached tile: ${tileKey}`);

            // Return original response
            return response;

        } catch (error) {
            console.error('[Service Worker] Error handling tile request:', error);

            return new Response(
                JSON.stringify({
                    error: 'Failed to fetch tile',
                    details: error instanceof Error ? error.message : 'Unknown error',
                    tileKey: tileKey
                }),
                {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
);

// Generate cache key for tile requests
function getTileKey(url: string): string {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Extract z, x, y from path like /tiles/v3/3/3/5.pbf
    if (pathParts.length >= 5) {
        const z = pathParts[pathParts.length - 3];
        const x = pathParts[pathParts.length - 2];
        const y = pathParts[pathParts.length - 1]?.replace('.pbf', '');
        return `tile-${z}-${x}-${y}`;
    }
    return urlObj.pathname;
}

// ========================================
// Satellite tiles - pass through (no caching)
// ========================================
registerRoute(
    ({ url }) => (
        url.hostname === 'api.maptiler.com'
        && url.pathname.includes('/tiles/satellite-v2/')
        && url.pathname.endsWith('.jpg')
    ),
    async ({ url }) => {
        console.log(`[Service Worker] Passing through satellite tile: ${url.href}`);
        return fetch(url.href);
    }
);

// TODO: can use this when we want to store satellite tiles
function getZoomFromTileKey(tileKey: string): number {
    const parts = tileKey.split('-');
    return parseInt(parts[1]!) || 0;
}

