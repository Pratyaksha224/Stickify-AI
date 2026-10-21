import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_PROJECT_ID || '');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Collection & bucket IDs from environment variables
const DB_ID      = import.meta.env.VITE_DATABASE_ID;
const COL_NOTES  = import.meta.env.VITE_COLLECTION_NOTES_ID;
const COL_SHAPES = import.meta.env.VITE_COLLECTION_SHAPES_ID;
const COL_AIMETA = import.meta.env.VITE_COLLECTION_AIMETA_ID;
const COL_IMAGES = import.meta.env.VITE_COLLECTION_IMAGES_ID;
const BUCKET_IMAGES = import.meta.env.VITE_BUCKET_IMAGES_ID;

export { client, account, databases, storage, DB_ID, COL_NOTES, COL_SHAPES, COL_AIMETA, COL_IMAGES, BUCKET_IMAGES };