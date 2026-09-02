import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcSUvG_WU1iYl4JvbUIju3ibZMQVGou9U",
  authDomain: "studio-7092921630-d9df5.firebaseapp.com",
  projectId: "studio-7092921630-d9df5",
  storageBucket: "studio-7092921630-d9df5.firebasestorage.app",
  messagingSenderId: "60741729745",
  appId: "1:60741729745:web:9637d7e0434ffb504834f0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Múltiplas instâncias abertas. Feche as outras para o offline funcionar.');
  } else if (err.code == 'unimplemented') {
    console.warn('O ambiente atual não suporta persistência offline.');
  }
});