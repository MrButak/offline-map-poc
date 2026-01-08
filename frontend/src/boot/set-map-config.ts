import { boot } from 'quasar/wrappers'
import { initMap, mapConfig } from 'stores/mapStore';
import { Dark } from 'quasar';

// Boot file: 
// 1. generate the modified syle jsons on app startup and store it in memory.
// 2. make sure dark mode is set if that was the previous setting
export default boot(async ({ /* app */ }) => {
    try {
        await initMap();
        
        // Set dark mode based on user settings
        if (!Dark.isActive && mapConfig.value.color_mode === 'night') {
            Dark.toggle();
        }

        console.log('[BOOT] Set style tiles jsons in memory');

    } catch (error) {
        console.error('[BOOT] Error setting tiles json:', error);
    }
})
