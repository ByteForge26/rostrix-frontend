import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  Messaging,
  onMessage,
} from "firebase/messaging";

export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.trim().length > 0,
);
const FIREBASE_MESSAGING_ENABLED = false;
let messagingPromise: Promise<Messaging | null> | undefined;

const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (!FIREBASE_MESSAGING_ENABLED || !hasFirebaseConfig) {
    return null;
  }

  if (!messagingPromise) {
    messagingPromise = (async () => {
      if (!(await isSupported())) {
        return null;
      }
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      return getMessaging(app);
    })().catch((error) => {
      console.warn("Firebase messaging is unavailable.", error);
      return null;
    });
  }

  return messagingPromise;
};

const requestForToken = async (): Promise<string> => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return "";
  }

  return getToken(messaging, {
    vapidKey: process.env.REACT_APP_FIREBASE_MESSAGING_VAPID_KEY,
  })
    .then((currentToken) => {
      if (currentToken) {
        return currentToken;
      }
      return "";
    })
    .catch((error) => {
      console.warn("Unable to get a Firebase messaging token.", error);
      return "";
    });
};

const onMessageListener = async () => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export { requestForToken, onMessageListener };
