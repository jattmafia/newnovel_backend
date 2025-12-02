import { MongoClient, Db } from 'mongodb';
import { config } from './env';

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectDatabase(): Promise<Db> {
    if (db) {
        return db;
    }

    try {
        const mongoUri = config.mongoUri;
        client = new MongoClient(mongoUri);

        await client.connect();
        console.log('✓ Connected to MongoDB');

        db = client.db(config.dbName);
        return db;
    } catch (error) {
        console.error('✗ Failed to connect to MongoDB:', error);
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    if (client) {
        await client.close();
        console.log('✓ Disconnected from MongoDB');
        db = null;
        client = null;
    }
}

export function getDatabase(): Db {
    if (!db) {
        throw new Error('Database not connected. Call connectDatabase first.');
    }
    return db;
}
