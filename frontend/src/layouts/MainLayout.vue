<template>
    <q-layout view="hHh lpR fFf" class="overflow-hidden">

        <!-- Menu drawer -->
        <q-drawer style="z-index: 501; background-color: var(--background);" show-if-above no-swipe-open
            v-model="drawerOpen" :side="$q.screen.lt.md ? 'right' : 'left'" :mini="miniState" :overlay="$q.screen.lt.md"
            elevated bordered>
            <q-list separator class="full-height column no-wrap">
                <q-item style="background: var(--surface);">
                    <q-item-section :side="miniState" class="full-width q-py-xs">
                        <div align="center" class="full-width q-pb-xs">
                            <SvgIcon :src="!miniState ? 'svgs/hmm-logo.svg' : 'svgs/hmm-logo-round.svg'" type="primary"
                                :height="miniState && $q.screen.gt.sm ? 26 : 72"
                                :width="miniState && $q.screen.gt.sm ? 26 : 72" />
                        </div>
                        <div v-show="!miniState || $q.screen.lt.md" class="full-width text-center text-h6 text-bold">
                            Tile Server</div>
                    </q-item-section>
                </q-item>

                <div class="col scroll">
                    <q-item v-if="!isPWA() && !$q.platform.is.safari" clickable @click="toggle" v-ripple
                        class="q-pa-md">
                        <q-item-section side>
                            <SvgIcon :src="isFullscreen ? 'svgs/fullscreen-exit.svg' : 'svgs/fullscreen.svg'"
                                type="primary" size="sm" />
                        </q-item-section>
                        <q-item-section class="text-body1 q-pl-sm">
                            {{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
                        </q-item-section>
                    </q-item>

                    <q-item :disable="isTransitioningMapStyle" clickable v-ripple @click="$q.dark.toggle()"
                        class="q-pa-md">
                        <q-item-section side>
                            <SvgIcon :src="$q.dark.isActive ? 'svgs/dark-mode.svg' : 'svgs/light-mode.svg'"
                                type="primary" size="sm" />
                        </q-item-section>
                        <q-item-section class="text-body1 q-pl-sm">
                            {{ $q.dark.isActive ? 'Dark' : 'Light' }}
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="refreshApp()" class="q-pa-md">
                        <q-item-section side>
                            <SvgIcon src='svgs/refresh.svg' type="primary" size="sm" />
                        </q-item-section>
                        <q-item-section class="text-body1 q-pl-sm">
                            Refresh
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="aboutDialog = true" class="q-pa-md">
                        <q-item-section side>
                            <SvgIcon src="svgs/question-mark.svg" type="primary" size="sm" />
                        </q-item-section>
                        <q-item-section class="text-body1 q-pl-sm">
                            About
                        </q-item-section>
                    </q-item>

                    <q-separator />
                </div>

                <div v-if="$q.screen.gt.sm">
                    <q-separator />
                    <q-item clickable v-ripple @click="miniState = !miniState">
                        <q-item-section class="text-body1 q-pl-sm">
                        </q-item-section>
                        <q-item-section side>
                            <SvgIcon :src="miniState ? 'svgs/double-chevron-right.svg' : 'svgs/double-chevron-left.svg'"
                                type="primary" size="xs" />
                        </q-item-section>
                    </q-item>
                </div>
            </q-list>
        </q-drawer>

        

        
        <!-- Pages -->
        <q-page-container>
            <router-view />
        </q-page-container>

        <!-- Footer -->
        <q-footer v-if="$q.screen.lt.md" bordered
            :style="$q.dark.isActive ? 'background: var(--surface)' : ''">
            <q-toolbar class="row reverse">
                <!-- <q-btn 
                    flat dense round 
                    aria-label="Map" 
                    @click="null"
                >
                    <SvgIcon
                        src="svgs/map.svg"
                        size="sm"
                        :type="isOnMapPage ? 'info' : ''"
                        :custom-colors="{
                            light: { primary: isOnMapPage ? null : 'var(--surface)' },
                            dark: { primary: isOnMapPage ? null : '' }
                        }" 
                    />
                </q-btn> -->

                <!-- <q-btn 
                    flat dense round 
                    aria-label="Search"
                    @click="null"
                >
                    <SvgIcon 
                        src="svgs/search.svg"
                        size="sm"
                        :type="isOnSearchPage ? 'info' : ''"
                        :custom-colors="{
                            light: { primary: isOnSearchPage ? null : 'var(--surface)' },
                            dark: { primary: isOnSearchPage ? null : '' }
                        }" 
                    />
                </q-btn>  -->

                <q-btn flat dense round aria-label="Menu" @click="toggleDrawer">
                    <SvgIcon src="svgs/hamburg-menu.svg" size="sm" :custom-colors="{
                        light: { primary: 'var(--surface)' }
                    }" />
                </q-btn>

            </q-toolbar>
        </q-footer>

        <!-- About dialog -->
        <q-dialog 
            v-model="aboutDialog"
            backdrop-filter="blur(4px)"
        >
            <q-card class="q-pa-sm">
                <div class="row justify-center items-center full-width" style="position: relative;">
                    <SvgIcon
                        src="svgs/hmm-logo-round.svg"
                        size="xl"
                        type="primary"
                    />
                    <!-- TODO: Could put this in a button so we could use `v-close-popup` instead of `cursor-pointer` and `@click` -->
                    <div @click="aboutDialog = false" class="cursor-pointer q-pa-xs" style="position: absolute; right: 0; top: 0;">
                        <SvgIcon
                            src="svgs/close.svg" 
                            size="sm" 
                            type="primary" 
                        />
                    </div>
                </div>

                <q-toolbar align="center">
                    <q-toolbar-title><span class="text-h5 text-weight-bold">Tile Server</span></q-toolbar-title>
                </q-toolbar>

                <q-card-section class="text-body1">
                    <span class="text-primary text-weight-bold">This is just a POC for serving map tiles for an offline first map app using your own tile server</span> 
                </q-card-section>
            </q-card>
        </q-dialog>

    </q-layout>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useFullscreen } from '@vueuse/core';
