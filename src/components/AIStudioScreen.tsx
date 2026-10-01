import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  Search,
  Mic,
  MicOff,
  Video,
  Music,
  Download,
  Upload,
  RefreshCw,
  Send,
  Volume2,
  CheckCircle2,
  BookmarkPlus,
} from 'lucide-react';
import { UserSession } from '../types';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AIStudioScreenProps {
  session: UserSession | null;
  onSaveToPracticeLog?: (title: string, discipline: string, minutes: number) => void;
  onSaveMedia?: (name: string, url: string, type: 'photo' | 'video') => void;
}

type AIToolTab = 'chat' | 'search' | 'live' | 'transcribe' | 'veo' | 'lyria';

interface ChatHistoryItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  timestamp: string;
}

export const AIStudioScreen: React.FC<AIStudioScreenProps> = ({
  session,
  onSaveToPracticeLog,
  onSaveMedia,
}) => {
  const [activeTab, setActiveTab] = useState<AIToolTab>('chat');

  // 1. Chat State
  const [chatMessages, setChatMessages] = useState<ChatHistoryItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Namaste! I am Guru Radhika. How may I guide your practice today? Whether you are perfecting Tatkar footwork, refining Bharatanatyam mudras, or centering your breath in Vinyasa, I am here.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatModel, setChatModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [chatRole, setChatRole] = useState<'dance_guru' | 'yoga_acharya' | 'sattvic_nutrition'>('dance_guru');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 2. Search Grounding State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    answer: string;
    grounding: any;
    modelUsed: string;
  } | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // 3. Audio Transcribe State
  const [isRecordingTranscribe, setIsRecordingTranscribe] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 4. Lyria Music State
  const [musicPrompt, setMusicPrompt] = useState(
    '16-beat Teentaal classical sitar and tabla lehra at 80 BPM for Kathak footwork'
  );
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [musicLyrics, setMusicLyrics] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 5. Veo Video Generation State
  const [veoPrompt, setVeoPrompt] = useState(
    'Graceful classical Indian dancer performing fluid arm waves and spins in sacred warm temple glow'
  );
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatusText, setVideoStatusText] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // 6. Live Voice State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveStatusText, setLiveStatusText] = useState('Tap start to converse with Guru Radhika via real-time voice.');
  const liveWsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Handle Multi-turn Chat Send
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const newUserMsg: ChatHistoryItem = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...chatMessages, newUserMsg];
    setChatMessages(updatedHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
          modelChoice: chatModel,
          role: chatRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get Guru response');

      const botReply: ChatHistoryItem = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: data.reply,
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, botReply]);

      // Save to Firestore if user logged in
      if (session?.userId) {
        try {
          const genId = 'gen-chat-' + Date.now();
          await setDoc(doc(db, 'users', session.userId, 'ai_generations', genId), {
            id: genId,
            userId: session.userId,
            type: 'chatbot',
            prompt: userText,
            resultText: data.reply,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Firestore AI save note:', err);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `Pranam. An error occurred: ${msg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Search Grounding
  const handleSearchGrounding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || isSearchLoading) return;

    setIsSearchLoading(true);
    setSearchResults(null);

    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search grounding failed');
      setSearchResults(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSearchResults({
        answer: `Unable to retrieve live search data: ${msg}`,
        grounding: null,
        modelUsed: 'gemini-3.5-flash',
      });
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Handle Audio Transcription with Mic
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await sendAudioForTranscription(base64Audio, 'audio/webm');
        };
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingTranscribe(true);
      setSaveSuccessMsg(null);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required to record speech for transcription.');
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingTranscribe) {
      mediaRecorderRef.current.stop();
      setIsRecordingTranscribe(false);
    }
  };

  const sendAudioForTranscription = async (audioBase64: string, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transcribe audio');
      setTranscribedText(data.transcript);

      // Save to Firestore
      if (session?.userId && data.transcript) {
        try {
          const genId = 'gen-tr-' + Date.now();
          await setDoc(doc(db, 'users', session.userId, 'ai_generations', genId), {
            id: genId,
            userId: session.userId,
            type: 'transcribe',
            prompt: 'Voice note transcription',
            resultText: data.transcript,
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Firestore AI save note:', e);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Transcription error: ' + msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveTranscriptAsPractice = () => {
    if (!transcribedText.trim()) return;
    if (onSaveToPracticeLog) {
      onSaveToPracticeLog('Mindful Practice Reflection: ' + transcribedText.slice(0, 30) + '...', 'Meditation', 15);
      setSaveSuccessMsg('Reflection successfully logged into your Practice History!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  // Handle Lyria Music Generation
  const handleGenerateMusic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!musicPrompt.trim() || isGeneratingMusic) return;

    setIsGeneratingMusic(true);
    setGeneratedMusicUrl(null);
    setMusicLyrics(null);

    try {
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt.trim(),
          modelChoice: musicModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Music generation failed');

      // Decode base64 audio into Blob
      const binaryString = atob(data.audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const blobUrl = URL.createObjectURL(blob);

      setGeneratedMusicUrl(blobUrl);
      setMusicLyrics(data.lyrics || null);

      // Save to Firestore
      if (session?.userId) {
        try {
          const genId = 'gen-music-' + Date.now();
          await setDoc(doc(db, 'users', session.userId, 'ai_generations', genId), {
            id: genId,
            userId: session.userId,
            type: 'lyria_music',
            prompt: musicPrompt.trim(),
            resultUrl: 'audio/wav-generated',
            resultText: data.lyrics || '',
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Firestore AI save note:', e);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Music generation error: ' + msg);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Handle Photo selection for Veo Video
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreviewUrl(result);
      // Extract pure base64
      const base64Data = result.split(',')[1];
      setSelectedImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Sample default posture for fast Veo demo
  const handleUsePresetPosture = () => {
    // Elegant Bharatanatyam / Kathak posture photo
    const sampleUrl = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
    setImagePreviewUrl(sampleUrl);

    // Fetch and convert to base64
    fetch(sampleUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          setSelectedImageBase64(res.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  };

  // Handle Veo Video Generation with Polling
  const handleGenerateVeoVideo = async () => {
    if (!selectedImageBase64 || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setVideoStatusText('Submitting posture frame to Veo (veo-3.1-fast-generate-preview)...');
    setGeneratedVideoUrl(null);

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImageBase64,
          prompt: veoPrompt.trim(),
          aspectRatio: veoAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start Veo operation');

      const operationName = data.operationName;
      setVideoStatusText('Veo is synthesizing choreographic movement... (this may take 1-2 minutes)');

      // Poll every 8 seconds
      let completed = false;
      let attempts = 0;
      const maxAttempts = 35;

      while (!completed && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        attempts++;
        setVideoStatusText(`Synthesizing motion in temple light... Progress check ${attempts}/${maxAttempts}`);

        const statusRes = await fetch('/api/ai/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        const statusData = await statusRes.json();
        if (statusData.error) {
          throw new Error(statusData.error.message || 'Veo generation error occurred');
        }

        if (statusData.done) {
          completed = true;
          setVideoStatusText('Video synthesis complete! Streaming video...');

          const downloadRes = await fetch('/api/ai/video-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          if (!downloadRes.ok) throw new Error('Failed to download generated video');

          const videoBlob = await downloadRes.blob();
          const videoUrl = URL.createObjectURL(videoBlob);
          setGeneratedVideoUrl(videoUrl);
          setVideoStatusText('✨ Dance motion video generated successfully!');

          // Save to user's media collection
          if (onSaveMedia) {
            onSaveMedia('Veo Animate: ' + veoPrompt.slice(0, 25), videoUrl, 'video');
          }

          // Save to Firestore
          if (session?.userId) {
            try {
              const genId = 'gen-veo-' + Date.now();
              await setDoc(doc(db, 'users', session.userId, 'ai_generations', genId), {
                id: genId,
                userId: session.userId,
                type: 'veo_video',
                prompt: veoPrompt.trim(),
                resultUrl: videoUrl,
                createdAt: new Date().toISOString(),
              });
            } catch (e) {
              console.warn('Firestore AI save note:', e);
            }
          }
          break;
        }
      }

      if (!completed) {
        setVideoStatusText('Veo generation is still running in background. Please retry or check status shortly.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setVideoStatusText(`Video generation notice: ${msg}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Handle Real-time Live Voice Conversation
  const startLiveConversation = async () => {
    try {
      setLiveStatusText('Connecting to Guru Radhika via Live API (gemini-3.8-live)...');

      // Initialize Web Audio
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      let nextStartTime = outputCtx.currentTime;

      ws.onopen = () => {
        setIsLiveConnected(true);
        setLiveStatusText('Connected! Speak freely. Guru Radhika will listen and reply.');

        // Stream mic PCM
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert float32 to PCM 16-bit
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            const base64Audio = btoa(
              String.fromCharCode.apply(null, Array.from(new Uint8Array(pcm16.buffer)))
            );
            ws.send(JSON.stringify({ audio: base64Audio }));
          }
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setLiveStatusText(`Notice: ${msg.error}`);
            return;
          }
          if (msg.interrupted) {
            nextStartTime = outputCtx.currentTime;
          }
          if (msg.audio) {
            // Play 24kHz PCM from Zephyr voice
            const binary = atob(msg.audio);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const pcm16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
              float32[i] = pcm16[i] / 32768.0;
            }

            const audioBuffer = outputCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.copyToChannel(float32, 0);

            const bufferSource = outputCtx.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(outputCtx.destination);

            if (nextStartTime < outputCtx.currentTime) {
              nextStartTime = outputCtx.currentTime;
            }
            bufferSource.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
          }
        } catch (e) {
          console.error('Error handling live audio chunk:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('Live WS error:', e);
        setLiveStatusText('Live voice connection closed or unavailable. Ensure microphone is allowed.');
        stopLiveConversation();
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setLiveStatusText('Live session concluded. Tap start to converse again.');
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Could not start Live Voice session: ' + msg);
      setIsLiveConnected(false);
    }
  };

  const stopLiveConversation = () => {
    if (liveWsRef.current) {
      liveWsRef.current.close();
      liveWsRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    setIsLiveConnected(false);
    setLiveStatusText('Voice conversation paused.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#8C3A27] via-[#A84931] to-[#682415] text-white p-6 sm:p-8 rounded-[28px] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none translate-x-8 translate-y-8">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Movement & Classical Wisdom Studio
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Nrityasana AI Studio
          </h1>
          <p className="text-white/85 text-sm sm:text-base mt-2 leading-relaxed">
            Multi-modal classical dance & yoga companion powered by Gemini & Lyria: multi-turn Guru chat, real-time voice, Google Search grounding, audio transcription, Lyria music, and Veo movement animation.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#F0E6E2]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-[#8C3A27] text-white shadow-sm'
              : 'bg-white text-[#6B5C62] hover:bg-[#F9F4F2] border border-[#F0E6E2]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Guru Chatbot
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'live'
              ? 'bg-[#8C3A27] text-white shadow-sm'
              : 'bg-white text-[#6B5C62] hover:bg-[#F9F4F2] border border-[#F0E6E2]'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          Live Voice Mentor
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'search'
              ? 'bg-[#8C3A27] text-white shadow-sm'
              : 'bg-white text-[#6B5C62] hover:bg-[#F9F4F2] border border-[#F0E6E2]'
          }`}
        >
          <Search className="w-4 h-4" />
          Search Grounding
        </button>

        <button
          onClick={() => setActiveTab('transcribe')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'transcribe'
              ? 'bg-[#8C3A27] text-white shadow-sm'
              : 'bg-white text-[#6B5C62] hover:bg-[#F9F4F2] border border-[#F0E6E2]'
          }`}
        >
          <Mic className="w-4 h-4" />
          Voice Transcribe
        </button>

        <button
          onClick={() => setActiveTab('lyria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'lyria'
              ? 'bg-[#8C3A27] text-white shadow-sm'
              : 'bg-white text-[#6B5C62] hover:bg-[#F9F4F2] border border-[#F0E6E2]'
          }`}
        >
          <Music className="w-4 h-4" />
          Lyria Music Generator
        </button>

        <button
          onClick={() => setActiveTab('veo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'veo'
              ? 'bg-[#8C3A27] text-white shadow-sm'
              : 'bg-white text-[#6B5C62] hover:bg-[#F9F4F2] border border-[#F0E6E2]'
          }`}
        >
          <Video className="w-4 h-4" />
          Veo Video Animator
        </button>
      </div>

      {/* 1. GURU CHATBOT TAB */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-[#F0E6E2] shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-[#F0E6E2] bg-[#FDF9F7] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B5C62] uppercase tracking-wider">Role:</span>
              <select
                value={chatRole}
                onChange={(e) => setChatRole(e.target.value as any)}
                className="bg-white text-xs font-medium border border-[#E8DBD6] rounded-xl px-3 py-1.5 text-[#1F161A] focus:outline-none focus:ring-1 focus:ring-[#8C3A27]"
              >
                <option value="dance_guru">Guru Radhika (Classical Dance & Mudras)</option>
                <option value="yoga_acharya">Acharya Patanjali (Yoga & Alignment)</option>
                <option value="sattvic_nutrition">Ananya (Sattvic Performance Nutrition)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B5C62] uppercase tracking-wider">Model:</span>
              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value as any)}
                className="bg-white text-xs font-medium border border-[#E8DBD6] rounded-xl px-3 py-1.5 text-[#1F161A] focus:outline-none focus:ring-1 focus:ring-[#8C3A27]"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced & Versatile)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Choreography & History)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fastest Response)</option>
              </select>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#8C3A27] text-white rounded-tr-none'
                      : 'bg-[#F9F4F2] text-[#1F161A] border border-[#F0E6E2] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                <span className="text-[10px] text-[#A6979C] mt-1 px-1">
                  {msg.timestamp} {msg.modelUsed ? `• ${msg.modelUsed}` : ''}
                </span>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-[#8C3A27] italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                The Guru is contemplating your rhythm...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendChat}
            className="p-3 border-t border-[#F0E6E2] bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about Tatkar speed, Pataka mudra geometry, breathing in Surya Namaskar..."
              className="flex-1 bg-[#FAF6F4] text-sm px-4 py-2.5 rounded-full border border-[#EADBDB] text-[#1F161A] focus:outline-none focus:ring-2 focus:ring-[#8C3A27]/20"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="bg-[#8C3A27] hover:bg-[#722F1F] disabled:opacity-50 text-white p-2.5 rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. LIVE VOICE MENTOR TAB (gemini-3.8-live) */}
      {activeTab === 'live' && (
        <div className="bg-white rounded-3xl border border-[#F0E6E2] p-8 text-center shadow-sm space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="inline-flex p-4 rounded-full bg-[#FAF3F0] border border-[#EADBDB] text-[#8C3A27]">
              <Volume2 className={`w-12 h-12 ${isLiveConnected ? 'animate-pulse text-[#8C3A27]' : ''}`} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1F161A]">
              Live Voice Mentor (gemini-3.8-live)
            </h2>
            <p className="text-sm text-[#6B5C62] leading-relaxed">
              Have a natural, real-time voice conversation with Guru Radhika. Discuss posture corrections, mudra meanings, or rhythm tempo in real-time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDF9F7] border border-[#F0E6E2] max-w-lg mx-auto">
            <p className="text-xs text-[#6B5C62] font-medium">{liveStatusText}</p>
          </div>

          <div className="flex justify-center">
            {!isLiveConnected ? (
              <button
                onClick={startLiveConversation}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#8C3A27] hover:bg-[#722F1F] text-white font-medium text-sm shadow-md transition-all active:scale-95"
              >
                <Mic className="w-5 h-5" />
                Start Voice Conversation
              </button>
            ) : (
              <button
                onClick={stopLiveConversation}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-md transition-all active:scale-95"
              >
                <MicOff className="w-5 h-5" />
                End Voice Session
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. SEARCH GROUNDING TAB (gemini-3.5-flash with Google Search) */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-3xl border border-[#F0E6E2] p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1F161A]">
              Google Search Grounding (gemini-3.5-flash)
            </h2>
            <p className="text-sm text-[#6B5C62] mt-1">
              Search live, verified information on Indian classical dance festivals (Khajuraho, Konark, Margazhi), gurus, compositions, and ancient texts.
            </p>
          </div>

          <form onSubmit={handleSearchGrounding} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. When is the Khajuraho Dance Festival 2026 and what Gharanas are featured?"
              className="flex-1 bg-[#FAF6F4] text-sm px-4 py-3 rounded-2xl border border-[#EADBDB] text-[#1F161A] focus:outline-none focus:ring-2 focus:ring-[#8C3A27]/20"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearchLoading}
              className="bg-[#8C3A27] hover:bg-[#722F1F] disabled:opacity-50 text-white px-5 py-3 rounded-2xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isSearchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-[#8C3A27] font-semibold">Try:</span>
            {[
              'Khajuraho Dance Festival schedule',
              'Difference between Lucknow and Jaipur Kathak Gharanas',
              'Significance of Nataraja symbolism in Bharatanatyam',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSearchQuery(q)}
                className="px-3 py-1 rounded-full bg-[#FAF3F0] text-[#6B5C62] hover:bg-[#F2E5E1] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Search Result Card */}
          {searchResults && (
            <div className="mt-4 p-5 rounded-2xl bg-[#FDF9F7] border border-[#F0E6E2] space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8C3A27] font-semibold border-b border-[#F0E6E2] pb-2">
                <span>Verified Response ({searchResults.modelUsed})</span>
                <span className="bg-[#EADBDB] px-2 py-0.5 rounded-full text-[#682415]">Grounding Active</span>
              </div>
              <p className="text-sm text-[#1F161A] leading-relaxed whitespace-pre-line">
                {searchResults.answer}
              </p>

              {/* Citations and Grounding Metadata */}
              {searchResults.grounding?.webSearchQueries && (
                <div className="pt-2 border-t border-[#F0E6E2] space-y-2">
                  <span className="text-xs font-semibold text-[#6B5C62]">Searches Performed:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.grounding.webSearchQueries.map((query: string, idx: number) => (
                      <span key={idx} className="text-xs bg-white border border-[#EADBDB] px-2.5 py-1 rounded-lg text-[#6B5C62]">
                        {query}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. AUDIO TRANSCRIBE TAB (gemini-3.5-transcribe) */}
      {activeTab === 'transcribe' && (
        <div className="bg-white rounded-3xl border border-[#F0E6E2] p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1F161A]">
              Microphone Audio Transcribe (gemini-3.5-transcribe)
            </h2>
            <p className="text-sm text-[#6B5C62] mt-1">
              Speak your practice notes, Guru feedback, or recite classical Bols/Tala notation. The transcription model will transcribe your spoken audio accurately.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-8 bg-[#FAF6F4] rounded-2xl border-2 border-dashed border-[#EADBDB] space-y-4">
            {!isRecordingTranscribe ? (
              <button
                onClick={startRecordingAudio}
                className="w-16 h-16 rounded-full bg-[#8C3A27] text-white flex items-center justify-center hover:scale-105 transition-all shadow-md"
              >
                <Mic className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={stopRecordingAudio}
                className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse hover:scale-105 transition-all shadow-md"
              >
                <MicOff className="w-8 h-8" />
              </button>
            )}

            <div className="text-center">
              <p className="text-sm font-semibold text-[#1F161A]">
                {isRecordingTranscribe
                  ? 'Recording your voice... Tap to finish & transcribe'
                  : 'Tap the microphone to record your practice note'}
              </p>
              <p className="text-xs text-[#6B5C62] mt-1">
                Supported: English, Hindi bols, Sanskrit yogic terms
              </p>
            </div>
          </div>

          {isTranscribing && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-[#8C3A27]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Transcribing with gemini-3.5-transcribe...
            </div>
          )}

          {transcribedText && (
            <div className="space-y-3 p-5 rounded-2xl bg-[#FDF9F7] border border-[#F0E6E2]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8C3A27]">
                  Transcribed Text
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(transcribedText)}
                  className="text-xs text-[#6B5C62] hover:text-[#8C3A27] font-medium"
                >
                  Copy to Clipboard
                </button>
              </div>
              <p className="text-sm text-[#1F161A] leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-[#F0E6E2]">
                {transcribedText}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveTranscriptAsPractice}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C3A27] hover:bg-[#722F1F] text-white text-xs font-medium transition-colors"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Save as Practice Log
                </button>
              </div>
              {saveSuccessMsg && (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  {saveSuccessMsg}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. LYRIA MUSIC GENERATOR TAB (lyria-3-clip-preview / lyria-3-pro-preview) */}
      {activeTab === 'lyria' && (
        <div className="bg-white rounded-3xl border border-[#F0E6E2] p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1F161A]">
              Classical Music Generator (Lyria)
            </h2>
            <p className="text-sm text-[#6B5C62] mt-1">
              Create authentic, bespoke music for your practice using Lyria. Generate short clips (30s) with <strong>lyria-3-clip-preview</strong> or full-length tracks with <strong>lyria-3-pro-preview</strong>.
            </p>
          </div>

          <form onSubmit={handleGenerateMusic} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B5C62] uppercase tracking-wider mb-1.5">
                Music Prompt
              </label>
              <textarea
                rows={3}
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                placeholder="Describe instruments, tempo, raga, or mood (e.g. 16-beat Teentaal sitar and tabla lehra at 80 BPM)"
                className="w-full bg-[#FAF6F4] text-sm p-4 rounded-2xl border border-[#EADBDB] text-[#1F161A] focus:outline-none focus:ring-2 focus:ring-[#8C3A27]/20"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#6B5C62]">Model & Duration:</span>
                <select
                  value={musicModel}
                  onChange={(e) => setMusicModel(e.target.value as any)}
                  className="bg-white text-xs font-medium border border-[#E8DBD6] rounded-xl px-3 py-2 text-[#1F161A] focus:outline-none"
                >
                  <option value="lyria-3-clip-preview">lyria-3-clip-preview (Up to 30s Practice Clip)</option>
                  <option value="lyria-3-pro-preview">lyria-3-pro-preview (Full-Length Track)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!musicPrompt.trim() || isGeneratingMusic}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8C3A27] hover:bg-[#722F1F] disabled:opacity-50 text-white text-sm font-medium transition-all shadow-sm"
              >
                {isGeneratingMusic ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Track...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    Generate Music
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-[#8C3A27] font-semibold">Presets:</span>
            {[
              '16-beat Teentaal sitar and tabla lehra for Kathak footwork',
              'Deep meditative Bansuri flute with Tanpura drone in Raag Bhairav',
              'Fast energetic Bollywood dholak and brass groove for dance cardio',
              'Gentle sitar and river stream soundscape for Savasana relaxation',
            ].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setMusicPrompt(p)}
                className="px-3 py-1 rounded-full bg-[#FAF3F0] text-[#6B5C62] hover:bg-[#F2E5E1] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Player for generated music */}
          {generatedMusicUrl && (
            <div className="mt-4 p-5 rounded-2xl bg-[#FDF9F7] border border-[#F0E6E2] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8C3A27] text-white flex items-center justify-center">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F161A]">Generated Practice Track</h4>
                    <p className="text-xs text-[#6B5C62]">{musicPrompt.slice(0, 45)}...</p>
                  </div>
                </div>

                <a
                  href={generatedMusicUrl}
                  download="nrityasana_music.wav"
                  className="flex items-center gap-1.5 text-xs text-[#8C3A27] hover:underline font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download WAV
                </a>
              </div>

              <audio
                ref={audioPlayerRef}
                controls
                src={generatedMusicUrl}
                className="w-full rounded-lg"
              />

              {musicLyrics && (
                <div className="p-3 bg-white rounded-xl border border-[#F0E6E2] text-xs text-[#6B5C62] italic">
                  <strong>Notes/Lyrics:</strong> {musicLyrics}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. VEO VIDEO ANIMATOR TAB (veo-3.1-fast-generate-preview) */}
      {activeTab === 'veo' && (
        <div className="bg-white rounded-3xl border border-[#F0E6E2] p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1F161A]">
              Animate Images into Video (veo-3.1-fast-generate-preview)
            </h2>
            <p className="text-sm text-[#6B5C62] mt-1">
              Upload a still photo of a dance posture or yoga asana, and Veo will animate it into a fluid, expressive video in 16:9 landscape or 9:16 portrait.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B5C62] uppercase tracking-wider mb-1.5">
                  1. Choose or Upload Posture Photo
                </label>
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-[#EADBDB] hover:border-[#8C3A27] bg-[#FAF6F4] text-xs font-medium text-[#6B5C62] transition-colors">
                    <Upload className="w-4 h-4 text-[#8C3A27]" />
                    <span>Upload Posture Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleUsePresetPosture}
                    className="px-3 py-3 rounded-xl bg-white border border-[#EADBDB] hover:bg-[#FAF6F4] text-xs text-[#6B5C62] font-medium"
                  >
                    Use Sample Posture
                  </button>
                </div>
              </div>

              {/* Photo Preview */}
              {imagePreviewUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-[#EADBDB] bg-black/5 aspect-[4/3] flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Posture preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Selected Frame
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#6B5C62] uppercase tracking-wider mb-1.5">
                  2. Aspect Ratio (16:9 Landscape or 9:16 Portrait)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVeoAspectRatio('16:9')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-medium border text-center transition-all ${
                      veoAspectRatio === '16:9'
                        ? 'bg-[#8C3A27] text-white border-[#8C3A27]'
                        : 'bg-white text-[#6B5C62] border-[#EADBDB]'
                    }`}
                  >
                    16:9 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setVeoAspectRatio('9:16')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-medium border text-center transition-all ${
                      veoAspectRatio === '9:16'
                        ? 'bg-[#8C3A27] text-white border-[#8C3A27]'
                        : 'bg-white text-[#6B5C62] border-[#EADBDB]'
                    }`}
                  >
                    9:16 Portrait
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B5C62] uppercase tracking-wider mb-1.5">
                  3. Motion Prompt
                </label>
                <textarea
                  rows={3}
                  value={veoPrompt}
                  onChange={(e) => setVeoPrompt(e.target.value)}
                  placeholder="Describe the desired movement (e.g. Graceful pirouette and mudra extension)"
                  className="w-full bg-[#FAF6F4] text-sm p-3 rounded-xl border border-[#EADBDB] text-[#1F161A] focus:outline-none focus:ring-2 focus:ring-[#8C3A27]/20"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateVeoVideo}
                disabled={!selectedImageBase64 || isGeneratingVideo}
                className="w-full py-3.5 rounded-full bg-[#8C3A27] hover:bg-[#722F1F] disabled:opacity-50 text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synthesizing Video with Veo...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Animate Image into Video
                  </>
                )}
              </button>
            </div>

            {/* Output Column */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#6B5C62] uppercase tracking-wider">
                Video Preview & Status
              </label>

              {videoStatusText && (
                <div className="p-4 rounded-2xl bg-[#FDF9F7] border border-[#F0E6E2] text-xs text-[#8C3A27] font-medium leading-relaxed">
                  {videoStatusText}
                </div>
              )}

              {generatedVideoUrl ? (
                <div className="space-y-3">
                  <div className={`rounded-2xl overflow-hidden border border-[#EADBDB] bg-black ${veoAspectRatio === '9:16' ? 'aspect-[9/16] max-w-[280px] mx-auto' : 'aspect-[16/9]'}`}>
                    <video
                      controls
                      autoPlay
                      loop
                      src={generatedVideoUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <a
                      href={generatedVideoUrl}
                      download="veo_dance_motion.mp4"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C3A27] text-white text-xs font-medium hover:bg-[#722F1F]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Video (MP4)
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] rounded-2xl border-2 border-dashed border-[#EADBDB] bg-[#FAF6F4] flex flex-col items-center justify-center p-6 text-center text-[#A6979C]">
                  <Video className="w-12 h-12 mb-2 stroke-1" />
                  <p className="text-xs font-medium">Generated dance video will stream here</p>
                  <p className="text-[11px] mt-1 text-[#A6979C]">
                    Model: veo-3.1-fast-generate-preview ({veoAspectRatio})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
