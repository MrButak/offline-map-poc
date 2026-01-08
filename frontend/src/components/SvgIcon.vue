<!-- Example usage simple -->
<!-- <SvgIcon 
    src="svgs/logo.svg" 
    type="primary" 
    size="xl" 
/> -->

<!-- Example usage with custom colors -->
<!-- <SvgIcon 
    src="svgs/logo.svg" 
    size="xl" 
    :custom-colors="{
        light: { 
            primary: '#000000',  // Black icon
            stroke: '#dc2626'    // Red accent/outline
        },
        dark: { 
            primary: '#ffffff',  // White icon
            stroke: '#f43f5e'    // Electric pink accent
        }
    }" 
/> -->

<!-- Example with custom colors that use a named defined SCSS variable (crated in quasar.variables.scss) -->
 <!-- Here since no value is supplied for dark, it will default to primary-dark -->
 <!-- <SvgIcon 
    src="svgs/map.svg"
    size="sm"
    :custom-colors="{
        light: { primary: 'var(--surface)' }
    }" 
/> -->

<template>
    <div
        :style="{ 
            width: `${actualWidth}px`, 
            height: `${actualHeight}px` 
        }"
        v-html="processedSvg"
    />
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar, getCssVar } from 'quasar'

const $q = useQuasar();

const props = defineProps({
    src: { type: String, required: true },
    type: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    customColors: { type: Object, default: () => ({}) }
});

const svgContent = ref('')

// Size presets
const sizes = {
    xxs: 8, xs: 16, sm: 24, md: 32, lg: 40, xl: 48, xxl: 56
}

const actualWidth = computed(() => props.width || sizes[props.size] || 32)
const actualHeight = computed(() => props.height || sizes[props.size] || 32)

// Get active custom colors based on dark mode
const activeCustomColors = computed(() => {
    const isDark = $q.dark.isActive
    return isDark ? (props.customColors.dark || {}) : (props.customColors.light || {})
})

// Default colors - reactive to dark mode
const defaultColors = computed(() => {
    const isDark = $q.dark.isActive
    const themeColor = getCssVar(props.type) || getCssVar('primary')

    return {
        // TODO: Use named vars. Can we var(--background)
        primary: themeColor,
        stroke: isDark ? '#e5e7eb' : '#1f2937',
        background: isDark ? '#1f2937' : '#ffffff'
    }
})

// Process SVG - just replace the CSS variables
const processedSvg = computed(() => {
    if (!svgContent.value) return '';

    const colors = {
        primary: activeCustomColors.value.primary || defaultColors.value.primary,
        stroke: activeCustomColors.value.stroke || defaultColors.value.stroke,
        background: activeCustomColors.value.background || defaultColors.value.background
    }

    return svgContent.value
        .replace(/var\(--primary-color\)/g, colors.primary)
        .replace(/var\(--stroke-color\)/g, colors.stroke)
        .replace(/var\(--bg-color\)/g, colors.background)
        .replace(/<svg/, `<svg width="${actualWidth.value}" height="${actualHeight.value}"`)
})

// Load SVG
const loadSvg = async () => {
    try {
        const response = await fetch(props.src);
        svgContent.value = await response.text();

    } catch (error) {
        console.error('Error loading SVG:', error);
        // Fallback SVG
        const colors = {
            primary: activeCustomColors.value.primary || defaultColors.value.primary,
            stroke: activeCustomColors.value.stroke || defaultColors.value.stroke
        };
        svgContent.value = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="${actualWidth.value}" height="${actualHeight.value}">
                <circle cx="12" cy="12" r="10" fill="${colors.primary}" stroke="${colors.stroke}" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" font-size="12" fill="${colors.stroke}">?</text>
            </svg>
        `;
    }
};

// Reload svg if image changes
watch(() => props.src, loadSvg);

onMounted(loadSvg);
</script>
