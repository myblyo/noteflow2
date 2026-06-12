import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getProjectId(): string {
  return process.env.FIREBASE_PROJECT_ID ?? "noteflow2-18554";
}

function ensureFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({ projectId: getProjectId() });
  }
}

export async function verifyFirebaseIdToken(token: string): Promise<{
  uid: string;
  email?: string;
}> {
  ensureFirebaseAdmin();
  const decoded = await getAuth().verifyIdToken(token);
  return { uid: decoded.uid, email: decoded.email };
}
