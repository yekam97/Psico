import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAv1Soy4j_dYXs0SkEpJw6yDvpsrsyrBI8",
    authDomain: "healthsaas-c8a16.firebaseapp.com",
    projectId: "healthsaas-c8a16",
    storageBucket: "healthsaas-c8a16.firebasestorage.app",
    messagingSenderId: "999115836994",
    appId: "1:999115836994:web:4b04510b10483eb1e927db",
    measurementId: "G-PSC3MK0Q97"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics safely (only on client)
export const initAnalytics = async () => {
    if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) {
            return getAnalytics(app);
        }
    }
    return null;
};

export const storage = getStorage(app);
export default app;
