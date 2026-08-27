import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const initialProducts = [
  { id: "G001", category: "GRÁFICA", subCategory: "CARTÃO DE VISITA", name: "CARTÃO FRENTE", quantity: "500", measure: "48x88mm", description: "Couché Brilho 250g - 4x0 - Verniz Total Brilho Frente - Refile", calcType: "Fixo", price: 79, deadline: "3 à 5 dias úteis", order: 1 },
  { id: "G002", category: "GRÁFICA", subCategory: "CARTÃO DE VISITA", name: "CARTÃO FRENTE", quantity: "1.000", measure: "48x88mm", description: "Couché Brilho 250g - 4x0 - Verniz Total Brilho Frente - Refile", calcType: "Fixo", price: 112, deadline: "3 à 5 dias úteis", order: 2 }
];

export async function seedDatabase() {
  try {
    for (const item of initialProducts) {
      await setDoc(doc(db, "products", item.id), item);
    }
    console.log("Enviado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
  }
}