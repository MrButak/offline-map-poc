// Non Pinia store
import { ref, Ref, toRaw } from 'vue';
import maplibregl, { Map } from 'maplibre-gl';
import { useStorage } from '@vueuse/core';
import { MapConfig } from 'src/models';

export let mapInstance: Ref<Map> | Ref<null> = ref(null);
export const DEFAULT_MAP_CONFIG: MapConfig = {
    center: [-98, 39],
    zoom: 3.5,
    color_mode: 'day',
    tiles_type: 'default',
    bearing: 0,
    pitch: 0
}

const BASE_URL = import.meta.env.VITE_BASE_FRONTEND_URL;
const MAPTILER_API_KEY = import.meta.env.VITE_MAPLIER_API_KEY;
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;
const TILE_SERVER_URL = import.meta.env.VITE_TILE_SERVER_URL;


let mapStyleDay: any = null;
let mapStyleNight: any = null;
let mapStyleSatellite: any = null;
export const isTransitioningMapStyle = ref(false);

// *************************
// **** Local Storage ******
// *************************
// https://vueuse.org/core/useStorage/
export const mapConfig = useStorage(
    'map-config',
    DEFAULT_MAP_CONFIG,
    localStorage,
    {
        mergeDefaults: true
    }
);

export function getMapStyle(styleType: 'day' | 'night' | 'satellite') {
    if (styleType === 'satellite') { return mapStyleSatellite; }
    return styleType === 'day' ? mapStyleDay : mapStyleNight;
};

export function setMapStyle(styleType: 'satellite' | 'default') {
    // Disable day/night satellite/default buttons during transition
    if (isTransitioningMapStyle.value) return;
    isTransitioningMapStyle.value = true;

    const style = styleType === 'satellite'
        ? mapStyleSatellite
        : (mapConfig.value.color_mode === 'night' ? mapStyleNight : mapStyleDay);

    toRaw(mapInstance.value)?.setStyle(style);
    isTransitioningMapStyle.value = false;
}

export async function initMap() {
    const SATELLITE_CONFIG = {
        maptiler: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
        mapbox: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`,
    };

    // Set you satellite provider here
    const SATELLITE_PROVIDER: 'maptiler' | 'mapbox' = 'maptiler';

    // Handle our styles
    async function initMapStyleJson() {
        // Fetch the locally stored style.json
        async function getBaseStyleJson(mapStyle: 'day' | 'night' | 'satellite') {
            const styleResponse = await fetch(`offline-map-resources/${mapStyle === 'satellite' ? 'map-satellite' : 'map-default'}/style-${mapStyle}.json`);
            return await styleResponse.json();
        }

        function createDynamicMapStyleJson(baseStyleJson: any, mapType: 'default' | 'satellite') {
            // Start with the base sources from the style file (empty tile arrays)
            const sources = {
                ...baseStyleJson.sources
            };

            // Inject the vector tile URL for our base map (always needed)
            sources.openmaptiles = {
                ...baseStyleJson.sources.openmaptiles,
                tiles: [`${TILE_SERVER_URL}planet/{z}/{x}/{y}.mvt`]
            };

            // Add satellite imagery source only when we're in satellite mode
            if (mapType === 'satellite') {
                sources.satellite = {
                    ...baseStyleJson.sources.satellite,
                    tiles: [SATELLITE_CONFIG[SATELLITE_PROVIDER]]
                };
            }

            // Return the complete style with injected URLs
            return {
                ...baseStyleJson,
                glyphs: `${BASE_URL}offline-map-resources/fonts/{fontstack}/{range}.pbf`,
                sprite: `${BASE_URL}offline-map-resources/sprites/sprite`,
                center: mapConfig.value.center ?? DEFAULT_MAP_CONFIG.center,
                zoom: mapConfig.value.zoom ?? DEFAULT_MAP_CONFIG.zoom,
                sources
            };
        }

        const baseStyleDay = await getBaseStyleJson('day');
        const baseStyleNight = await getBaseStyleJson('night');
        const baseStyleSatellite = await getBaseStyleJson('satellite');

        mapStyleDay = createDynamicMapStyleJson(baseStyleDay, 'default');
        mapStyleNight = createDynamicMapStyleJson(baseStyleNight, 'default');
        mapStyleSatellite = createDynamicMapStyleJson(baseStyleSatellite, 'satellite');
    }

    await initMapStyleJson();
}

export function getCurrentMapState(): MapConfig {
    if (!mapInstance.value) return {} as MapConfig;

    const center = mapInstance.value.getCenter();
    const zoom = mapInstance.value.getZoom();
    const bearing = mapInstance.value.getBearing();
    const pitch = mapInstance.value.getPitch();

    const mapState: MapConfig = {
        center: [center.lng, center.lat],
        zoom,
        bearing,
        pitch,
    }

    return mapState;
};

export function saveMapState(mapConfigToSave: MapConfig) {
    const { center, zoom, bearing, pitch } = mapConfigToSave;

    // Save map position in ls
    mapConfig.value.center = center;
    mapConfig.value.zoom = zoom;
    mapConfig.value.bearing = bearing;
    mapConfig.value.pitch = pitch;
};
