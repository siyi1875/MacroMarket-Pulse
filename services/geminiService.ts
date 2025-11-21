import { GoogleGenAI, Type } from "@google/genai";
import { InsightResponse, DataPoint } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const generateMarketInsight = async (
  selectedMacros: string[],
  selectedAssets: string[],
  timeRange: string,
  dataSummary: Partial<DataPoint>[]
): Promise<InsightResponse> => {
  const ai = getClient();
  if (!ai) {
    return {
      title: "API Key Missing",
      content: "Please configure your Gemini API key to receive AI-powered market insights.",
      keyTakeaway: "No data available."
    };
  }

  const prompt = `
    You are a friendly financial educator for primary school students or beginners.
    Analyze the relationship between the following selected factors:
    
    Macro Factors: ${selectedMacros.join(', ')}
    Assets: ${selectedAssets.join(', ')}
    Timeframe: ${timeRange}

    Here is a simplified sample of the data points (Start, Middle, End):
    ${JSON.stringify(dataSummary)}

    Explain how the macro factors (like interest rates or money supply) likely influenced the asset prices.
    Keep it simple. Use analogies (e.g., "Interest rates are like gravity...").
    
    Return the response in strictly valid JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful financial analyst dashboard assistant. Always return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyTakeaway: { type: Type.STRING }
          },
          required: ["title", "content", "keyTakeaway"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text) as InsightResponse;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Analysis Unavailable",
      content: "We couldn't generate an insight at this moment. The markets are complex!",
      keyTakeaway: "Try changing your filters."
    };
  }
};