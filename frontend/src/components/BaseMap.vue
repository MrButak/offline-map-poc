<template>
    <!-- Main map container -->
    <div id="map" ref="mapDivRefId"></div>
    <MapControlIcons />
    <UserLocationMarker />
</template>

<script setup lang="ts">
import { Map } from 'maplibre-gl';
import { onMounted, ref } from 'vue';
import { getMapStyle, mapInstance, mapConfig, getCurrentMapState, saveMapState } from 'src/stores/mapStore';
import MapControlIcons from './MapControlIcons.vue';
import UserLocationMarker from './UserLocationMarker.vue';
import { MapConfig } from 'src/models';
import { useQuasar } from 'quasar';

const $q = useQuasar();

let mapDivRefId = ref({} as HTMLElement);
// Determine whether we are transitioning from show/hide cluster/individual markers
let isInTransitionZone = ref(false);

// First time message
const showFirstTimeDialog = ref(false);

onMounted(async () => {
    let styleJson: any = null;

    if (mapConfig.value.tiles_type === 'default') {
        // Get the style that was modified on boot.
        styleJson = getMapStyle(mapConfig.value.color_mode!);

    } else {
        styleJson = getMapStyle('satellite');
    }

    // Initialize MapLibre with injected style
    const initializedMap = new Map({
        container: mapDivRefId.value,
        style: styleJson,
        attributionControl: false,
        minZoom: 0, // TODO: turn these hardcoded values into vars
        maxZoom: 22,
        zoom: mapConfig.value.zoom,
        center: mapConfig.value.center,
        // refreshExpiredTiles: false
    });

    // Add map listeners
    initializedMap.on('idle', () => {
        if (!mapInstance.value) return;

        const currentMapState: MapConfig = getCurrentMapState();
        saveMapState(currentMapState);
    })

    initializedMap.on('error', (e) => {
        console.error('MapLibre error details:', {
            type: e.type,
            error: e.error,
            // tile: e.tile,
            // sourceId: e.sourceId,
            message: e.error?.message
        });
    });
 
    // Save the map instance to a global ref
    mapInstance.value = initializedMap;

    console.log('[Map] Initialized');
})

</script>

<style lang="scss" scoped>
#map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 500;
}

body.body--light #map {
    background-color: #B6E0FC;
}

body.body--dark #map {
    background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%);
}
</style>
