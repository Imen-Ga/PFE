import * as admin from "firebase-admin";

let cachedApp: admin.app.App | null = null;

const getServiceAccountFromEnv = (): admin.ServiceAccount => {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountJson) {
        const parsed = JSON.parse(serviceAccountJson) as {
            project_id?: string;
            client_email?: string;
            private_key?: string;
        };

        if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY incomplet (project_id/client_email/private_key manquants)");
        }

        return {
            projectId: parsed.project_id,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key.replace(/\\n/g, "\n"),
        };
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Config Firebase Admin invalide: definir FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (ou FIREBASE_SERVICE_ACCOUNT_KEY JSON)"
        );
    }

    return {
        projectId,
        clientEmail,
        privateKey,
    };
};

const getAdminApp = () => {
    if (cachedApp) {
        return cachedApp;
    }

    if (admin.apps.length > 0) {
        cachedApp = admin.app();
        return cachedApp;
    }

    const serviceAccount = getServiceAccountFromEnv();
    cachedApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId,
    });

    return cachedApp;
};

export const getAdminAuth = () => {
    return getAdminApp().auth();
};

export const getAdminDb = () => {
    return getAdminApp().firestore();
}