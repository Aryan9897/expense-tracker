import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type ProfileData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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
        // Overwrite the profile to avoid retaining removed fields.
        await setDoc(docRef, data);
    }
};
