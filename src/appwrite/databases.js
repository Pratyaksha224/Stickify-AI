import { ID, Query } from 'appwrite';
import {
    databases,
    storage,
    DB_ID,
    COL_NOTES,
    COL_SHAPES,
    COL_AIMETA,
    COL_IMAGES,
    BUCKET_IMAGES,
} from './config';

// ─────────────────────────────────────────────────────────────────────────────
// Generic CRUD factory backed by Appwrite Database
// Keeps the same public API as the old Dexie makeCrud so no component changes.
// ─────────────────────────────────────────────────────────────────────────────
const makeCrud = (collectionId, userId) => ({
    create: async (payload, id = ID.unique()) => {
        const doc = await databases.createDocument(
            DB_ID,
            collectionId,
            id,
            { userId, ...payload }
        );
        return doc;
    },

    update: async (id, payload) => {
        const doc = await databases.updateDocument(DB_ID, collectionId, id, payload);
        return doc;
    },

    delete: async (id) => {
        await databases.deleteDocument(DB_ID, collectionId, id);
        return { success: true };
    },

    get: async (id) => {
        const doc = await databases.getDocument(DB_ID, collectionId, id);
        return doc;
    },

    list: async () => {
        const result = await databases.listDocuments(DB_ID, collectionId, [
            Query.equal('userId', userId),
            Query.limit(500),
        ]);
        return { documents: result.documents, total: result.total };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Special CRUD for canvas images — files go to Appwrite Storage Bucket,
// only the fileId reference is stored in the database document.
// ─────────────────────────────────────────────────────────────────────────────
const makeImageCrud = (userId) => ({
    /**
     * payload should contain { src, position, size } where src is a base64 data URL or File.
     * We upload the file to Storage then store the fileId in the DB.
     */
    create: async (payload, id = ID.unique()) => {
        let fileId = payload.fileId;

        // If a raw base64 src is passed, convert and upload it
        if (!fileId && payload.src) {
            const file = dataUrlToFile(payload.src, `canvas_${id}.png`);
            const uploaded = await storage.createFile(BUCKET_IMAGES, ID.unique(), file);
            fileId = uploaded.$id;
        }

        const doc = await databases.createDocument(
            DB_ID,
            COL_IMAGES,
            id,
            { userId, fileId, position: payload.position, size: payload.size }
        );

        // Attach a resolved src URL so callers work without changes
        doc.src = storage.getFileView(BUCKET_IMAGES, fileId);
        return doc;
    },

    update: async (id, payload) => {
        const doc = await databases.updateDocument(DB_ID, COL_IMAGES, id, payload);
        if (doc.fileId) {
            doc.src = storage.getFileView(BUCKET_IMAGES, doc.fileId);
        }
        return doc;
    },

    delete: async (id) => {
        // Fetch to get fileId then delete both storage file and DB doc
        try {
            const doc = await databases.getDocument(DB_ID, COL_IMAGES, id);
            if (doc.fileId) {
                await storage.deleteFile(BUCKET_IMAGES, doc.fileId);
            }
        } catch (_) { /* ignore if file missing */ }
        await databases.deleteDocument(DB_ID, COL_IMAGES, id);
        return { success: true };
    },

    get: async (id) => {
        const doc = await databases.getDocument(DB_ID, COL_IMAGES, id);
        if (doc.fileId) {
            doc.src = storage.getFileView(BUCKET_IMAGES, doc.fileId);
        }
        return doc;
    },

    list: async () => {
        const result = await databases.listDocuments(DB_ID, COL_IMAGES, [
            Query.equal('userId', userId),
            Query.limit(500),
        ]);
        // Attach resolved src URLs
        result.documents = result.documents.map(doc => {
            if (doc.fileId) {
                doc.src = storage.getFileView(BUCKET_IMAGES, doc.fileId);
            }
            return doc;
        });
        return { documents: result.documents, total: result.total };
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: convert a base64 data URL to a File object for upload
// ─────────────────────────────────────────────────────────────────────────────
function dataUrlToFile(dataUrl, filename) {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new File([array], filename, { type: mime });
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory: creates a user-scoped cloud db object with the same shape
// as the old createUserDb() from Dexie — so NoteContext.jsx is unchanged.
// ─────────────────────────────────────────────────────────────────────────────
export const createCloudDb = (userId) => ({
    notes:        makeCrud(COL_NOTES,  userId),
    canvasShapes: makeCrud(COL_SHAPES, userId),
    aiMeta:       makeCrud(COL_AIMETA, userId),
    canvasImages: makeImageCrud(userId),
});

// ─────────────────────────────────────────────────────────────────────────────
// Legacy export kept so old imports don't break during transition
// ─────────────────────────────────────────────────────────────────────────────
export const createUserDb = createCloudDb;