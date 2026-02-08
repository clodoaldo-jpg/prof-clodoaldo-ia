import React, { useState } from 'react';
import { Scale, ChevronLeft } from 'lucide-react';
import { AppView } from './types';
import { ChatInterface } from './components/ChatInterface';
import { ProfessorCard } from './components/ProfessorCard';
import { VoiceInterface } from './components/VoiceInterface';
import { StudyPlanner } from './components/StudyPlanner';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.PROFILE);

  const handleNavigate = (view: 'CHAT' | 'SPEAK' | 'PLANNING') => {
    switch (view) {
      case 'CHAT': setActiveView(AppView.CHAT); break;
      case 'SPEAK': setActiveView(AppView.SPEAK); break;
      case 'PLANNING': setActiveView(AppView.PLANNING); break;
    }
  };

  const handleBackToHome = () => {
    setActiveView(AppView.PROFILE);
  };

  return (
    // h-[100dvh] garante que em celulares a barra de endereço do navegador não esconda o rodapé do app
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Background Decorativo Global */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-gold-100/40 rounded-full blur-[80px]" />
      </div>

      {/* Header Moderno (Glassmorphism) */}
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-md shadow-sm shrink-0">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {activeView !== AppView.PROFILE ? (
              <button 
                onClick={handleBackToHome}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 hover:text-law-900"
                title="Voltar ao início"
              >
                <ChevronLeft size={22} />
              </button>
            ) : (
               <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-law-800 to-law-900 rounded-lg text-white shadow-md">
                 <Scale size={18} />
               </div>
            )}
            
            <div className="flex flex-col">
              <h1 className="font-serif font-bold text-law-900 leading-none tracking-tight text-lg">
                Professor Clodoaldo Moreira
              </h1>
              <span className="text-[10px] text-gold-600 font-bold uppercase tracking-widest mt-0.5">
                Assistente Jurídico IA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-hidden relative w-full z-10">
        <div className="h-full w-full overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto h-full p-4 md:p-6 lg:p-8">
            
            {activeView === AppView.PROFILE && (
              <ProfessorCard onNavigate={handleNavigate} />
            )}

            {activeView === AppView.SPEAK && (
              <div className="h-full flex flex-col animate-fade-in-up">
                <VoiceInterface />
              </div>
            )}

            {activeView === AppView.CHAT && (
              <div className="h-full flex flex-col animate-fade-in-up">
                <ChatInterface />
              </div>
            )}

            {activeView === AppView.PLANNING && (
              <div className="h-full flex flex-col animate-fade-in-up">
                <StudyPlanner />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;