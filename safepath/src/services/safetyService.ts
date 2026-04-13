import { GoogleGenAI, Type } from "@google/genai";
import { Route, RouteSafety, SafetyFactor, SafetyReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeRouteSafety(
  start: string, 
  end: string, 
  timeOfDay: string,
  nearbyReports: SafetyReport[] = []
): Promise<RouteSafety> {
  const reportsContext = nearbyReports.length > 0 
    ? `Consider these community reports: ${nearbyReports.map(r => `${r.type}: ${r.description}`).join(', ')}`
    : '';

  const prompt = `Analyze the safety of a walking route from "${start}" to "${end}" at ${timeOfDay}. 
  ${reportsContext}
  
  Provide an overall safety score (0-100) and evaluate specific factors: 
  1. Street Lighting (Crucial for ${timeOfDay})
  2. Foot Traffic/Busy-ness
  3. Proximity to Emergency Services
  4. Historical Safety Data
  
  Return the analysis in a structured JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            factors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING, description: "A Lucide icon name like 'Sun', 'Users', 'Shield', 'History', 'Moon', 'AlertTriangle'" }
                },
                required: ["name", "score", "description", "icon"]
              }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["overallScore", "factors", "tips"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing route safety:", error);
    // Fallback data
    const isNight = timeOfDay.toLowerCase().includes('pm') || timeOfDay.toLowerCase().includes('night');
    return {
      overallScore: isNight ? 65 : 85,
      factors: [
        { name: "Street Lighting", score: isNight ? 60 : 95, description: isNight ? "Dimly lit in some areas." : "Excellent visibility.", icon: isNight ? "Moon" : "Sun" },
        { name: "Foot Traffic", score: 70, description: "Moderate pedestrian activity.", icon: "Users" }
      ],
      tips: ["Stay on main roads.", "Keep your phone charged."]
    };
  }
}

export async function getMockRoutes(start: string, end: string, timeOfDay: string, reports: SafetyReport[] = []): Promise<Route[]> {
  const safety1 = await analyzeRouteSafety(start, end, timeOfDay, reports);
  
  // Generate coordinates based on a base point (e.g. London)
  const baseLat = 51.505;
  const baseLng = -0.09;

  return [
    {
      id: "1",
      name: "Main Street Route (Safest)",
      distance: "1.2 km",
      duration: "15 mins",
      safety: safety1,
      coordinates: [
        [baseLat, baseLng],
        [baseLat + 0.005, baseLng - 0.01],
        [baseLat + 0.01, baseLng]
      ]
    },
    {
      id: "2",
      name: "Shortest Path",
      distance: "0.9 km",
      duration: "11 mins",
      safety: {
        overallScore: 45,
        factors: [
          { name: "Street Lighting", score: 30, description: "Poorly lit back alleys.", icon: "Moon" },
          { name: "Foot Traffic", score: 20, description: "Isolated area.", icon: "UserX" }
        ],
        tips: ["Avoid this route after dark.", "Travel in a group."]
      },
      coordinates: [
        [baseLat, baseLng],
        [baseLat + 0.003, baseLng + 0.005],
        [baseLat + 0.01, baseLng]
      ]
    }
  ];
}
