
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

  const startInteraction = () => {
    audioService.resume().catch(console.error);
  };

  const handleStartSetup = (session: Session) => {
    startInteraction();
    setSelectedSession(JSON.parse(JSON.stringify(session)));
    setView('SETUP');
  };

  const handleCreateCustom = () => {
    startInteraction();
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
    startInteraction();
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white" onClick={startInteraction}>
      
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
                    className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between text-left hover:bg-slate-750 transition-colors active:scale-[0.98] group"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{session.name}</h3>
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                             <Zap size={10} className="fill-orange-400" /> {stats.calories} kcal
                           </span>
                           <FatBurnIndicator level={stats.fatBurnLevel} />
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1 mb-2">{session.description}</p>
                      <div className="flex gap-3 text-xs font-bold text-slate-500">
                        <span className="bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">{session.segments.length} TRAMOS</span>
                        <span className="bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">{Math.floor(session.segments.reduce((acc, s) => acc + s.duration, 0) / 60)} MIN</span>
                      </div>
                    </div>
                    <ChevronRight className="ml-4 text-slate-600 group-hover:text-emerald-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-8">
             <button 
              onClick={handleCreateCustom}
              className="w-full bg-slate-800/30 border-2 border-dashed border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-slate-400 hover:text-emerald-400"
             >
                <div className="bg-slate-800 p-3 rounded-full border border-slate-700">
                  <Plus size={24} />
                </div>
                <span className="font-bold">Nueva Sesión Personalizada</span>
             </button>
          </section>

          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800/80 backdrop-blur-lg border-t border-slate-700 flex justify-around items-center h-20 px-4 rounded-t-3xl shadow-2xl">
            <button className="flex flex-col items-center gap-1 text-emerald-400">
              <Dumbbell size={24} />
              <span className="text-[10px] font-bold uppercase">Entrenar</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500">
              <History size={24} />
              <span className="text-[10px] font-bold uppercase">Historial</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500">
              <Trophy size={24} />
              <span className="text-[10px] font-bold uppercase">Metas</span>
            </button>
          </nav>
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
        <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-6">
           <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-sm w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">¡SESIÓN COMPLETADA!</h2>
              <div className="flex flex-col gap-2 mb-8">
                <p className="text-slate-400">Has completado todos los tramos con éxito.</p>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 mt-2">
                   <span className="text-3xl font-black text-emerald-400">{calculateSessionStats(selectedSession.segments).calories}</span>
                   <span className="text-sm text-slate-500 block font-bold uppercase">Kilocalorías Quemadas</span>
                </div>
              </div>
              <button 
                onClick={() => setView('HOME')}
                className="w-full bg-emerald-500 text-slate-900 py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
              >
                VOLVER AL INICIO
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;
