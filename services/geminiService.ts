
import { GoogleGenAI, Type } from "@google/genai";
import { ManifestationResponse } from "../types";

let activeAudioContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;

export const stopSpeech = () => {
  if (activeSource) {
    try { activeSource.stop(); } catch (e) {}
    activeSource = null;
  }
  if (activeAudioContext) {
    try { if (activeAudioContext.state !== 'closed') activeAudioContext.close(); } catch (e) {}
    activeAudioContext = null;
  }
};

const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const pcmToAudioBuffer = (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer => {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

/**
 * SMART FALLBACK LOGIC:
 * First attempts to use the secure /api/manifest endpoint (for production/Vercel).
 * If the endpoint is missing (404) or fails to connect, it falls back to the client-side SDK.
 */
export const generateManifestationText = async (desire: string): Promise<ManifestationResponse> => {
  try {
    const response = await fetch('/api/manifest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desire }),
    });

    if (response.ok) {
      return await response.json();
    }
    
    // If it's a 404, we're likely in a preview environment without the backend running
    if (response.status !== 404) {
      const error = await response.json();
      throw new Error(error.error || 'Manifestation failed');
    }
  } catch (e: any) {
    // If it's a TypeError (Network error) or we want to force fallback, we continue
    console.warn("API route unavailable, falling back to client-side SDK...");
  }

  // FALLBACK: Use Client-Side SDK
  if (!process.env.API_KEY) {
    throw new Error("No API key found in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  return JSON.parse(response.text);
};

export const generateAffirmationAudio = async (text: string): Promise<AudioBuffer> => {
  let base64Audio = '';

  try {
    const response = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const result = await response.json();
      base64Audio = result.data;
    } else if (response.status !== 404) {
      throw new Error("Audio generation failed");
    }
  } catch (e) {
    console.warn("TTS API route unavailable, falling back to client-side SDK...");
  }

  // FALLBACK: Use Client-Side SDK if we didn't get audio from the API
  if (!base64Audio) {
    if (!process.env.API_KEY) throw new Error("No API key found.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Repeat after me. ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  }

  if (!base64Audio) throw new Error("Could not generate audio.");

  const bytes = decodeBase64(base64Audio);
  const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const buffer = pcmToAudioBuffer(bytes, tempCtx, 24000, 1);
  await tempCtx.close();
  return buffer;
};

export const speakAffirmation = async (text: string, onComplete?: () => void) => {
  stopSpeech();
  try {
    const buffer = await generateAffirmationAudio(text);
    stopSpeech();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    activeAudioContext = new AudioContextClass();
    activeSource = activeAudioContext.createBufferSource();
    activeSource.buffer = buffer;
    activeSource.connect(activeAudioContext.destination);
    activeSource.onended = () => {
      if (activeSource) {
        stopSpeech();
        if (onComplete) onComplete();
      }
    };
    activeSource.start(0);
  } catch (error) {
    console.error("Speech error:", error);
    if (onComplete) onComplete();
  }
};
