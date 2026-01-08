<template>
<div style="z-index: 500;" class="no-pointer-events absolute fullscreen">   
    <div :class="[$q.screen.gt.sm ? 'row absolute-bottom-right' : 'column items-start absolute-top-right', 'q-gutter-sm', 'q-pa-sm', 'all-pointer-events']">
        <q-btn 
            class="rounded-borders"
            style="background-color: var(--background)"
            dense
            padding="10px"
            aria-label="Satellite Mode" 
            @click="toggleSatelliteMode"
            :disable="isTransitioningMapStyle"
        >
            <SvgIcon 
                src="svgs/satellite.svg"
                size="sm"
                :type="mapConfig.tiles_type === 'satellite' ? 'info' : 'primary'"
            />
        </q-btn>

        <div :class="$q.screen.gt.sm ? 'q-gutter-x-xs' : 'column q-gutter-y-xs'">
            <q-btn 
                class="rounded-borders"
                style="background-color: var(--background)"
                dense 
                padding="10px"
                aria-label="Zoom Out" 
                @click="zoomOutMap"
            >
                <SvgIcon 
                    src="svgs/minus.svg"
                    size="sm"
                    type="primary"
                />
            </q-btn>

            <q-btn 
                class="rounded-borders"
                style="background-color: var(--background)"
                dense 
                padding="10px"
                aria-label="Zoom In" 
                @click="zoomInMap"
            >
                <SvgIcon 
                    src="svgs/plus.svg"
                    size="sm"
                    type="primary"
                />
            </q-btn>
        </div>

        <q-btn 
            class="rounded-borders"
            style="background-color: var(--background)"
            dense 
            padding="10px"
            aria-label="Current Location" 
            @click="panToUserLocation"
        >
            <SvgIcon 
                src="svgs/current-location.svg"
                size="sm"
                type="primary"
            />
        </q-btn>
    </div>   
</div>
</template>


<script setup lang="ts">
import { watchOnce } from '@vueuse/core';
import { mapConfig, mapInstance, setMapStyle, isTransitioningMapStyle } from 'src/stores/mapStore';
import { useGeolocationInstance } from 'src/composibles/useGeolocationInstance';
import SvgIcon from './SvgIcon.vue';

const geolocationInstance = useGeolocationInstance();
const { coords, locatedAt, error, resume, pause } = geolocationInstance;

function panToUserLocation() {
    if (coords.value?.longitude !== Infinity) {
        mapInstance.value?.panTo([coords.value.longitude, coords.value.latitude]);
        return;
    }
    
    // Re-trigger permission check
    resume();

    // Handle geolocation response: pan to location on success, show error on failure
    watchOnce([coords, error], ([newCoords, newError]) => {
        if (newError) {
            console.log(newError)
            // TODO: Error notification

        } else if (newCoords.longitude !== Infinity) {
            mapInstance.value?.panTo([newCoords.longitude, newCoords.latitude]);
        }
    });
}

function toggleSatelliteMode() {
    const newType = mapConfig.value.tiles_type === 'default' ? 'satellite' : 'default';
    mapConfig.value.tiles_type = newType;
    setMapStyle(newType);
}

function zoomInMap() {
    const currentZoom = mapInstance.value?.getZoom();
    if (currentZoom) {
        mapInstance.value?.zoomIn();
    }
}

function zoomOutMap() {
    const currentZoom = mapInstance.value?.getZoom();
    if (currentZoom) {
        mapInstance.value?.zoomOut();
    }
}

</script>
