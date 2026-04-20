import { GoogleGenAI, Modality } from "@google/genai";

// Access the API key from process.env as per guidelines.
// In this environment, it's injected via vite.config.ts define.
const apiKey = process.env.GEMINI_API_KEY;

export const generateMapFilter = async (query: string, dataSummary: string) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI assistant for Parth Gautam, the owner of a foundation. 
              You help him analyze beneficiary data on a map of Bareilly city and manage the Command Centre.
              
              Based on the user's query: "${query}", determine how to filter the map data or if the Command Centre should be opened.
              
              Available categories:
              - healthcare (blue)
              - education (green)
              - issue_resolution (yellow)
              - smart_voter (purple)
              - direct_call (pink)
              - jobs (cyan)
              
              Available demographics/attributes in data:
              - age (number)
              - gender (male, female, other)
              - sentiment (happy, unhappy, neutral)
              - urgency (low, medium, high)
              - ward_id (number)
              
              Return a JSON object with:
              - filter: An object describing the filters to apply (e.g., { category: "education", gender: "female" })
              - explanation: A brief, professional response to Parth Gautam explaining what is being shown or what is happening.
              - highlightWards: An array of ward IDs that need attention if applicable.
              - action: A string "open_command_centre" if the user wants to see what's happening globally or in the command centre, otherwise null.
              
              Context of data: ${dataSummary}
              
              Return ONLY the JSON.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with a professional, Jarvis-like calm and helpful tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }, // Charon has a deeper, more professional tone
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini TTS");
    }

    return base64Audio;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};
