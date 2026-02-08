import React, { useState } from 'react';
    import { UploadCloud, FileText, CheckCircle, AlertCircle, FileSearch, Loader2 } from 'lucide-react';
    import { analyzeDocumentWithGemini } from '../services/geminiService';
    
    export const DocumentAnalyzer: React.FC = () => {
      const [selectedFile, setSelectedFile] = useState<File | null>(null);
      const [analysisPrompt, setAnalysisPrompt] = useState('');
      const [result, setResult] = useState<string | null>(null);
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [error, setError] = useState<string | null>(null);
    
      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
          setSelectedFile(event.target.files[0]);
          setError(null);
          setResult(null);
        }
      };
    
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
              const base64String = reader.result.split(',')[1];
              resolve(base64String);
            } else {
              reject(new Error("Falha ao ler arquivo"));
            }
          };
          reader.onerror = error => reject(error);
        });
      };
    
      const handleAnalyze = async () => {
        if (!selectedFile) {
          setError("Por favor, selecione um arquivo.");
          return;
        }
    
        setIsAnalyzing(true);
        setError(null);
    
        try {
          const base64 = await fileToBase64(selectedFile);
          const prompt = analysisPrompt || "Faça um resumo jurídico detalhado deste documento, apontando os principais pontos de atenção.";
          
          const analysisText = await analyzeDocumentWithGemini(base64, selectedFile.type, prompt);
          
          if (analysisText) {
            setResult(analysisText);
          } else {
            setError("Não foi possível gerar uma análise para este documento.");
          }
        } catch (err) {
          setError("Erro ao processar o documento. Tente um arquivo menor ou um formato diferente (PDF, Imagem, Texto).");
        } finally {
          setIsAnalyzing(false);
        }
      };
    
      return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-serif font-bold text-law-900 mb-2">Análise Documental Inteligente</h2>
            <p className="text-slate-600 mb-6">
              Envie petições, contratos, acórdãos ou fotos de documentos. A IA do Professor Clodoaldo analisará o conteúdo para você.
            </p>
    
            {/* Upload Area */}
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${selectedFile ? 'border-law-500 bg-law-50' : 'border-slate-300 hover:border-law-400 hover:bg-slate-50'}`}>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf, .txt, .doc, .docx, image/*"
              />
              
              {!selectedFile ? (
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-law-100 text-law-600 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={32} />
                  </div>
                  <span className="text-law-800 font-semibold text-lg">Clique para fazer upload</span>
                  <span className="text-slate-500 text-sm mt-2">PDF, DOCX, TXT ou Imagens</span>
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <FileText size={32} />
                  </div>
                  <span className="text-law-900 font-semibold text-lg">{selectedFile.name}</span>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 text-sm mt-2 hover:underline"
                  >
                    Remover arquivo
                  </button>
                </div>
              )}
            </div>
    
            {/* Prompt Area */}
            {selectedFile && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">O que você deseja saber sobre este documento?</label>
                  <textarea
                    value={analysisPrompt}
                    onChange={(e) => setAnalysisPrompt(e.target.value)}
                    placeholder="Ex: Resuma os pedidos desta petição; Encontre cláusulas abusivas neste contrato; Explique a fundamentação deste acórdão..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-law-300 focus:border-law-500 outline-none min-h-[100px]"
                  />
                </div>
    
                <div className="flex justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-law-700 hover:bg-law-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <FileSearch size={20} />
                        Analisar Documento
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
    
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                <AlertCircle size={20} />
                {error}
              </div>
            )}
          </div>
    
          {/* Result Area */}
          {result && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-slide-up">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <CheckCircle className="text-green-600" size={28} />
                <h3 className="text-xl font-serif font-bold text-law-900">Análise Concluída</h3>
              </div>
              <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <strong>Nota:</strong> Esta análise é gerada automaticamente por Inteligência Artificial e deve ser validada por um profissional humano.
              </div>
            </div>
          )}
        </div>
      );
    };