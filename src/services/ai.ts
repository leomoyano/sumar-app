import Groq from "groq-sdk";
import { DEFAULT_CATEGORIES } from "@/types";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({
  apiKey: API_KEY || "",
  dangerouslyAllowBrowser: true // Necesario para demostración en frontend
});

export interface ParsedExpense {
  name: string;
  amount: number;
  tags: string[];
}

export const parseExpenseWithAI = async (text: string): Promise<ParsedExpense | null> => {
  if (!API_KEY) {
    console.error("Groq API Key not found");
    return null;
  }

  try {
    const categoriesStr = DEFAULT_CATEGORIES.join(", ");
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente financiero experto. Extrae información de gastos en JSON.
          
          Categorías Disponibles: ${categoriesStr}

          Formato de salida:
          {
            "name": "Nombre Limpio y Descriptivo",
            "amount": número,
            "tags": ["CategoríaElegida", "EtiquetaOpcional"]
          }

          Reglas:
          1. Monto: Extrae como número puro (ej: 45k -> 45000).
          2. name: Normaliza el nombre (ej: "pagamos coto" -> "Supermercado Coto").
          3. tags: 
             - El PRIMER tag DEBE ser una de las Categorías Disponibles mencionadas arriba.
             - El SEGUNDO tag puede ser una etiqueta descriptiva (ej: "Salidas", "Regalos").
          4. Devuelve SOLO el JSON.`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ParsedExpense;
  } catch (error) {
    console.error("Error parsing expense with Groq:", error);
    return null;
  }
};

export const detectForgottenExpenses = async (
  previousExpenses: { name: string; amount: number }[],
  currentExpenses: { name: string; amount: number }[]
): Promise<string[]> => {
  if (!API_KEY || previousExpenses.length === 0) return [];

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un analista financiero. Tu tarea es comparar los gastos del mes pasado con los de este mes e identificar cuáles se ha olvidado cargar el usuario.
          Gastos Mes Pasado: ${JSON.stringify(previousExpenses)}
          Gastos Mes Actual: ${JSON.stringify(currentExpenses)}

          Identifica gastos que son recurrentes (pagos de servicios, suscripciones, alquiler, gimnasio, etc.) que estaban el mes pasado pero NO están en el actual.
          Ignora gastos ocasionales (compras específicas, salidas únicas).

          Devuelve exclusivamente un JSON con formato:
          {
            "forgotten": ["Nombre del Gasto 1", "Nombre del Gasto 2"]
          }
          Si no detectas ninguno, devuelve el array vacío. Devuelve SOLO el JSON.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return parsed.forgotten || [];
  } catch (error) {
    console.error("Error detecting forgotten expenses:", error);
    return [];
  }
};
