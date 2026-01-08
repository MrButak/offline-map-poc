export interface MapConfig {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch:  number;
    color_mode?: 'day' | 'night';
    tiles_type?: 'default' | 'satellite';
};

// For indexDB storage
export interface TileData {
    data: ArrayBuffer;
    timestamp: number;
    url: string;
};

