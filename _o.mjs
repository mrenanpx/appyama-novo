import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, getDocs } from "firebase/firestore";
import { writeFile } from 'node:fs/promises';
const firebaseConfig = { apiKey: "AIzaSyDcSUvG_WU1iYl4JvbUIju3ibZMQVGou9U", authDomain: "studio-7092921630-d9df5.firebaseapp.com", projectId: "studio-7092921630-d9df5", storageBucket: "studio-7092921630-d9df5.firebasestorage.app", messagingSenderId: "60741729745", appId: "1:60741729745:web:9637d7e0434ffb504834f0" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const snap = await getDocs(query(collection(db, "products"), orderBy("order", "asc")));
const items = [];
snap.forEach(d => items.push({ id: d.id, ...d.data() }));
let out = '';
for (const need of ['CARTÃO DE VISITA', 'MARCA PÁGINA', 'CALENDÁRIO DE BOLSO', 'FOLHINHA COMERCIAL', 'SANTINHO', 'CRACHÁ']) {
  let arr = items.filter(i => (i.subCategory || '') === need);
  out += '==== ' + need + ' ====\n';
  arr.forEach(i => out += `o=${i.order} id=${i.id} name=[${i.name}] pt=[${i.printType}] desc=[${String(i.description||'').replace(/\r/g,'').replace(/\n/g,'~').slice(0,240)}] p=${i.price}\n`);
  out += '\n';
}
await writeFile('d:/PROJETOS/appyama-novo/_out.txt', out, 'utf8');
console.log('written');

