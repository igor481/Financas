import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { transactions, goals } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Analise os dados financeiros abaixo e gere um relatório estruturado em JSON:
Transações: ${JSON.stringify(transactions)}
Metas: ${JSON.stringify(goals)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ result: text });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar análise" });
  }
}