import { mapConfig, setMapStyle, isTransitioningMapStyle } from 'stores/mapStore';
import { isPWA, refreshApp } from 'src/scripts/utils';
import SvgIcon from 'src/components/SvgIcon.vue';

const { isFullscreen, toggle } = useFullscreen();
const $q = useQuasar();


// Drawer behavior:
// - Desktop (>sm): always visible, starts minimized (miniState)
// - Mobile (<md): closed by default, overlay when toggled open
// - Mobile → Desktop: drawer opens automatically (via show-if-above), mini enabled on first view - then state takes over
// - Desktop → Mobile: drawer closes
// - Drawer can only be toggled on Mobile
// - Opening drawer on mobile disables mini, so it transitions to full desktop drawer
const drawerOpen = ref($q.screen.gt.sm);
const miniState: Ref<boolean> = ref(true);
const aboutDialog: Ref<boolean> = ref(false);

// When switching from mobile to desktop, reset drawer state.
// If not the transition from overlay to no overlay does not work.
// The `show-if-above` prop on q-drawer ensures it goes back to opened
watch(() => $q.screen.lt.md, (isMobile, wasMobile) => {
    if (wasMobile && !isMobile) {
        drawerOpen.value = false;
    }
});

watch(() => $q.dark.isActive, (isDark) => {
    mapConfig.value.color_mode = isDark ? 'night' : 'day';

    if (mapConfig.value.tiles_type === 'default') {
        setMapStyle('default');
    }
});

function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value;
    // If the drawer is open on mobile, that should transition to no mini-state (full drawer) on desktop (>sm breakpoint)
    miniState.value = !drawerOpen.value;
}
</script>
