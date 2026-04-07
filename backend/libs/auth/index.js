import admin from "firebase-admin";
import { errorResponse } from "../http/response.js";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Returns the decoded token (contains uid, email, etc.) or an error response.
 */
export async function verifyAuth(event) {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: errorResponse(401, "Missing or invalid Authorization header") };
  }

  const idToken = authHeader.slice(7);

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return { userId: decoded.uid };
  } catch (err) {
    console.error("Token verification failed", err);
    return { error: errorResponse(401, "Invalid or expired token") };
  }
}
