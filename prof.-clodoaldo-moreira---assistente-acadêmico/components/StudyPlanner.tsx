import React, { useState } from 'react';
import { BookOpen, Briefcase, CheckCircle, FileText, ArrowRight, ArrowLeft, UserCircle, Building, Building2, BrainCircuit, Accessibility } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';

export const StudyPlanner: React.FC = () => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<'CONCURSO' | 'ADVOCACIA' | null>(null);
  
  const [stage, setStage] = useState(''); 
  const [workModel, setWorkModel] = useState(''); 
  const [area, setArea] = useState('');
  const [difficulties, setDifficulties] = useState(''); 
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [limitations, setLimitations] = useState('');
  
  const [planHtml, setPlanHtml] = useState<string | null>(null);

  const handleGoalSelect = (selected: 'CONCURSO' | 'ADVOCACIA') => {
    setGoal(selected);
    setStage(''); setWorkModel(''); setStep(2);
  };
  const handleStageSelect = (s: string) => {
    setStage(s);
    goal === 'ADVOCACIA' ? setStep(3) : setStep(4);
  };
  const handleWorkModelSelect = (m: string) => {
    setWorkModel(m); setStep(4);
  };
  const handleAreaSubmit = () => { if (area.trim()) setStep(5); };
  const handleDifficultiesSubmit = () => setStep(6);
  const handleFinalSubmit = async () => {
    if (daysPerWeek && hoursPerDay) {
      setStep(7);
      try {
        const result = await generateStudyPlan(
          goal === 'CONCURSO' ? 'Concurso Público' : 'Advocacia Privada',
          stage, area, daysPerWeek, hoursPerDay, limitations, workModel, difficulties
        );
        setPlanHtml(result ?? ''); setStep(8);
      } catch (error) {
        alert("Erro ao gerar o plano."); setStep(6);
      }
    }
  };
  
  const handleDownloadWord = () => {
    if (!planHtml) return;
    
    // Cabeçalho aprimorado para o Word interpretar melhor o HTML como um documento formatado
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Plano de Carreira - Prof. Clodoaldo</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; }
          h2 { color: #2c3e50; border-bottom: 2px solid #b89247; padding-bottom: 5px; margin-top: 20px; font-size: 16pt; }
          h3 { color: #b89247; margin-top: 15px; font-size: 13pt; }
          ul { margin-bottom: 15px; }
          li { margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #2c3e50; color: white; padding: 10px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          strong { color: #2c3e50; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; font-size: 24pt;">Plano Estratégico & Cronograma</h1>
          <p style="color: #666; font-size: 12pt;">Mentoria Prof. Clodoaldo Moreira</p>
          <hr />
        </div>
    `;
    
    const footer = `
        <div style="margin-top: 50px; text-align: center; font-size: 9pt; color: #888;">
          <hr />
          <p>Gerado pela Inteligência Artificial do Professor Clodoaldo Moreira.</p>
        </div>
      </body>
      </html>
    `;

    const sourceHTML = header + planHtml + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Plano_Estrategico_${area.replace(/\s+/g, '_')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };
  
  // Componente de Botão de Opção
  const OptionCard = ({ icon: Icon, title, desc, onClick }: any) => (
    <button onClick={onClick} className="group flex flex-col items-start text-left bg-white p-6 rounded-2xl border border-slate-200 hover:border-gold-400 hover:shadow-lg transition-all duration-300 w-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-[60px] transition-colors group-hover:bg-gold-50"></div>
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-gold-500 group-hover:text-white transition-colors z-10">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg text-law-900 mb-1 z-10">{title}</h3>
      <p className="text-sm text-slate-500 z-10">{desc}</p>
    </button>
  );

  const StepHeader = ({ title, sub }: any) => (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-serif font-bold text-law-900 mb-2">{title}</h2>
      <p className="text-slate-500">{sub}</p>
    </div>
  );

  const ProgressBar = ({ current }: {current: number}) => (
    <div className="w-full h-1.5 bg-slate-100 rounded-full mb-8 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-law-700 to-gold-500 transition-all duration-500" style={{ width: `${(current / 8) * 100}%` }}></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-full animate-fade-in flex flex-col">
      {step < 8 && <ProgressBar current={step} />}
      
      {/* 1: Objetivo */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center">
          <StepHeader title="Planejamento de Carreira" sub="Vamos construir uma estratégia vencedora para você." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OptionCard onClick={() => handleGoalSelect('CONCURSO')} icon={BookOpen} title="Estudos e Concursos" desc="OAB, Magistratura, MP ou Faculdade." />
            <OptionCard onClick={() => handleGoalSelect('ADVOCACIA')} icon={Briefcase} title="Advocacia Privada" desc="Empreendedorismo e prática jurídica." />
          </div>
        </div>
      )}

      {/* 2: Fase */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto w-full">
           <button onClick={() => setStep(1)} className="mb-6 flex items-center text-slate-400 hover:text-law-900 transition-colors text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Voltar</button>
           <StepHeader title="Qual seu momento atual?" sub="Isso ajuda a calibrar a profundidade do plano." />
           <div className="space-y-3">
             {(goal === 'CONCURSO' 
               ? ["Graduação (Faculdade)", "Preparação OAB", "Concurseiro Iniciante", "Concurseiro Avançado", "Pós-graduação"]
               : ["Iniciante (Estudante/Recém-formado)", "Advogado Júnior (até 3 anos)", "Advogado Pleno/Sênior", "Transição de Carreira"]
             ).map(opt => (
               <button key={opt} onClick={() => handleStageSelect(opt)} className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-law-600 hover:shadow-md transition-all font-medium text-slate-700 flex justify-between group">
                 {opt} <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-law-600" />
               </button>
             ))}
           </div>
        </div>
      )}

      {/* 3: Modelo (Adv) */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto w-full">
          <button onClick={() => setStep(2)} className="mb-6 flex items-center text-slate-400 hover:text-law-900 transition-colors text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Voltar</button>
          <StepHeader title="Modelo de Atuação" sub="Como você pretende exercer a advocacia?" />
          <div className="grid gap-4">
            <OptionCard onClick={() => handleWorkModelSelect('Autônomo/Escritório Próprio')} icon={UserCircle} title="Autônomo / Escritório Próprio" desc="Gestão total do negócio." />
            <OptionCard onClick={() => handleWorkModelSelect('Escritório de Terceiros')} icon={Building2} title="Associado / Contratado" desc="Foco na execução técnica." />
            <OptionCard onClick={() => handleWorkModelSelect('Departamento Jurídico')} icon={Building} title="Jurídico Interno (In-house)" desc="Atuação corporativa." />
          </div>
        </div>
      )}

      {/* 4: Área */}
      {step === 4 && (
        <div className="max-w-xl mx-auto w-full flex flex-col justify-center flex-1">
          <button onClick={() => setStep(goal === 'ADVOCACIA' ? 3 : 2)} className="mb-6 flex items-center text-slate-400 hover:text-law-900 transition-colors text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Voltar</button>
          <StepHeader title={goal === 'CONCURSO' ? 'Seu Foco Principal' : 'Área de Interesse'} sub="Ex: Juiz de Direito, Penal, Trabalhista..." />
          <div className="relative">
             <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-5 bg-white border border-slate-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-law-500 focus:border-transparent outline-none text-xl text-center font-serif placeholder:font-sans" placeholder="Digite seu objetivo aqui..." />
          </div>
          <button onClick={handleAreaSubmit} disabled={!area.trim()} className="mt-6 w-full bg-law-900 text-white py-4 rounded-xl font-bold hover:bg-law-800 disabled:opacity-50 transition-all shadow-lg flex justify-center items-center gap-2">
            Continuar <ArrowRight size={20} />
          </button>
        </div>
      )}

      {/* 5: Dificuldades */}
      {step === 5 && (
        <div className="max-w-xl mx-auto w-full flex-1">
          <button onClick={() => setStep(4)} className="mb-6 flex items-center text-slate-400 hover:text-law-900 transition-colors text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Voltar</button>
          <StepHeader title="Mapeamento de Dificuldades" sub="Onde você sente que precisa de mais ajuda?" />
          <textarea value={difficulties} onChange={(e) => setDifficulties(e.target.value)} className="w-full p-5 bg-white border border-slate-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-law-500 outline-none min-h-[150px] text-lg resize-none" placeholder="Ex: Tenho dificuldade em Processo Civil e Prazos. Gosto de Penal..." />
          <button onClick={handleDifficultiesSubmit} className="mt-6 w-full bg-law-900 text-white py-4 rounded-xl font-bold hover:bg-law-800 transition-all shadow-lg">Continuar</button>
        </div>
      )}

      {/* 6: Disponibilidade */}
      {step === 6 && (
        <div className="max-w-2xl mx-auto w-full">
           <button onClick={() => setStep(5)} className="mb-6 flex items-center text-slate-400 hover:text-law-900 transition-colors text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Voltar</button>
           <StepHeader title="Tempo e Inclusão" sub="Personalize para sua rotina real." />
           <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-soft space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-sm font-bold text-law-900 mb-2 block">Dias por semana</label>
                   <select value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-law-500"><option value="">Selecione...</option>{[1,2,3,4,5,6,7].map(d=><option key={d} value={d}>{d}</option>)}</select>
                </div>
                <div>
                   <label className="text-sm font-bold text-law-900 mb-2 block">Horas por dia</label>
                   <select value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-law-500"><option value="">Selecione...</option>{[1,2,3,4,5,6,7,8,9,10].map(h=><option key={h} value={h}>{h}</option>)}</select>
                </div>
             </div>
             <div>
               <label className="flex items-center gap-2 text-sm font-bold text-law-900 mb-2"><Accessibility size={16} className="text-blue-600"/> Necessidades Especiais (Opcional)</label>
               <textarea value={limitations} onChange={(e) => setLimitations(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-xl min-h-[100px] text-sm focus:ring-2 focus:ring-law-500" placeholder="Possui alguma deficiência ou neurodivergência? (Ex: TDAH, Baixa Visão...)" />
             </div>
             <button onClick={handleFinalSubmit} disabled={!daysPerWeek || !hoursPerDay} className="w-full bg-gold-500 text-white py-4 rounded-xl font-bold hover:bg-gold-600 shadow-glow transition-all flex justify-center items-center gap-2">
                <BrainCircuit size={20} /> Gerar Plano de Alta Performance
             </button>
           </div>
        </div>
      )}

      {/* 7: Loading */}
      {step === 7 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
           <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-gold-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-law-900"><BrainCircuit size={32} /></div>
           </div>
           <h3 className="text-2xl font-serif font-bold text-law-900">Processando Estratégia...</h3>
           <p className="text-slate-500 mt-2">O Professor Clodoaldo está desenhando sua rota de aprovação/sucesso.</p>
        </div>
      )}

      {/* 8: Resultado */}
      {step === 8 && (
         <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden pb-10">
            <div className="bg-law-900 text-white p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold flex items-center gap-3">
                     <CheckCircle className="text-green-400" /> Plano Estratégico Definido
                  </h2>
                  <p className="text-law-200 mt-1 opacity-80">Rota personalizada para {area}</p>
               </div>
               
               {/* Área de Download Ajustada */}
               <div className="flex flex-col md:flex-row items-center gap-4">
                  <span className="text-white/80 font-medium tracking-wide text-sm hidden md:block">
                    Baixe seu plano oficial:
                  </span>
                  <button onClick={handleDownloadWord} className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105">
                     <FileText size={20}/> Baixar DOC (Word)
                  </button>
               </div>
            </div>
            {/* Ajuste de padding para mobile: p-6 ao invés de p-8/12 */}
            <div className="p-6 md:p-12">
               <div className="prose prose-slate prose-lg max-w-none 
                  prose-headings:font-serif prose-h2:text-law-900 prose-h3:text-gold-600 
                  prose-a:text-gold-600 prose-strong:text-law-900
                  prose-li:marker:text-gold-500" 
                  dangerouslySetInnerHTML={{ __html: planHtml || '' }} />
               <button onClick={() => setStep(1)} className="mt-12 text-slate-400 hover:text-law-900 text-sm font-bold flex items-center justify-center mx-auto transition-colors">← Criar novo plano</button>
            </div>
         </div>
      )}
    </div>
  );
};