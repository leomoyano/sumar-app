import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface ParsedExpense {
  name: string;
  amount: number;
  tags: string[];
}

export const parseExpenseWithAI = async (text: string): Promise<ParsedExpense | null> => {
  if (!API_KEY) {
    console.error("Gemini API Key not found");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Eres un asistente financiero experto. Tu tarea es extraer información de un gasto a partir de una frase en lenguaje natural.
      La frase es: "${text}"

      Debes devolver exclusivamente un objeto JSON con el siguiente formato:
      {
        "name": "nombre descriptivo del gasto",
        "amount": número (el monto del gasto como número puro),
        "tags": ["etiqueta1", "etiqueta2"]
      }

      Reglas:
      1. El "name" debe ser corto y claro (ej: "Cena Don Julio", "Supermercado Coto").
      2. El "amount" debe ser el número que identifiques. Si dice "45 mil", pon 45000.
      3. Los "tags" deben ser categorías lógicas (ej: "comida", "salidas", "transporte", "supermercado"). Máximo 3 etiquetas.
      4. Si no puedes identificar el monto, pon 0 en "amount".
      5. Devuelve SOLO el JSON, sin texto adicional ni bloques de código.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().trim().replace(/```json/g, "").replace(/```/g, "");
    
    return JSON.parse(jsonText) as ParsedExpense;
  } catch (error) {
    console.error("Error parsing expense with Gemini:", error);
    return null;
  }
};
