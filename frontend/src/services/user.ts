import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type ProfileData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    company: string;
    bio: string;
};

export const UserService = {
    async getUserProfile(uid: string): Promise<ProfileData | null> {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as ProfileData;
        } else {
            return null;
        }
    },

    async updateUserProfile(uid: string, data: ProfileData): Promise<void> {
        const docRef = doc(db, 'users', uid);
        // merge: true ensures we don't overwrite if we only want to update partial fields later
        // but here we are usually saving the whole form.
        await setDoc(docRef, data, { merge: true });
    }
};
