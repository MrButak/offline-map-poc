PWA assests are generated using [pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator)

```
npx pwa-asset-generator path_to_base_image path_to_output_dir /
--background "#fef3c7" /
--opaque true /
--padding "15%" /
--type png /
--manifest path_to_manifest.json /
--index path_to_index.html /
--favicon /
--maskable true
```

**Note:**
The generated paths in `index.html` and `manifest.json` will include a public/ prefix.
In Quasar, public/ is already treated as the root, so we need remove that prefix.
Just check the existing asset paths to match the expected format.
