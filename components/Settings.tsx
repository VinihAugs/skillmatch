
import React, { useState } from 'react';
import { UserSettings, ThemeColor } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onCancel: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);

  const colors: { id: ThemeColor; bg: string }[] = [
    { id: 'emerald', bg: 'bg-emerald-500' },
    { id: 'indigo', bg: 'bg-indigo-500' },
    { id: 'rose', bg: 'bg-rose-500' },
    { id: 'amber', bg: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-2xl mx-auto pt-16 px-4 pb-24">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black">Ajustes</h2>
          <p className="text-slate-400 mt-1">Configure sua identidade e preferências</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-8 rounded-3xl glass-morphism space-y-10">
        <section className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">Como quer ser chamado?</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Digite seu nome ou apelido"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">Gemini API Key</label>
            <input 
              type="password" 
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Sua chave secreta da API do Google"
            />
            <p className="text-xs mt-3 text-slate-500 leading-relaxed italic">
              * Sua chave é armazenada apenas neste navegador (LocalStorage).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Paleta de Cores</label>
            <div className="flex flex-wrap gap-4">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setFormData({ ...formData, themeColor: color.id })}
                  className={`relative w-14 h-14 rounded-2xl transition-all ${color.bg} ${formData.themeColor === color.id ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-900 scale-110 shadow-2xl' : 'opacity-60 hover:opacity-100'}`}
                >
                  {formData.themeColor === color.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="pt-6 flex gap-4">
          <button 
            onClick={() => onSave(formData)}
            className={`flex-1 bg-white text-slate-950 font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] hover:bg-slate-100`}
          >
            Salvar Preferências
          </button>
          <button 
            onClick={onCancel}
            className="px-8 py-4 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
