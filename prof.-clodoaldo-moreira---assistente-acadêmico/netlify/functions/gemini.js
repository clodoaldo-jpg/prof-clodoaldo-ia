import { GoogleGenAI, Modality } from "@google/genai";

// Esta função roda no servidor do Netlify, onde a chave é segura.
export default async (req, context) => {
  // Configuração de CORS para permitir que seu site chame esta função
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
  };

  // Responder a preflight requests (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Obter a chave do ambiente do Netlify
  const apiKey = Netlify.env.get("API_KEY") || process.env.API_KEY;

  if (!apiKey) {
    console.error("ERRO CRÍTICO: API_KEY não configurada no Netlify.");
    return new Response(JSON.stringify({ error: "Chave de API não configurada no servidor." }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }

  // Endpoint especial para obter a chave SOMENTE para o WebSocket do Front-end (VoiceInterface)
  // Isso é necessário porque o SDK de voz roda no cliente
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "key") {
      return new Response(JSON.stringify({ key: apiKey }), {
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const body = await req.json();
    const { action, payload, model: requestedModel } = body;
    const ai = new GoogleGenAI({ apiKey });

    let resultData = {};

    switch (action) {
      case 'chat': {
        // payload: { message, history, systemInstruction, temperature }
        const chat = ai.chats.create({
          model: requestedModel || 'gemini-3-flash-preview',
          config: {
            systemInstruction: payload.systemInstruction,
            temperature: payload.temperature || 0.7,
          },
          history: payload.history || []
        });
        const result = await chat.sendMessage({ message: payload.message });
        resultData = { text: result.text };
        break;
      }

      case 'analyze': {
        // payload: { base64, mimeType, prompt, systemInstruction }
        const response = await ai.models.generateContent({
          model: requestedModel || 'gemini-3-pro-preview',
          contents: {
            parts: [
              { inlineData: { mimeType: payload.mimeType, data: payload.base64 } },
              { text: `${payload.systemInstruction}\n\n${payload.prompt}` }
            ]
          }
        });
        resultData = { text: response.text };
        break;
      }

      case 'transcribe': {
        // payload: { base64, mimeType }
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-latest',
          contents: {
            parts: [
              { inlineData: { mimeType: payload.mimeType, data: payload.base64 } },
              { text: "Transcreva o áudio a seguir para texto em Português do Brasil. Retorne APENAS o texto." }
            ]
          }
        });
        resultData = { text: response.text };
        break;
      }

      case 'tts': {
        // payload: { text, voiceName }
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: { parts: [{ text: payload.text }] },
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: payload.voiceName || 'Charon' } }
            }
          }
        });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        resultData = { audioData };
        break;
      }

      case 'plan': {
        // payload: { prompt }
        const response = await ai.models.generateContent({
          model: requestedModel || 'gemini-3-pro-preview',
          contents: { parts: [{ text: payload.prompt }] }
        });
        resultData = { text: response.text };
        break;
      }

      default:
        throw new Error("Ação desconhecida");
    }

    return new Response(JSON.stringify(resultData), {
      headers: { ...headers, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Erro na Function Gemini:", error);
    return new Response(JSON.stringify({ error: error.message || "Erro interno na IA" }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
};
