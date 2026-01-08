
import React from 'react';
import { ThemeColor } from '../types';

interface LoginProps {
  onLogin: () => void;
  themeColor: ThemeColor;
}

const Login: React.FC<LoginProps> = ({ onLogin, themeColor }) => {
  const colorMap = {
    emerald: 'bg-emerald-500 shadow-emerald-500/20 ring-emerald-500',
    indigo: 'bg-indigo-500 shadow-indigo-500/20 ring-indigo-500',
    rose: 'bg-rose-500 shadow-rose-500/20 ring-rose-500',
    amber: 'bg-amber-500 shadow-amber-500/20 ring-amber-500',
  };

  const textMap = {
    emerald: 'text-emerald-500',
    indigo: 'text-indigo-500',
    rose: 'text-rose-500',
    amber: 'text-amber-500',
  };

  const btnMap = {
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    rose: 'bg-rose-500 hover:bg-rose-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className={`w-full max-w-md p-8 rounded-3xl glass-morphism shadow-2xl transition-all duration-300`}>
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl ${colorMap[themeColor]}`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">MatchSkill</h1>
          <p className="text-slate-400 font-medium">Eleve sua carreira com inteligência</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">E-mail Corporativo</label>
            <input 
              type="email" 
              placeholder="seu@email.com"
              defaultValue="admin@matchskill.com"
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none transition-all placeholder-slate-600"
              style={{'--tw-ring-color': themeColor === 'emerald' ? '#10b981' : themeColor === 'indigo' ? '#6366f1' : themeColor === 'rose' ? '#f43f5e' : '#f59e0b'} as any}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Senha de Acesso</label>
            <input 
              type="password" 
              placeholder="••••••••"
              defaultValue="password"
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none transition-all placeholder-slate-600"
              required
            />
          </div>
          <button 
            type="submit"
            className={`w-full ${btnMap[themeColor]} active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-xl transition-all mt-4 text-lg`}
          >
            Entrar no App
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-10">
          Novo por aqui? <span className={`${textMap[themeColor]} font-bold cursor-pointer hover:underline`}>Criar conta</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
