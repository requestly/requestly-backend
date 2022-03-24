import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseServiceAccountKey } from '../configs/secrets';

initializeApp({
    credential: cert(firebaseServiceAccountKey)
});
  
export const firestoreDb = getFirestore();
