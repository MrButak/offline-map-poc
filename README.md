# MapTileServe - Monorepo

This project uses npm workspaces to manage multiple related projects in a single repository.

## Project Structure
- **frontend**: Vue(Quasar) frontend for the app(PWA)

# To start the project:

## Add .env file to /frontent with the following properties:
**You'll need your Maptiler/Mapbox api keys for satllite imagery.**
```
VITE_MAPLIER_API_KEY=your_api_key
VITE_MAPBOX_API_KEY=your_api_key
VITE_BASE_FRONTEND_URL=http://localhost:9200/
TILE_SERVER_URL=https://tiles.yourdomain.com/
```
`npm i` in the root folder
`cd frontend`
`npm run dev-pwa`


