import Groq from "groq-sdk";

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
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente financiero experto. Extrae información de gastos en JSON.
          Formato:
          {
            "name": "nombre corto",
            "amount": número,
            "tags": ["etiqueta1", "etiqueta2"]
          }
          Reglas:
          1. Monto como número puro (si dice 45k, extrae 45000).
          2. Máximo 3 etiquetas.
          3. Devuelve SOLO el JSON.`
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
