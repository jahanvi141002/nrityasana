import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass database ID as third parameter to initializeFirestore
// experimentalForceLongPolling ensures rock-solid connections in sandboxed iframe/Cloud Run environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      // Backend is reached and security rules are actively enforcing policies
      return;
    }
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn('Firebase client is offline or database initializing.');
    }
  }
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.error('Google Sign-In failed:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy,
  onSnapshot,
};
export type { FirebaseUser };
