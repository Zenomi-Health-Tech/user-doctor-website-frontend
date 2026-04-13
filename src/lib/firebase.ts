import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCuJcb1izu5OZbmYWDh3_ezvI6_W4W6aiU",
  authDomain: "zenomihealth.firebaseapp.com",
  projectId: "zenomihealth",
  storageBucket: "zenomihealth.firebasestorage.app",
  messagingSenderId: "501849278705",
  appId: "1:501849278705:web:394961928cdd8a76204150",
  measurementId: "G-L9HRB0GWME",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
