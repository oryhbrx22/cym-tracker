// Database utility wrapper for Firebase Firestore
// This replaces the Trickle DB implementation for portability

const TABLE_NAME = 'cym_submission';

// Helper to format Firestore docs to match Trickle DB shape { objectId, objectData }
// so we don't have to rewrite the entire frontend logic.
const formatDoc = (doc) => ({
    objectId: doc.id,
    objectData: doc.data()
});

const DB = {
    // Save submission (create or update)
    saveSubmission: async (data) => {
        try {
            const db = window.firebaseDB;
            if (!db) throw new Error("Firebase DB not initialized");

            // Ensure status is active for new submissions if not specified
            if (!data.status) data.status = 'active';

            // Check for existing duplicate (Logic ported from original db.js)
            // Firestore doesn't support complex multi-field unique constraints easily without ID,
            // so we query first.
            const collectionRef = db.collection(TABLE_NAME);
            const q = collectionRef
                .where('member_name', '==', data.member_name)
                .where('year', '==', data.year)
                .where('month', '==', data.month)
                .where('submission_type', '==', data.submission_type);
            
            const querySnapshot = await q.get();

            if (!querySnapshot.empty) {
                // Update existing
                const docId = querySnapshot.docs[0].id;
                await collectionRef.doc(docId).update(data);
                return { objectId: docId, objectData: data };
            } else {
                // Create new
                const docRef = await collectionRef.add(data);
                return { objectId: docRef.id, objectData: data };
            }
        } catch (error) {
            console.error("DB Save Error:", error);
            throw error;
        }
    },

    // Get all submissions
    getSubmissions: async () => {
        try {
            const db = window.firebaseDB;
            if (!db) throw new Error("Firebase DB not initialized");

            const snapshot = await db.collection(TABLE_NAME).get();
            return snapshot.docs.map(formatDoc);
        } catch (error) {
            console.error("DB Fetch Error:", error);
            throw error;
        }
    },
    
    // Get submissions by month/year
    getSubmissionsByDate: async (month, year) => {
        try {
            const db = window.firebaseDB;
            if (!db) throw new Error("Firebase DB not initialized");

            // Firestore query
            // Note: Composite index might be required for this query in Firebase Console
            // If it fails, check console for the link to create index.
            // Fallback: fetch all and filter client side if index is missing (safer for quick start)
            
            // Client-side filtering approach to avoid "Index Required" errors for the user immediately
            const allDocs = await DB.getSubmissions();
            return allDocs.filter(item => 
                item.objectData.month === parseInt(month) && 
                item.objectData.year === parseInt(year)
            );
        } catch (error) {
            console.error("DB Fetch By Date Error:", error);
            throw error;
        }
    },

    // Archive a submission
    archiveSubmission: async (id) => {
        try {
            const db = window.firebaseDB;
            if (!db) throw new Error("Firebase DB not initialized");

            await db.collection(TABLE_NAME).doc(id).update({ status: 'archived' });
            return { success: true };
        } catch (error) {
            console.error("DB Archive Error:", error);
            throw error;
        }
    },

    // Restore a submission
    restoreSubmission: async (id) => {
        try {
            const db = window.firebaseDB;
            if (!db) throw new Error("Firebase DB not initialized");

            await db.collection(TABLE_NAME).doc(id).update({ status: 'active' });
            return { success: true };
        } catch (error) {
            console.error("DB Restore Error:", error);
            throw error;
        }
    },

    // Delete a submission permanently
    deleteSubmission: async (id) => {
        try {
            const db = window.firebaseDB;
            if (!db) throw new Error("Firebase DB not initialized");

            await db.collection(TABLE_NAME).doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error("DB Delete Error:", error);
            throw error;
        }
    },

    // Save Push Subscription
    savePushSubscription: async ({ member_name, subscription }) => {
        try {
            const db = window.firebaseDB;
            if (!db) return;

            const table = 'cym_push_subscription';
            const keys = JSON.stringify(subscription.toJSON().keys);
            const endpoint = subscription.endpoint;
            const user_agent = navigator.userAgent;

            const collectionRef = db.collection(table);
            const q = collectionRef.where('endpoint', '==', endpoint);
            const snapshot = await q.get();

            if (!snapshot.empty) {
                // Update member name if changed
                const doc = snapshot.docs[0];
                if (doc.data().member_name !== member_name) {
                    await doc.ref.update({ member_name });
                }
                return formatDoc(doc);
            } else {
                const docRef = await collectionRef.add({
                    member_name,
                    endpoint,
                    keys_json: keys,
                    user_agent
                });
                return { objectId: docRef.id, objectData: { member_name, endpoint } };
            }
        } catch (error) {
            console.error("DB Push Sub Error:", error);
        }
    }
};