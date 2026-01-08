import { openDB, IDBPDatabase } from 'idb';

// Connection pooling so indexDB is not opened for every request
let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = initDB();
    }
    return dbPromise;
};

// Initialize IndexedDB with all needed object stores
export async function initDB(): Promise<IDBPDatabase> {
    return openDB('offline-map-cache', 1, {
        upgrade(db) {
            // Create tiles store if it doesn't exist
            if (!db.objectStoreNames.contains('tiles')) {
                db.createObjectStore('tiles');
            }
        },
    });
};

// Check if tile exists in IndexedDB cache
export async function getFromIndexDb<T>(storeName: string, key: string): Promise<T | null> {
    try {
        const db = await getDB();
        return await db.get(storeName, key);

    } catch (error) {
        console.error('Error reading from indexDB:', error);
        return null;
    }
}

// Store tile in IndexedDB cache
export async function storeInIndexDb<T>(storeName: string, key: string, dataToStore: T): Promise<void> {
    try {
        console.log(`[Storage] Storing tile. tile key: ${key}`);

        const db = await getDB();
        await db.put(storeName, dataToStore, key);

    } catch (error) {
        console.error('Error storing in indexDB:', error);
    }
};
