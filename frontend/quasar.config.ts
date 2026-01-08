// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
    // Example output on console:
    /*
    {
      dev: true,
      prod: false,
      mode: { spa: true },
      modeName: 'spa',
      target: {},
      targetName: undefined,
      arch: {},
      archName: undefined,
      debug: undefined
    }
    */

    // context gets generated based on the parameters
    // with which you run "quasar dev" or "quasar build"

    return {
        // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
        // preFetch: true,

        // app boot file (/src/boot)
        // --> boot files are part of "main.js"
        // https://v2.quasar.dev/quasar-cli-vite/boot-files
        boot: [
            'set-map-config'
        ],

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
        css: [
            'app.scss',
            '~maplibre-gl/dist/maplibre-gl.css'
        ],

        // https://github.com/quasarframework/quasar/tree/dev/extras
        extras: [
            // 'ionicons-v4',
            // 'mdi-v7',
            // 'fontawesome-v6',
            // 'eva-icons',
            // 'themify',
            // 'line-awesome',
            // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

            'roboto-font', // optional, you are not bound to it
            'material-icons', // optional, you are not bound to it
        ],

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
        build: {
            target: {
                browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
                node: 'node20'
            },

            typescript: {
                strict: true,
                vueShim: true
                // extendTsConfig (tsConfig) {}
            },

            vueRouterMode: 'history', // available values: 'hash', 'history'
            // vueRouterBase,
            // vueDevtools,
            // vueOptionsAPI: false,

            // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

            // publicPath: '/',
            // analyze: true,
            // env: {},
            // rawDefine: {}
            // ignorePublicFolder: true,
            // minify: false,
            // polyfillModulePreload: true,
            // distDir

            // extendViteConf (viteConf) {},
            // viteVuePluginOptions: {},

            // vitePlugins: [
            //   [ 'package-name', { ..pluginOptions.. }, { server: true, client: true } ]
            // ]
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
        devServer: {
            https: false,

            // if devServer === true, Paste this into the console to use https in dev
            // tmole 80
            // http://b8ootd-ip-157-211-195-182.tunnelmole.com is forwarding to localhost:80
            // https://b8ootd-ip-157-211-195-182.tunnelmole.com is forwarding to localhost:80

            // # ...and use the HTTPS url shown in the output
            open: false // opens browser window automatically
        },

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
        framework: {
            cssAddon: true,
            config: { },

            // iconSet: 'material-icons', // Quasar icon set
            // lang: 'en-US', // Quasar language pack

            // For special cases outside of where the auto-import strategy can have an impact
            // (like functional components as one of the examples),
            // you can manually specify Quasar components/directives to be available everywhere:
            //
            // components: [],
            // directives: [],

            // Quasar plugins
            plugins: [
                'Notify',
                'AppFullscreen',
                'Dialog'
            ]
        },

        // animations: 'all', // --- includes all animations
        // https://v2.quasar.dev/options/animations
        animations: [],

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
        sourceFiles: {
            rootComponent: 'src/App.vue',
            router: 'src/router/index',
            // store: 'src/store/index',
            pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
            pwaServiceWorker: 'src-pwa/custom-service-worker',
            pwaManifestFile: 'src-pwa/manifest.json',
            // electronMain: 'src-electron/electron-main',
            // electronPreload: 'src-electron/electron-preload'
            // bexManifestFile: 'src-bex/manifest.json
        },


        // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
        pwa: {
            workboxMode: 'InjectManifest', // 'GenerateSW' or 'InjectManifest'
            swFilename: 'sw.js',
            swSrc: 'src-pwa/custom-service-worker.ts', // Path to your custom service worker source file
            manifestFilename: 'manifest.json',
            // extendManifestJson (json) {},
            useCredentialsForManifestTag: false,
            injectPwaMetaTags: false,
            // extendPWACustomSWConf (esbuildConf) {},
            // extendGenerateSWOptions (cfg) {},
            // extendInjectManifestOptions (cfg) {}
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
        // bex: {
        //   // extendBexScriptsConf (esbuildConf) {},
        //   // extendBexManifestJson (json) {},

        //   /**
        //    * The list of extra scripts (js/ts) not in your bex manifest that you want to
        //    * compile and use in your browser extension. Maybe dynamic use them?
        //    *
        //    * Each entry in the list should be a relative filename to /src-bex/
        //    *
        //    * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
        //    */
        //   extraScripts: []
        // }
    }
});
