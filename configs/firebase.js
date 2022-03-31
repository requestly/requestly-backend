import { initializeApp } from "firebase/app";
import { CONFIG as GLOBAL_CONFIG } from "rq-proxy//requestly-master"; // TODO: add firebaseConfig
const firebaseApp = initializeApp(GLOBAL_CONFIG.firebaseConfig);

export default firebaseApp;