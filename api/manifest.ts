
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { desire } = await req.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key missing on server' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user desires to manifest: "${desire}". 
      Act as a spiritual manifestation coach. 
      Create a personalized manifestation plan containing:
      1. 5 powerful, unique, and creative present-tense 'I am' affirmations.
      2. A 'scripting' journal entry (approx 80-100 words) written in the present tense as if the desire has already manifested.
      3. 3 vivid visualization scenes.
      4. 3 practical action steps.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            affirmations: { type: Type.ARRAY, items: { type: Type.STRING } },
            scripting: { type: Type.STRING },
            visualizations: { type: Type.ARRAY, items: { type: Type.STRING } },
            actions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["affirmations", "scripting", "visualizations", "actions"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return new Response(response.text, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
