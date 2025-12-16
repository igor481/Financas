import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction, Goal, AIAdviceResponse } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const dashboardSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { 
      type: Type.STRING, 
      description: "Uma frase curta (max 30 palavras) de alerta ou incentivo sobre o saldo atual." 
    }
  },
  required: ["summary"]
};

const fullConsultantSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullAnalysis: {
      type: Type.OBJECT,
      properties: {
        healthScore: { type: Type.NUMBER, description: "Nota de 0 a 100." },
        status: { type: Type.STRING, enum: ["Crítico", "Alerta", "Saudável"] },
        analysis: { type: Type.STRING, description: "Análise profunda de padrões." },
        cutSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Onde cortar gastos." },
        investmentTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dicas de investimento (contexto Brasil)." }
      },
      required: ["healthScore", "status", "analysis", "cutSuggestions", "investmentTips"]
    }
  },
  required: ["fullAnalysis"]
};

export const getDashboardInsight = async (transactions: Transaction[]): Promise<string> => {
  const model = "gemini-2.5-flash";
  const recent = transactions.slice(0, 10).map(t => `${t.type}: ${t.description} R$${t.amount}`).join("\n");
  
  const prompt = `Analise estas últimas transações e gere um "insight flash" (max 30 palavras) para o dashboard do Easy Coin System. Seja motivacional ou de alerta. Dados: ${recent}`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: dashboardSchema }
    });
    return response.text ? JSON.parse(response.text).summary : "Sem dados suficientes.";
  } catch (e) {
    console.error(e);
    return "Mantenha o foco nas suas finanças!";
  }
};

export const getFullConsultancy = async (transactions: Transaction[], goals: Goal[]): Promise<AIAdviceResponse['fullAnalysis']> => {
  const model = "gemini-2.5-flash";
  
  const financialSummary = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Atue como o Consultor Financeiro AI do Easy Coin System.
    Dados Financeiros (Soma): ${JSON.stringify(financialSummary)}
    Transações Recentes: ${JSON.stringify(transactions.slice(0, 20))}
    Metas: ${JSON.stringify(goals)}
    
    Contexto: Brasil (Selic, Inflação).
    Gere um relatório completo.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: { 
        responseMimeType: "application/json", 
        responseSchema: fullConsultantSchema,
        systemInstruction: "Você é um consultor financeiro experiente."
      }
    });
    return response.text ? JSON.parse(response.text).fullAnalysis : undefined;
  } catch (e) {
    console.error(e);
    throw new Error("Erro na consultoria.");
  }
};