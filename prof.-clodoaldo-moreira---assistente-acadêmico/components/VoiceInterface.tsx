import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';

interface VoiceMessage { role: 'user' | 'model'; text: string; }

export const VoiceInterface: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realtimeTranscript, setRealtimeTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<VoiceMessage[]>([]);
  
  const currentTranscriptRef = useRef('');
  const isConnectedRef = useRef(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<Promise<any> | null>(null);

  const AVATAR_IMAGE = "https://api.dicebear.com/9.x/avataaars/svg?seed=DrClodoaldoAdvogado&clothing=blazerAndShirt&facialHair=beardMajestic&top=shortFlat&hairColor=2c1b18&skinColor=edb98a&mouth=smile&eyes=happy&eyebrows=default&accessories=prescription02&accessoriesColor=262e33&accessoriesProbability=100";

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = () => {
    console.log("Parando sessão de voz...");
    isConnectedRef.current = false;
    sessionRef.current = null;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioSourcesRef.current.clear();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setStatus('idle');
    setIsSpeaking(false);
    setRealtimeTranscript('');
    currentTranscriptRef.current = '';
  };

  const startSession = async () => {
    if (isConnectedRef.current) return;

    try {
      console.log("Iniciando sessão de voz...");
      setErrorMessage(null);
      setStatus('connecting');
      setConversationHistory([]);
      currentTranscriptRef.current = '';

      // 1. Obter Chave Segura do Backend (Netlify Function)
      // O front não tem a chave, ele pede permissão ao back
      const keyResponse = await fetch('/.netlify/functions/gemini?action=key');
      if (!keyResponse.ok) {
        throw new Error("Não foi possível autenticar com o servidor de voz.");
      }
      const { key: apiKey } = await keyResponse.json();

      if (!apiKey) throw new Error("Chave de API inválida retornada pelo servidor.");

      // 2. Setup Audio Output
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await audioContextRef.current.resume();
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      // 3. Setup Audio Input
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        }
      });
      mediaStreamRef.current = stream;
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const inputSource = inputAudioContextRef.current.createMediaStreamSource(stream);
      const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      sourceRef.current = inputSource;
      processorRef.current = processor;

      // 4. Setup Gemini API (Com a chave obtida dinamicamente)
      const ai = new GoogleGenAI({ apiKey });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
          },
          systemInstruction: `VOCÊ É O PROFESSOR CLODOALDO MOREIRA.
            CONTEXTO: Conversa por voz com aluno de Direito.
            OBJETIVO: Tirar dúvidas jurídicas, explicar conceitos e orientar estudos.
            ESTILO: Didático, inclusivo, paciente e ético.
            IMPORTANTE: Respostas curtas e diretas funcionam melhor em áudio.`,
        },
        callbacks: {
          onopen: () => {
            console.log("Conexão estabelecida com Gemini Live");
            setStatus('connected');
            setIsConnected(true);
            isConnectedRef.current = true;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(err => {
                console.error("Erro ao enviar frame de áudio:", err);
              });
            };

            inputSource.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const sc = msg.serverContent;

            if (sc?.inputTranscription?.text) {
               const text = sc.inputTranscription.text;
               currentTranscriptRef.current += text;
               setRealtimeTranscript(currentTranscriptRef.current);
            }
            
            if (sc?.turnComplete) {
               if (currentTranscriptRef.current.trim()) {
                 setConversationHistory(prev => [...prev, { role: 'user', text: currentTranscriptRef.current }]);
                 currentTranscriptRef.current = '';
                 setRealtimeTranscript('');
               }
            }

            if (sc?.outputTranscription?.text) {
               const text = sc.outputTranscription.text;
               setConversationHistory(prev => {
                 const last = prev[prev.length - 1];
                 if (last && last.role === 'model') {
                   return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                 } else {
                   return [...prev, { role: 'model', text }];
                 }
               });
            }

            const base64Audio = sc?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              setIsSpeaking(true);
              try {
                const audioData = base64ToUint8Array(base64Audio);
                const audioBuffer = await decodeAudioData(audioData, audioContextRef.current);
                
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                
                const currentTime = audioContextRef.current.currentTime;
                if (nextStartTimeRef.current < currentTime) {
                    nextStartTimeRef.current = currentTime;
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                
                audioSourcesRef.current.add(source);
                source.onended = () => {
                  audioSourcesRef.current.delete(source);
                  if (audioSourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                  }
                };
              } catch (e) {
                console.error("Erro ao processar áudio de resposta:", e);
              }
            }

            if (sc?.interrupted) {
              audioSourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e){}
              });
              audioSourcesRef.current.clear();
              setIsSpeaking(false);
              if (audioContextRef.current) {
                 nextStartTimeRef.current = audioContextRef.current.currentTime;
              }
            }
          },
          onclose: () => {
            console.log("Conexão fechada pelo servidor");
            stopSession();
          },
          onerror: (err) => {
            console.error("Erro no Gemini Live:", err);
            setErrorMessage("Erro de conexão com a IA. Tente novamente.");
            stopSession();
            setStatus('error');
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (error: any) {
      console.error("Erro fatal ao iniciar sessão:", error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
         setErrorMessage("Permissão do microfone negada. Verifique as configurações do navegador.");
      } else if (error.name === 'NotFoundError') {
         setErrorMessage("Nenhum microfone encontrado.");
      } else {
         setErrorMessage("Não foi possível conectar: " + (error.message || "Erro desconhecido"));
      }
      
      setStatus('error');
      stopSession();
    }
  };

  const handleToggle = () => {
    if (isConnected) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-fade-in justify-center items-center">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gold-200 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-law-200 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl z-10 flex flex-col items-center p-4">
        
        <div className={`
          px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 transition-all duration-500 shadow-sm
          ${status === 'connected' ? 'bg-green-100 text-green-700' : 
            status === 'connecting' ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 
            status === 'error' ? 'bg-red-100 text-red-700' : 
            'bg-slate-200 text-slate-500'}
        `}>
          {status === 'connecting' ? 'Conectando...' : 
           status === 'connected' ? 'Conexão Ativa' : 
           status === 'error' ? 'Erro de Conexão' : 
           'Toque no microfone para falar'}
        </div>

        <div className="flex flex-row items-center justify-center gap-6 md:gap-10 mb-8 animate-float">
          <div className="relative group">
            {(isConnected || isSpeaking) && (
              <>
                <div className={`absolute inset-0 bg-gold-400 rounded-full opacity-20 ${isSpeaking ? 'animate-ping duration-[2s]' : ''}`}></div>
                <div className="absolute -inset-4 border border-gold-300 rounded-full opacity-30 animate-pulse"></div>
              </>
            )}

            <div className={`
              relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-[6px] shadow-2xl transition-all duration-500
              ${isSpeaking ? 'border-gold-500 scale-105 shadow-gold-500/50' : isConnected ? 'border-green-400' : 'border-white grayscale shadow-slate-300'}
            `}>
               <img src={AVATAR_IMAGE} className="w-full h-full object-cover bg-slate-100" alt="Professor Clodoaldo Moreira" />
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={status === 'connecting'}
            className={`
              w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0 relative
              ${isConnected ? 'bg-red-500 text-white shadow-red-500/40 ring-4 ring-red-100' : 'bg-law-900 text-white shadow-law-900/40 hover:bg-law-800'}
              ${status === 'connecting' ? 'opacity-70 cursor-wait' : ''}
            `}
            title={isConnected ? "Parar conversa" : "Iniciar conversa"}
          >
            {isConnected ? <MicOff size={28} className="md:w-8 md:h-8" /> : <Mic size={28} className="md:w-8 md:h-8" />}
            
            {!isConnected && status !== 'connecting' && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-gold-500 border-2 border-white"></span>
              </span>
            )}
          </button>
        </div>

        <div className="h-32 w-full px-4 flex flex-col items-center justify-start">
           {realtimeTranscript ? (
             <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-100 max-w-lg animate-fade-in-up">
                <p className="text-lg font-medium text-law-900 text-center">"{realtimeTranscript}..."</p>
             </div>
           ) : isSpeaking ? (
             <div className="flex gap-1.5 h-8 items-center mt-4">
                <span className="w-1.5 h-4 bg-gold-500 rounded-full animate-[wave_1s_ease-in-out_infinite]"></span>
                <span className="w-1.5 h-8 bg-gold-500 rounded-full animate-[wave_1s_ease-in-out_infinite_0.1s]"></span>
                <span className="w-1.5 h-6 bg-gold-500 rounded-full animate-[wave_1s_ease-in-out_infinite_0.2s]"></span>
                <span className="w-1.5 h-4 bg-gold-500 rounded-full animate-[wave_1s_ease-in-out_infinite_0.3s]"></span>
             </div>
           ) : (
             <p className="text-slate-400 text-sm mt-4 text-center max-w-xs">
               {isConnected ? "Estou ouvindo. Pode falar normalmente..." : "Toque no microfone ao lado para iniciar a conversa."}
             </p>
           )}
        </div>

        {errorMessage && (
          <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm border border-red-200 animate-fade-in shadow-sm">
            <AlertCircle size={18} /> 
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {conversationHistory.length > 0 && !realtimeTranscript && (
          <div className="mt-4 w-full max-w-lg bg-white/60 p-4 rounded-xl text-xs text-slate-500 border border-slate-100 max-h-32 overflow-y-auto">
             <p className="font-bold mb-1 uppercase tracking-wide opacity-50">Últimas interações:</p>
             {conversationHistory.slice(-3).map((msg, idx) => (
               <div key={idx} className={`mb-1 ${msg.role === 'user' ? 'text-right text-law-700' : 'text-left'}`}>
                 <span className="font-bold">{msg.role === 'user' ? 'Você: ' : 'Prof: '}</span>
                 {msg.text}
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};