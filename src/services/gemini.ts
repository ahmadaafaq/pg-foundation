import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateMapFilter = async (query: string, dataSummary: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an AI assistant for Parth Gautam, the owner of a foundation. 
            You help him analyze beneficiary data on a map of Bareilly city.
            
            Based on the user's query: "${query}", determine how to filter the map data.
            
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
            - explanation: A brief, professional response to Parth Gautam explaining what is being shown.
            - highlightWards: An array of ward IDs that need attention if applicable.
            
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

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      filter: {},
      explanation: "I'm sorry, I couldn't process that request. Showing all data.",
      highlightWards: [],
    };
  }
};
