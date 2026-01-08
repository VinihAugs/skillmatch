
import React, { useState, useRef } from 'react';
import { UserSettings, AnalysisResult, ThemeColor } from '../types';
import { analyzeMatch } from '../services/geminiService';

declare const pdfjsLib: any;

interface ProjectProps {
  settings: UserSettings;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const Project: React.FC<ProjectProps> = ({ settings, onOpenSettings, onLogout }) => {
  const [jobDesc, setJobDesc] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copying, setCopying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeClasses = {
    emerald: 'bg-emerald-500 shadow-emerald-500/30',
    indigo: 'bg-indigo-500 shadow-indigo-500/30',
    rose: 'bg-rose-500 shadow-rose-500/30',
    amber: 'bg-amber-500 shadow-amber-500/30',
  };

  const textClasses = {
    emerald: 'text-emerald-500',
    indigo: 'text-indigo-500',
    rose: 'text-rose-500',
    amber: 'text-amber-500',
  };

  const borderClasses = {
    emerald: 'border-emerald-500/20 shadow-emerald-500/5 bg-emerald-500/5',
    indigo: 'border-indigo-500/20 shadow-indigo-500/5 bg-indigo-500/5',
    rose: 'border-rose-500/20 shadow-rose-500/5 bg-rose-500/5',
    amber: 'border-amber-500/20 shadow-amber-500/5 bg-amber-500/5',
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    setFileName(file.name);
    setExtracting(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        if (!fullText.trim()) {
          throw new Error("Não foi possível extrair texto deste PDF. Tente um arquivo diferente.");
        }

        setResumeText(fullText);
        setExtracting(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error(err);
      setError("Falha ao processar o PDF.");
      setExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!settings.apiKey) {
      setError("Configure sua Gemini API Key nas definições.");
      return;
    }
    if (!jobDesc || !resumeText) {
      setError("Insira a descrição da vaga e faça upload do currículo.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeMatch(jobDesc, resumeText, settings.apiKey);
      setResult(data);
      setTimeout(() => {
        document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Erro de processamento.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.linkedinPost) return;
    navigator.clipboard.writeText(result.linkedinPost);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const openLinkedInJobs = () => {
    if (!result?.jobSearchQuery) return;
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(result.jobSearchQuery)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl ${themeClasses[settings.themeColor]}`}>
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight leading-none mb-1">MatchSkill</h1>
            <p className="text-slate-400 font-medium">Bem-vindo, <span className={`font-bold ${textClasses[settings.themeColor]}`}>{settings.name}</span></p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass-morphism hover:bg-white/10 transition-all font-bold text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Configurar
          </button>
          <button 
            onClick={onLogout}
            className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-all font-bold text-sm"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Descrição da Oportunidade</label>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-400">TEXTO</span>
          </div>
          <textarea 
            className="w-full h-80 p-6 rounded-3xl glass-morphism focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none transition-all resize-none placeholder-slate-600 leading-relaxed text-slate-200"
            style={{'--tw-ring-color': settings.themeColor === 'emerald' ? '#10b981' : settings.themeColor === 'indigo' ? '#6366f1' : settings.themeColor === 'rose' ? '#f43f5e' : '#f59e0b'} as any}
            placeholder="Cole aqui os requisitos da vaga..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          ></textarea>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Seu Currículo Profissional</label>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-400">PDF ONLY</span>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-80 flex flex-col items-center justify-center p-8 rounded-3xl glass-morphism border-2 border-dashed border-white/10 cursor-pointer transition-all group relative overflow-hidden ${fileName ? 'border-emerald-500/50' : 'hover:border-white/30'}`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
            {extracting ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="font-bold text-slate-300 text-center">Lendo PDF...</p>
              </div>
            ) : fileName ? (
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl mb-4 mx-auto flex items-center justify-center ${themeClasses[settings.themeColor]}`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="text-xl font-black text-slate-100 mb-1 truncate max-w-xs px-4">{fileName}</h4>
                <p className="text-sm text-slate-500 mb-6 font-medium">Extração completa!</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFileName(null); setResumeText(''); }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest bg-red-400/10 px-4 py-2 rounded-xl"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="text-center group">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <h4 className="text-lg font-bold mb-2">Upload de Currículo</h4>
                <p className="text-sm text-slate-500 max-w-[200px] mx-auto font-medium leading-relaxed">Clique para selecionar seu arquivo PDF profissional.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Button Action */}
      <div className="flex flex-col items-center">
        <button 
          onClick={handleAnalyze}
          disabled={loading || extracting}
          className={`group relative flex items-center gap-4 px-12 py-5 rounded-3xl font-black text-xl text-white shadow-2xl transition-all active:scale-[0.98] ${loading || extracting ? 'bg-slate-700 cursor-not-allowed opacity-50' : `${themeClasses[settings.themeColor]} hover:scale-105`}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processando IA...
            </>
          ) : (
            <>
              Gerar Relatório de Match
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </>
          )}
        </button>
        {error && <p className="mt-6 text-rose-400 font-bold bg-rose-400/10 px-6 py-2 rounded-full border border-rose-400/20">{error}</p>}
      </div>

      {/* Results View */}
      {result && (
        <div id="results-view" className="mt-24 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col items-center text-center space-y-4">
            <span className={`text-xs font-black uppercase tracking-[0.4em] ${textClasses[settings.themeColor]}`}>Análise Estratégica Finalizada</span>
            <h2 className="text-5xl font-black">Score de Compatibilidade</h2>
            <div className={`h-2 w-32 rounded-full ${themeClasses[settings.themeColor]}`}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-3xl border-2 shadow-2xl flex flex-col ${borderClasses.emerald}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-xl font-black text-emerald-400">Pontos Fortes</h4>
              </div>
              <ul className="space-y-4 flex-grow">
                {result.strengths.map((item, i) => (
                  <li key={i} className="flex gap-4 text-sm leading-relaxed text-slate-300 font-medium italic">
                    <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-emerald-500 rounded-full"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-8 rounded-3xl border-2 shadow-2xl flex flex-col ${borderClasses.amber}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-xl font-black text-amber-400">Gaps Identificados</h4>
              </div>
              <ul className="space-y-4 flex-grow">
                {result.weaknesses.map((item, i) => (
                  <li key={i} className="flex gap-4 text-sm leading-relaxed text-slate-300 font-medium italic">
                    <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-amber-500 rounded-full"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-8 rounded-3xl border-2 shadow-2xl flex flex-col ${borderClasses.indigo}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-xl font-black text-indigo-400">Próximos Passos</h4>
              </div>
              <ul className="space-y-4 flex-grow">
                {result.improvementPlan.map((item, i) => (
                  <li key={i} className="flex gap-4 text-sm leading-relaxed text-slate-300 font-medium italic">
                    <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-indigo-500 rounded-full"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LinkedIn and Job Search Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LinkedIn Post Prompt */}
            <div className="p-10 rounded-3xl glass-morphism border border-white/10 shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-2xl font-black">LinkedIn Power Post</h4>
                  <p className="text-slate-400 font-medium">Um rascunho otimizado para sua rede</p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${copying ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'}`}
                >
                  {copying ? 'Copiado!' : 'Copiar Texto'}
                </button>
              </div>
              <div className="bg-slate-950/40 p-6 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap min-h-[160px]">
                {result.linkedinPost}
              </div>
            </div>

            {/* Smart Job Search */}
            <div className="p-10 rounded-3xl glass-morphism border border-white/10 shadow-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 rounded-2xl ${themeClasses[settings.themeColor]} text-white shadow-xl`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">Radar de Oportunidades</h4>
                    <p className="text-slate-400 font-medium">Vagas que dão match com seu perfil</p>
                  </div>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-8">
                  <p className="text-xs uppercase font-black text-slate-500 tracking-widest mb-2">Busca Otimizada</p>
                  <p className="text-lg font-bold text-slate-200">"{result.jobSearchQuery}"</p>
                </div>
              </div>
              <button 
                onClick={openLinkedInJobs}
                className={`w-full py-5 rounded-2xl text-white font-black text-lg transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 ${themeClasses[settings.themeColor]} hover:brightness-110`}
              >
                Buscar Vagas no LinkedIn
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </button>
            </div>
          </div>

          {/* Strategy Section */}
          <div className="p-10 rounded-3xl glass-morphism border-t-4 border-white/10 shadow-3xl relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 opacity-5">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
             </div>
            <div className="flex items-center gap-6 mb-10">
              <div className={`p-4 rounded-2xl ${themeClasses[settings.themeColor]} text-white`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9l-4 4v-4H3a2 2 0 01-2-2V10a2 2 0 012-2h2m2 4h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h4 className="text-3xl font-black">Hack de Entrevista</h4>
                <p className="text-slate-400 font-medium">Argumentos chave para convencer o recrutador</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.interviewTips.map((tip, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex gap-5 items-start hover:bg-white/[0.08] transition-all group shadow-sm">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${themeClasses[settings.themeColor]} group-hover:scale-110 transition-transform`}>{i + 1}</span>
                  <p className="text-slate-300 font-medium leading-relaxed italic">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
