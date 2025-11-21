import { GoogleGenAI, Type } from "@google/genai";
import { InsightResponse, DataPoint } from '../types';

const getClient = (userKey?: string) => {
    let apiKey = userKey;
    
    // If no user key provided, try the environment variable
    if (!apiKey) {
        try {
            if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
                apiKey = process.env.API_KEY;
            }
        } catch (e) {
            // Ignore env errors
        }
    }
    
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export const generateMarketInsight = async (
  selectedMacros: string[],
  selectedAssets: string[],
  timeRange: string,
  dataSummary: Partial<DataPoint>[],
  userApiKey?: string // Accept optional user key
): Promise<InsightResponse> => {
  const ai = getClient(userApiKey);
  
  if (!ai) {
    return {
      title: "API Key Missing",
      content: "Please enter your Gemini API key to generate insights.",
      keyTakeaway: "Setup required."
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
      title: "Analysis Failed",
      content: "We couldn't generate an insight at this moment. Please check your API key or try again later.",
      keyTakeaway: "API Error"
    };
  }
};