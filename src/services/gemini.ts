import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini client using the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFaceFrame(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Analyze this image of a person studying. Determine if they are focused on the screen, or distracted (looking away, looking at phone, sleeping, or not present). Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focused: { type: Type.BOOLEAN, description: "True if the person is looking at the screen and appears focused." },
            distraction_type: { type: Type.STRING, description: "Type of distraction: 'phone', 'away', 'sleepy', 'not_present', or 'none'" },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 100" }
          },
          required: ["focused", "distraction_type", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) return { focused: true, distraction_type: 'none', confidence: 100 };
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing face frame:", error);
    // Fallback if API fails
    return { focused: true, distraction_type: 'none', confidence: 100 };
  }
}

export async function generatePostSessionInsights(sessionData: any) {
  try {
    const prompt = `
Based on this study session data:
- Duration: ${sessionData.duration} minutes
- Focus percentage: ${sessionData.focusPercentage}%
- Distractions: ${sessionData.distractionsCount} instances
- Time of day: ${sessionData.timeOfDay}
- User's recent pattern: ${sessionData.recentPattern || 'Unknown'}

Generate:
1. A motivating one-line summary
2. 2-3 specific observations
3. 1 personalized tip

Keep it concise and encouraging. Format as JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            tip: { type: Type.STRING }
          },
          required: ["summary", "observations", "tip"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      summary: "Great job completing your session!",
      observations: ["You stayed committed to your goal.", "Every minute counts towards your success."],
      tip: "Take a short break to recharge before your next session."
    };
  }
}
