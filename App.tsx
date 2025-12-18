
import React, { useState } from 'react';
import { ViewState, Session } from './types.ts';
import { DEFAULT_SESSIONS, MIN_SEGMENTS } from './constants.ts';
import { WorkoutSetup } from './components/WorkoutSetup.tsx';
import { WorkoutRunner } from './components/WorkoutRunner.tsx';
import { calculateSessionStats } from './services/statsService.ts';
import { audioService } from './services/audioService.ts';
import { Dumbbell, Plus, ChevronRight, Trophy, History, Activity, Flame, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const startAudio = () => {
    audioService.resume().catch(() => {});
  };

  const handleStartSetup = (session: Session) => {
    startAudio();
    setSelectedSession(JSON.parse(JSON.stringify(session)));
    setView('SETUP');
  };

  const handleCreateCustom = () => {
    startAudio();
    const custom: Session = {
      id: `custom-${Date.now()}`,
      name: 'Sesión Personalizada',
      description: 'Define tus propios objetivos de velocidad e inclinación.',
      isCustom: true,
      segments: Array.from({ length: MIN_SEGMENTS }, (_, i) => ({
        id: `s-${i}`,
        duration: 180,
        speed: 5,
        incline: 0
      }))
    };
    setSelectedSession(custom);
    setView('SETUP');
  };

  const handleStartActive = (session: Session) => {
    startAudio();
    setSelectedSession(session);
    setView('ACTIVE');
  };

  const handleFinish = () => {
    setView('SUMMARY');
  };

  const FatBurnIndicator = ({ level }: { level: number }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Flame 
            key={i} 
            size={12} 
            className={i <= level ? 'text-orange-500 fill-orange-500' : 'text-slate-700'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans" onClick={startAudio}>
      
      {view === 'HOME' && (
        <div className="max-w-md mx-auto p-6 pb-24">
          <header className="py-8 mb-4">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-2">
              <Activity className="text-emerald-400" size={36} />
              TreadPro
            </h1>
            <p className="text-slate-400 font-medium">Lleva tu entrenamiento al siguiente nivel.</p>
          </header>

          <section className="mb-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Planes Definidos</h2>
            <div className="grid gap-4">
              {DEFAULT_SESSIONS.map((session) => {
                const stats = calculateSessionStats(session.segments);
                return (
                  <button 
                    key={session.id}
                    onClick={() => handleStartSetup(session)}
                    className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between text-left active:scale-[0.98] transition-transform group"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-white group-active:text-emerald-400">{session.name}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{session.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Zap size={14} className="text-emerald-400" />
                          <span className="text-xs font-bold">{stats.calories} kcal</span>
                        </div>
                        <FatBurnIndicator level={stats.fatBurnLevel} />
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600 group-active:text-emerald-400" size={20} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Personalizado</h2>
            <button 
              onClick={handleCreateCustom}
              className="w-full bg-slate-800 p-5 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center gap-3 text-slate-400 hover:text-emerald-400 hover:border-emerald-400/50 transition-colors"
            >
              <Plus size={24} />
              <span className="font-bold">Nueva Sesión Personalizada</span>
            </button>
          </section>

          <div className="flex gap-4 opacity-50">
             <div className="flex-1 bg-slate-800/50 p-4 rounded-xl flex flex-col items-center">
                <Trophy size={20} className="mb-1" />
                <span className="text-[10px] font-bold uppercase">Logros</span>
             </div>
             <div className="flex-1 bg-slate-800/50 p-4 rounded-xl flex flex-col items-center">
                <History size={20} className="mb-1" />
                <span className="text-[10px] font-bold uppercase">Historial</span>
             </div>
          </div>
        </div>
      )}

      {view === 'SETUP' && selectedSession && (
        <WorkoutSetup 
          session={selectedSession} 
          onStart={handleStartActive} 
          onBack={() => setView('HOME')} 
        />
      )}

      {view === 'ACTIVE' && selectedSession && (
        <WorkoutRunner 
          session={selectedSession} 
          onFinish={handleFinish} 
          onCancel={() => setView('HOME')} 
        />
      )}

      {view === 'SUMMARY' && selectedSession && (
        <div className="max-w-md mx-auto p-8 flex flex-col items-center justify-center min-h-screen text-center">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <Trophy size={48} className="text-slate-900" />
          </div>
          <h1 className="text-3xl font-black mb-2">¡SESIÓN COMPLETADA!</h1>
          <p className="text-slate-400 mb-8">Has terminado el entrenamiento "{selectedSession.name}".</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Calorías Est.</span>
              <span className="text-3xl font-black text-emerald-400">{calculateSessionStats(selectedSession.segments).calories}</span>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tiempo Total</span>
              <span className="text-3xl font-black text-blue-400">
                {Math.floor(selectedSession.segments.reduce((acc, s) => acc + s.duration, 0) / 60)}m
              </span>
            </div>
          </div>

          <button 
            onClick={() => setView('HOME')}
            className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-lg shadow-xl"
          >
            VOLVER AL INICIO
          </button>
        </div>
      )}
    </div>
  );
};

// Fix for index.tsx error: adding default export
export default App;
