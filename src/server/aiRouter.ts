import { Router, Request, Response } from 'express';
import { GoogleGenAI, GenerateVideosOperation, Modality, LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';

export function createAiRouter() {
  const router = Router();

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // 1. Multi-turn Chat with System Instructions & Dynamic Model Selection
  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const {
        messages = [],
        modelChoice = 'gemini-3.5-flash',
        role = 'dance_guru',
      } = req.body;

      if (!apiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
        return;
      }

      // Valid models: gemini-3.1-pro-preview (complex), gemini-3.5-flash (general), gemini-3.1-flash-lite (fast)
      let selectedModel = 'gemini-3.5-flash';
      if (modelChoice === 'gemini-3.1-pro-preview') {
        selectedModel = 'gemini-3.1-pro-preview';
      } else if (modelChoice === 'gemini-3.1-flash-lite') {
        selectedModel = 'gemini-3.1-flash-lite';
      }

      const roleInstructions: Record<string, string> = {
        dance_guru:
          'You are Guru Radhika, an esteemed Acharya of Indian Classical Dance (Kathak, Bharatanatyam, Odissi) in Nrityasana. Your tone is serene, encouraging, and authoritative yet deeply compassionate. Guide practitioners through Mudras, Hastaks, Tatkar footwork, Bhava (expression), Tala rhythms, and biomechanical alignment.',
        yoga_acharya:
          'You are Acharya Patanjali, a master guide of Ashtanga Yoga, Hatha Yoga, and Pranayama in Nrityasana. You emphasize breath synchronization, mindful spine geometry, Drishti focus, and inner stillness. Give gentle, safe alignment cues for all practitioner levels.',
        sattvic_nutrition:
          'You are Ananya, a classical Ayurveda and Sattvic performance nutritionist in Nrityasana. Provide nourishing dietary wisdom tailored for dancers and yogis to enhance stamina, recovery, joint flexibility, and mental lightness without lethargy.',
      };

      const systemInstruction =
        roleInstructions[role] || roleInstructions.dance_guru;

      // Transform history into GoogleGenAI contents array
      const contents = messages.map(
        (m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })
      );

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
        },
      });

      res.json({
        reply: response.text || 'Silence in the sacred hall. Please try again.',
        modelUsed: selectedModel,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Chat] Error:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // 2. Google Search Grounding with gemini-3.5-flash
  router.post('/search-grounding', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      if (!apiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
        return;
      }

      const prompt = `As a classical dance & yoga research companion for Nrityasana, answer with authoritative, verified, up-to-date facts: ${query}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const grounding = response.candidates?.[0]?.groundingMetadata || null;

      res.json({
        answer: text,
        grounding,
        modelUsed: 'gemini-3.5-flash',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Search Grounding] Error:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // 3. Audio Transcription with gemini-3.5-transcribe
  router.post('/transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType = 'audio/webm' } = req.body;
      if (!audioBase64 || typeof audioBase64 !== 'string') {
        res.status(400).json({ error: 'audioBase64 string is required' });
        return;
      }

      if (!apiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
        return;
      }

      const audioPart = {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: 'Transcribe this spoken practitioner reflection or dance instruction verbatim. Preserve classical Sanskrit or dance terms (such as Tatkar, Aramandi, Mudra, Pranayama, Taal) accurately.',
            },
          ],
        },
      });

      res.json({
        transcript: response.text?.trim() || '',
        modelUsed: 'gemini-3.5-transcribe',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Transcribe] Error:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // 4. Music Generation with Lyria (lyria-3-clip-preview / lyria-3-pro-preview)
  router.post('/generate-music', async (req: Request, res: Response) => {
    try {
      const { prompt, modelChoice = 'lyria-3-clip-preview' } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Music prompt is required' });
        return;
      }

      if (!apiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
        return;
      }

      const selectedModel =
        modelChoice === 'lyria-3-pro-preview'
          ? 'lyria-3-pro-preview'
          : 'lyria-3-clip-preview';

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: prompt,
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        res.status(500).json({ error: 'No audio generated by Lyria model' });
        return;
      }

      res.json({
        audioBase64,
        mimeType,
        lyrics,
        modelUsed: selectedModel,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Lyria Music] Error:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // 5. Veo Video Generation (veo-3.1-fast-generate-preview)
  router.post('/generate-video', async (req: Request, res: Response) => {
    try {
      const { imageBase64, prompt, aspectRatio = '16:9' } = req.body;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'imageBase64 is required to animate into video' });
        return;
      }

      if (!apiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
        return;
      }

      // Aspect ratio must be 16:9 or 9:16
      const validRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'A classical Indian dancer performing graceful movements with fluid hands and turns in warm temple lighting',
        image: {
          imageBytes: imageBase64,
          mimeType: 'image/jpeg',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: validRatio,
        },
      });

      res.json({
        operationName: operation.name,
        modelUsed: 'veo-3.1-fast-generate-preview',
        aspectRatio: validRatio,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Veo Video] Error:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // 6. Veo Video Poll Status
  router.post('/video-status', async (req: Request, res: Response) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: 'operationName is required' });
        return;
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: Boolean(updated.done),
        error: updated.error || null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Video Status] Error:', msg);
      res.status(500).json({ error: msg });
    }
  });

  // 7. Veo Video Download Stream
  router.post('/video-download', async (req: Request, res: Response) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: 'operationName is required' });
        return;
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        res.status(404).json({ error: 'Generated video URI not ready or not found' });
        return;
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey || '' },
      });

      if (!videoRes.ok) {
        res.status(videoRes.status).json({ error: 'Failed to fetch video stream from storage' });
        return;
      }

      res.setHeader('Content-Type', 'video/mp4');
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Video Download] Error:', msg);
      res.status(500).json({ error: msg });
    }
  });

  return router;
}

// Attach Live API WebSocket handler for gemini-3.8-live
export function attachLiveWebSocket(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY is missing' }));
      clientWs.close();
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are Guru Radhika in Nrityasana, an accomplished and warm Indian classical dance and yoga guru. You converse with practitioners using voice. Guide them on breathing, footwork rhythm (Taal), posture alignment, and mindset with grace and clarity.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (
              message.serverContent?.interrupted &&
              clientWs.readyState === WebSocket.OPEN
            ) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on('message', (data: Buffer | string) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch (e) {
          console.warn('[Live WS] Failed to parse input:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {}
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Live WS] Connection error:', msg);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: msg }));
      }
    }
  });
}
