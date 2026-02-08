import React from 'react';
import { Mic, MessageSquare, ArrowRight, CalendarCheck, HeartHandshake, CheckCircle2, Infinity } from 'lucide-react';

interface ProfessorCardProps {
  onNavigate: (mode: 'CHAT' | 'SPEAK' | 'PLANNING') => void;
}

export const ProfessorCard: React.FC<ProfessorCardProps> = ({ onNavigate }) => {
  // accessories=prescription02 (óculos) e accessoriesColor=262e33 (preto)
  const AVATAR_IMAGE = "https://api.dicebear.com/9.x/avataaars/svg?seed=DrClodoaldoAdvogado&clothing=blazerAndShirt&facialHair=beardMajestic&top=shortFlat&hairColor=2c1b18&skinColor=edb98a&mouth=smile&eyes=happy&eyebrows=default&accessories=prescription02&accessoriesColor=262e33&accessoriesProbability=100";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-fade-in pb-10">
      
      {/* Hero Section */}
      <div className="text-center mb-10 relative w-full max-w-4xl mx-auto px-4">
        
        {/* Badge de Gratuidade */}
        <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 px-4 py-1.5 rounded-full text-green-800 text-xs font-bold uppercase tracking-wider mb-6 hover:scale-105 transition-transform cursor-default shadow-sm">
           <Infinity size={14} />
           <span>100% Gratuito • Para Todos</span>
        </div>

        <div className="inline-block relative group cursor-default mb-4">
          <div className="absolute inset-0 bg-gold-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full"></div>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white shadow-xl mx-auto transition-transform duration-500 group-hover:scale-105">
             <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 border-4 border-white">
                <img 
                  src={AVATAR_IMAGE} 
                  alt="Professor Clodoaldo Moreira" 
                  className="w-full h-full object-contain"
                />
             </div>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-serif font-black text-law-900 mb-4 tracking-tight">
          Sua Mentoria Jurídica Inteligente
        </h1>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Sou o <strong>Professor Clodoaldo Moreira</strong>. Criei esta plataforma para democratizar o ensino jurídico.
          Seja você aluno, advogado ou cidadão, use esta IA para estudar e tirar dúvidas <strong>sem custo algum</strong>.
        </p>
      </div>

      {/* Grid de Ações - Cartões Explicativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 w-full mb-12 max-w-6xl">
        
        {/* Card Voz */}
        <button 
          onClick={() => onNavigate('SPEAK')}
          className="group relative bg-white rounded-3xl p-6 text-left shadow-soft hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Mic size={24} />
            </div>
            <h3 className="text-xl font-bold text-law-900 mb-2">Conversa por Voz</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow">
              Converse naturalmente comigo como se estivesse em uma sala de aula. Ideal para treinar oratória, simular audiências ou tirar dúvidas complexas falando, sem precisar digitar.
            </p>
            <div className="flex items-center text-red-600 font-bold text-sm group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50">
              <span>Falar agora</span>
              <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </button>

        {/* Card Chat */}
        <button 
          onClick={() => onNavigate('CHAT')}
          className="group relative bg-white rounded-3xl p-6 text-left shadow-soft hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-law-50 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-law-100 text-law-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-law-700 group-hover:text-white transition-colors">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-bold text-law-900 mb-2">Chat Jurídico</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow">
              Receba respostas fundamentadas em Lei, Doutrina e Jurisprudência por texto. Peça modelos de peças, resumos de matérias ou análise de casos concretos.
            </p>
            <div className="flex items-center text-law-700 font-bold text-sm group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50">
              <span>Digitar dúvida</span>
              <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </button>

        {/* Card Planejamento */}
        <button 
          onClick={() => onNavigate('PLANNING')}
          className="group relative bg-white rounded-3xl p-6 text-left shadow-soft hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-50 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-gold-100 text-gold-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-gold-500 group-hover:text-white transition-colors">
              <CalendarCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-law-900 mb-2">Coach Jurídico</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow">
              Vou criar um plano estratégico para sua carreira. Seja um cronograma de estudos para Concursos ou um plano de negócios para alavancar sua Advocacia.
            </p>
            <div className="flex items-center text-gold-600 font-bold text-sm group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50">
              <span>Criar estratégia</span>
              <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </button>

      </div>

      {/* Banner de Inclusão Moderno */}
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-r from-white to-blue-50 rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="flex-shrink-0 bg-blue-100 p-4 rounded-full text-blue-600">
           <HeartHandshake size={32} />
        </div>
        <div className="text-center md:text-left flex-1">
           <h4 className="font-bold text-law-900 text-lg mb-2 flex items-center justify-center md:justify-start gap-2">
             Compromisso Social e Inclusão
           </h4>
           <div className="text-slate-600 text-sm space-y-2">
             <p>Esta ferramenta foi desenvolvida pensando em você. Ela é adaptada para Pessoas com Deficiência (PCD) e neurodivergentes.</p>
             <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Leitor de Tela Compatível</span>
                <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Comandos de Voz</span>
                <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Linguagem Clara</span>
             </div>
           </div>
        </div>
      </div>
      
      <div className="mt-8 text-center opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Desenvolvido com IA Google Gemini • Veredicto IA</p>
      </div>

    </div>
  );
};