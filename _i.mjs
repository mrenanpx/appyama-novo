import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, getDocs } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDcSUvG_WU1iYl4JvbUIju3ibZMQVGou9U",
  authDomain: "studio-7092921630-d9df5.firebaseapp.com",
  projectId: "studio-7092921630-d9df5",
  storageBucket: "studio-7092921630-d9df5.firebasestorage.app",
  messagingSenderId: "60741729745",
  appId: "1:60741729745:web:9637d7e0434ffb504834f0"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const snap = await getDocs(query(collection(db, "products"), orderBy("order", "asc")));
const items = [];
snap.forEach(d => items.push({ id: d.id, ...d.data() }));
const W = ['MARCA PÁGINA', 'CARTÃO DE VISITA', 'SANTINHO', 'CRACHÁ'];
for (const sub of W) {
  const arr = items.filter(i => (i.subCategory || '') === sub);
  console.log(`\n==== ${sub} =====`);
  arr.forEach(i => console.log(`o=${i.order} id=${i.id} name=[${i.name}] qty=${i.quantity} med=${i.measure} desc=${(i.description || '').slice(0, 45)} pt=[${i.printType}] R$=${i.price}`));
}
