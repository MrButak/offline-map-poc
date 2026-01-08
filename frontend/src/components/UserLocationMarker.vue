<template>
    <!-- Nothing rendered in template, marker is programmatic -->
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { useGeolocationInstance } from '../composibles/useGeolocationInstance';
import { Marker } from 'maplibre-gl';
import { mapInstance } from 'src/stores/mapStore';

const geolocationInstance = useGeolocationInstance();
let userLocationDotEl: Marker | null = null;

watch(() => geolocationInstance.coords.value, (newCoords) => {
    if (newCoords.latitude && newCoords.latitude !== Infinity) {
        if (!userLocationDotEl) {
            const el = document.createElement('div');
            el.className = 'location-dot';
            el.innerHTML = '<div class="location-dot-pulse"><div class="location-dot-inner"></div></div>';

            userLocationDotEl = new Marker({ element: el })
                .setLngLat([newCoords.longitude, newCoords.latitude])
                .addTo(mapInstance.value!);

            // TODO: Possibly add this as a user config
            // Note: This will cause the map to pan to user location on app load if location permission has already been granted
            // Pan to user location on initial marker creation
            // mapInstance.value?.panTo([newCoords.longitude, newCoords.latitude]);

        } else {
            userLocationDotEl.setLngLat([newCoords.longitude, newCoords.latitude]);
        }
    }
});

onUnmounted(() => {
    userLocationDotEl?.remove();
});

</script>

<style>
.location-dot {
    width: 29px;
    height: 29px;
}

.location-dot-pulse {
    width: 100%;
    height: 100%;
    background: rgba(66, 133, 244, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
}

.location-dot-inner {
    width: 15px;
    height: 15px;
    background: #4285f4;
    border: 3.2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}
</style>