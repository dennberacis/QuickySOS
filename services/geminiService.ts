import { GoogleGenAI, Type } from "@google/genai";
import { EmergencyType, GeminiAdviceResponse } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Fallback advice if offline or API fails
const FALLBACK_ADVICE: Record<EmergencyType, GeminiAdviceResponse> = {
  [EmergencyType.MEDICAL]: {
    steps: ["Call emergency services immediately.", "Check for breathing and pulse.", "Apply pressure to bleeding."],
    safetyTip: "Stay calm and do not move the person if spinal injury is suspected."
  },
  [EmergencyType.VIOLENCE]: {
    steps: ["Move to a safe location immediately.", "Call emergency services.", "Hide if you cannot escape."],
    safetyTip: "Silence your phone and stay low."
  },
  [EmergencyType.ACCIDENT]: {
    steps: ["Ensure your own safety first.", "Check for injuries.", "Call emergency services."],
    safetyTip: "Do not move injured persons unless in immediate danger."
  },
  [EmergencyType.FIRE]: {
    steps: ["Evacuate immediately.", "Stay low to avoid smoke.", "Call fire department."],
    safetyTip: "Do not use elevators."
  },
  [EmergencyType.HARASSMENT]: {
    steps: ["Move to a crowded, well-lit area.", "Call a friend or authority.", "Record evidence if safe."],
    safetyTip: "Trust your instincts and leave the situation."
  },
  [EmergencyType.GENERAL]: {
    steps: ["Assess the situation.", "Call for help.", "Move to safety."],
    safetyTip: "Stay aware of your surroundings."
  }
};

export const getEmergencyAdvice = async (type: EmergencyType, locationContext?: string): Promise<GeminiAdviceResponse> => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key missing, using fallback.");
    return FALLBACK_ADVICE[type];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const prompt = `
      You are an emergency response expert. 
      The user is experiencing a ${type} emergency. 
      ${locationContext ? `Location context: ${locationContext}.` : ''}
      Provide 3 extremely concise, actionable immediate steps they should take, and 1 short safety tip.
      Keep it very short and direct.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 immediate actions"
            },
            safetyTip: {
              type: Type.STRING,
              description: "One crucial safety tip"
            }
          },
          required: ["steps", "safetyTip"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiAdviceResponse;
    }
    
    throw new Error("Empty response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_ADVICE[type];
  }
};