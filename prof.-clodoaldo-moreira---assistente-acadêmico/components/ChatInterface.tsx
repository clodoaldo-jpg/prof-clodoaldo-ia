import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Eraser, Volume2, StopCircle } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini, generateAudioFromText } from '../services/geminiService';
import { base64ToUint8Array, decodeAudioData } from '../utils/audioUtils';

interface ChatInterfaceProps {
  initialQuestion?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialQuestion }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! Sou o assistente virtual do Professor Clodoaldo Moreira. Estou aqui para ajudar com seus estudos de forma personalizada e acessível. Como posso ser útil hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState(initialQuestion || '');
  const [isLoading, setIsLoading] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [loadingAudioMsgId, setLoadingAudioMsgId] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Avatar consistente com o resto do app (com óculos)
  const AVATAR_IMAGE = "https://api.dicebear.com/9.x/avataaars/svg?seed=DrClodoaldoAdvogado&clothing=blazerAndShirt&facialHair=beardMajestic&top=shortFlat&hairColor=2c1b18&skinColor=edb98a&mouth=smile&eyes=happy&eyebrows=default&accessories=prescription02&accessoriesColor=262e33&accessoriesProbability=100";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [initialQuestion]);

  useEffect(() => {
    return () => stopAudioPlayback();
  }, []);

  const stopAudioPlayback = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setPlayingMsgId(null);
  };

  const handlePlayAudio = async (msg: Message) => {
    if (playingMsgId === msg.id) {
      stopAudioPlayback();
      return;
    }
    stopAudioPlayback();

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      let audioData = msg.audioBase64;

      if (!audioData) {
        setLoadingAudioMsgId(msg.id);
        audioData = await generateAudioFromText(msg.text);
        if (audioData) {
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, audioBase64: audioData } : m));
        }
        setLoadingAudioMsgId(null);
      }

      if (audioData && audioContextRef.current) {
        const uint8Array = base64ToUint8Array(audioData);
        const audioBuffer = await decodeAudioData(uint8Array, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setPlayingMsgId(null);
          audioSourceRef.current = null;
        };
        
        source.start();
        audioSourceRef.current = source;
        setPlayingMsgId(msg.id);
      }
    } catch (error) {
      setLoadingAudioMsgId(null);
      alert("Não foi possível reproduzir o áudio.");
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    stopAudioPlayback();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToGemini(userMessage.text, history);

      if (responseText) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Desculpe, ocorreu um erro momentâneo. Por favor, tente novamente.',
        isError: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    stopAudioPlayback();
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: 'Histórico limpo. Como posso ajudar com sua inclusão e estudos hoje?',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-soft border border-white overflow-hidden relative">
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white/80 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
            <img src={AVATAR_IMAGE} alt="Prof. Clodoaldo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-law-900 leading-tight">Plantão de Dúvidas</h3>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <p className="text-xs text-slate-500 font-medium">IA Online</p>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
          title="Limpar conversa"
        >
          <Eraser size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                
                {/* Avatar Tiny Bubble */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mb-1 shadow-sm border border-slate-100 ${msg.role === 'user' ? 'hidden' : 'bg-white'}`}>
                  {msg.role === 'model' && (
                    <img src={AVATAR_IMAGE} alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`
                  p-4 md:p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-law-800 to-law-900 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-soft'}
                  ${msg.isError ? 'border-red-300 bg-red-50 text-red-800' : ''}
                `}>
                  {msg.text}
                </div>
              </div>

              {/* Action Buttons (Audio) */}
              {msg.role === 'model' && !msg.isError && (
                <div className="mt-2 ml-12">
                  <button
                    onClick={() => handlePlayAudio(msg)}
                    disabled={loadingAudioMsgId === msg.id}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                      ${playingMsgId === msg.id 
                        ? 'bg-gold-50 text-gold-700 ring-1 ring-gold-200' 
                        : 'bg-slate-50 text-slate-500 hover:bg-white hover:shadow-sm hover:text-law-700'}
                    `}
                  >
                    {loadingAudioMsgId === msg.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : playingMsgId === msg.id ? (
                      <StopCircle size={12} />
                    ) : (
                      <Volume2 size={12} />
                    )}
                    <span>{playingMsgId === msg.id ? 'Parar' : 'Ouvir'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start w-full pl-10">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="p-4 md:p-6 bg-transparent z-10">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex items-end gap-2 bg-white shadow-lg border border-slate-100 rounded-[28px] p-2 pl-4 focus-within:ring-2 focus-within:ring-law-100 transition-all duration-300">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua dúvida jurídica aqui..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 text-slate-700 placeholder-slate-400 py-3 text-[15px]"
              rows={1}
              style={{ minHeight: '48px' }}
            />
            
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              title="Enviar mensagem"
              className={`w-12 h-10 rounded-full flex items-center justify-center transition-all mb-1 ${
                isLoading || !inputText.trim()
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'bg-law-900 text-white hover:bg-law-700 hover:scale-105 shadow-md'
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-medium tracking-wide">
            IA do Professor Clodoaldo • Pode cometer erros • Confira informações importantes
          </p>
        </div>
      </div>
    </div>
  );
};