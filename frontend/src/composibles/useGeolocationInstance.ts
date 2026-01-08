import { useGeolocation } from '@vueuse/core';

const geolocationInstance = useGeolocation({ immediate: true, enableHighAccuracy: true });

// If we need to use this anywhere else use the same instance
export function useGeolocationInstance() {
    return geolocationInstance;
};
