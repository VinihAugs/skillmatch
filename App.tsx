
import React, { useState, useEffect } from 'react';
import { Screen, UserSettings } from './types';
import Login from './components/Login';
import Settings from './components/Settings';
import Project from './components/Project';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('matchskill_settings_v2');
    return saved ? JSON.parse(saved) : { name: 'Candidato', apiKey: '', themeColor: 'emerald' };
  });

  useEffect(() => {
    localStorage.setItem('matchskill_settings_v2', JSON.stringify(settings));
  }, [settings]);

  const handleLogin = () => {
    setCurrentScreen(Screen.PROJECT);
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className={`min-h-screen text-slate-100 transition-colors duration-500`}>
      {currentScreen === Screen.LOGIN && (
        <Login onLogin={handleLogin} themeColor={settings.themeColor} />
      )}
      
      {currentScreen === Screen.SETTINGS && (
        <Settings 
          settings={settings} 
          onSave={(newSettings) => {
            setSettings(newSettings);
            setCurrentScreen(Screen.PROJECT);
          }} 
          onCancel={() => setCurrentScreen(Screen.PROJECT)}
        />
      )}

      {currentScreen === Screen.PROJECT && (
        <Project 
          settings={settings}
          onOpenSettings={() => navigateTo(Screen.SETTINGS)}
          onLogout={() => navigateTo(Screen.LOGIN)}
        />
      )}
    </div>
  );
};

export default App;
