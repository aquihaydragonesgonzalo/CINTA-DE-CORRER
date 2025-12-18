
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Dumbbell, Plus, ChevronRight, Trophy, History, 
  Activity, Flame, Zap, Play, Pause, SkipForward, 
  Square, ChevronLeft, Clock, Trash2 
} from 'lucide-react';

// --- TIPOS ---
interface Segment {
  id: string;
  duration: number;
  speed: number;
  incline: number;
}

interface Session {
  id: string;
  name: string;
  description: string;
  segments: Segment[];
  isCustom?: boolean;
}

type ViewState = 'HOME' | 'SETUP' | 'ACTIVE' | 'SUMMARY';

// --- CONSTANTES ---
const MIN_SEGMENTS = 5;
const MAX_SPEED = 15;
const MAX_INCLINE = 15;

const DEFAULT_SESSIONS: Session[] = [
  {
    id: 'hiit-gonzalo',
    name: 'HIIT GONZALO',
    description: 'Alta intensidad con escalada piramidal y enfriamiento progresivo.',
    segments: [
      { id: 'g1', duration: 300, speed: 3.5, incline: 5 },
      { id: 'g2', duration: 360, speed: 4.5, incline: 8 },
      { id: 'g3', duration: 360, speed: 4.5, incline: 11 },
      { id: 'g4', duration: 360, speed: 4.5, incline: 9 },
      { id: 'g5', duration: 360, speed: 4.5, incline: 12 },
      { id: 'g6', duration: 60, speed: 4.5, incline: 13 },
      { id: 'g7', duration: 60, speed: 4.5, incline: 14 },
      { id: 'g8', duration: 60, speed: 4.5, incline: 15 },
      { id: 'g9', duration: 30, speed: 4, incline: 14 },
      { id: 'g10', duration: 30, speed: 4, incline: 13 },
      { id: 'g11', duration: 30, speed: 4, incline: 12 },
      { id: 'g12', duration: 30, speed: 4, incline: 11 },
      { id: 'g13', duration: 30, speed: 4, incline: 10 },
      { id: 'g14', duration: 30, speed: 4, incline: 9 },
      { id: 'g15', duration: 30, speed: 4, incline: 8 },
      { id: 'g16', duration: 30, speed: 4, incline: 7 },
      { id: 'g17', duration: 30, speed: 4, incline: 6 },
      { id: 'g18', duration: 30, speed: 3.5, incline: 5 },
      { id: 'g19', duration: 30, speed: 3.5, incline: 4 },
      { id: 'g20', duration: 30, speed: 3, incline: 3 },
      { id: 'g21', duration: 60, speed: 2, incline: 2 },
    ]
  },
  {
    id: 'fat-burn',
    name: 'Quema Grasas',
    description: 'Intervalos constantes para optimizar la oxidación de lípidos.',
    segments: [
      { id: '1', duration: 300, speed: 5, incline: 1 },
      { id: '2', duration: 300, speed: 6, incline: 2 },
      { id: '3', duration: 300, speed: 6.5, incline: 3 },
      { id: '4', duration: 300, speed: 6, incline: 2 },
      { id: '5', duration: 300, speed: 5, incline: 1 },
    ]
  }
];

// --- LOGICA DE AUDIO ---
class AudioController {
  private ctx: AudioContext | null = null;
  resume() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  beep(freq = 880, dur = 200) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur / 1000);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur / 1000);
  }
}
const audio = new AudioController();

// --- COMPONENTES AUXILIARES ---

const SimpleWorkoutChart = ({ segments, currentIndex }: { segments: Segment[], currentIndex: number }) => {
  const maxVal = 15;
  const width = 100;
  const height = 40;
  const step = width / segments.length;

  return (
    <div className="w-full h-24 bg-slate-800/30 rounded-xl overflow-hidden mt-6 relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
        {/* Velocidad - Azul */}
        <path
          d={`M 0 ${height} ${segments.map((s, i) => `L ${i * step} ${height - (s.speed / maxVal) * height} L ${(i + 1) * step} ${height - (s.speed / maxVal) * height}`).join(' ')} L ${width} ${height} Z`}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="0.5"
        />
        {/* Inclinación - Naranja */}
        <path
          d={`M 0 ${height} ${segments.map((s, i) => `L ${i * step} ${height - (s.incline / maxVal) * height} L ${(i + 1) * step} ${height - (s.incline / maxVal) * height}`).join(' ')} L ${width} ${height} Z`}
          fill="rgba(249, 115, 22, 0.1)"
          stroke="#f97316"
          strokeWidth="0.5"
          strokeDasharray="1,1"
        />
        {/* Indicador Actual */}
        <rect 
          x={currentIndex * step} 
          y="0" 
          width={step} 
          height={height} 
          fill="rgba(255,255,255,0.15)" 
        />
      </svg>
    </div>
  );
};

const Timer = ({ seconds, label, size = 'lg', color = 'text-white' }: { seconds: number, label: string, size?: 'sm' | 'lg', color?: string }) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</span>
      <span className={`${size === 'lg' ? 'text-6xl' : 'text-3xl'} font-mono font-black ${color}`}>{m}:{s}</span>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [session, setSession] = useState<Session | null>(null);

  const startSession = (s: Session) => {
    audio.resume();
    setSession(s);
    setView('ACTIVE');
  };

  const setupSession = (s: Session) => {
    audio.resume();
    setSession(JSON.parse(JSON.stringify(s))); // Deep clone
    setView('SETUP');
  };

  const createCustom = () => {
    audio.resume();
    const custom: Session = {
      id: Date.now().toString(),
      name: 'Mi Entrenamiento',
      description: 'Sesión personalizada creada por el usuario.',
      segments: Array.from({ length: 5 }, (_, i) => ({ id: i.toString(), duration: 120, speed: 5, incline: 0 }))
    };
    setSession(custom);
    setView('SETUP');
  };

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      {view === 'HOME' && <Home onSelect={setupSession} onCreate={createCustom} />}
      {view === 'SETUP' && session && <Setup session={session} onStart={startSession} onBack={() => setView('HOME')} />}
      {view === 'ACTIVE' && session && <Active session={session} onFinish={() => setView('SUMMARY')} onCancel={() => setView('HOME')} />}
      {view === 'SUMMARY' && session && <Summary session={session} onDone={() => setView('HOME')} />}
    </div>
  );
}

// --- VISTAS ---

function Home({ onSelect, onCreate }: { onSelect: (s: Session) => void, onCreate: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24">
      <header className="py-8">
        <h1 className="text-4xl font-black flex items-center gap-2 tracking-tighter">
          <Activity className="text-emerald-400" size={32} /> TreadPro
        </h1>
        <p className="text-slate-400 font-medium">Gestión profesional de cinta.</p>
      </header>

      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Sesiones Recomendadas</h2>
        {DEFAULT_SESSIONS.map(s => (
          <button 
            key={s.id} 
            onClick={() => onSelect(s)}
            className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="text-left">
              <h3 className="font-bold text-lg">{s.name}</h3>
              <p className="text-xs text-slate-400 mb-2">{s.segments.length} tramos • {Math.floor(s.segments.reduce((a,b)=>a+b.duration,0)/60)} min</p>
            </div>
            <ChevronRight className="text-slate-600" />
          </button>
        ))}
        
        <button 
          onClick={onCreate}
          className="w-full border-2 border-dashed border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-2 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400"
        >
          <Plus size={24} />
          <span className="font-bold text-sm">Crear Entrenamiento Personalizado</span>
        </button>
      </div>
    </div>
  );
}

function Setup({ session, onStart, onBack }: { session: Session, onStart: (s: Session) => void, onBack: () => void }) {
  const [segments, setSegments] = useState([...session.segments]);

  const update = (idx: number, key: keyof Segment, val: number) => {
    const next = [...segments];
    (next[idx] as any)[key] = val;
    setSegments(next);
  };

  const add = () => setSegments([...segments, { id: Date.now().toString(), duration: 60, speed: 5, incline: 0 }]);
  const remove = (idx: number) => segments.length > MIN_SEGMENTS && setSegments(segments.filter((_, i) => i !== idx));

  const totalTime = segments.reduce((a, b) => a + b.duration, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 flex items-center gap-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <button onClick={onBack} className="p-2 text-slate-400"><ChevronLeft /></button>
        <h2 className="font-bold">Editar: {session.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Clock className="text-emerald-400" size={20} />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-500/60">Tiempo Total</p>
              <p className="text-xl font-mono font-black">{Math.floor(totalTime/60)}m {totalTime%60}s</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-emerald-500/60">Tramos</p>
            <p className="text-xl font-black">{segments.length}</p>
          </div>
        </div>

        {segments.map((s, i) => (
          <div key={s.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase">Tramo {i+1}</span>
              <button onClick={() => remove(i)} className="text-slate-600 p-1"><Trash2 size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 ml-1">Segundos</label>
                <input 
                  type="number" value={s.duration} 
                  onChange={e => update(i, 'duration', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-center font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 ml-1">Km/h</label>
                <input 
                  type="number" step="0.1" value={s.speed} 
                  onChange={e => update(i, 'speed', Math.min(MAX_SPEED, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-center font-mono font-bold text-blue-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 ml-1">% Inc</label>
                <input 
                  type="number" value={s.incline} 
                  onChange={e => update(i, 'incline', Math.min(MAX_INCLINE, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-center font-mono font-bold text-orange-400"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button onClick={add} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 font-bold flex items-center justify-center gap-2">
          <Plus size={20} /> Añadir Tramo
        </button>
      </div>

      <div className="p-6 bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
        <button 
          onClick={() => onStart({ ...session, segments })}
          className="w-full bg-emerald-500 text-slate-900 py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
        >
          COMENZAR
        </button>
      </div>
    </div>
  );
}

function Active({ session, onFinish, onCancel }: { session: Session, onFinish: () => void, onCancel: () => void }) {
  const [segIdx, setSegIdx] = useState(0);
  const [segTime, setSegTime] = useState(session.segments[0].duration);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  const totalTime = session.segments.reduce((a, b) => a + b.duration, 0);
  const current = session.segments[segIdx];
  const next = session.segments[segIdx + 1];

  const isAlarm = segTime <= 5 && segTime > 0;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setSegTime(t => {
        if (t <= 1) {
          if (segIdx < session.segments.length - 1) {
            audio.beep(1200, 400);
            setSegIdx(i => i + 1);
            return session.segments[segIdx + 1].duration;
          } else {
            onFinish();
            return 0;
          }
        }
        if (t <= 6) audio.beep(440, 100);
        return t - 1;
      });
      setTotalElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [paused, segIdx, session.segments]);

  return (
    <div className={`flex-1 flex flex-col p-6 transition-colors duration-300 ${isAlarm ? 'bg-red-900/30' : 'bg-slate-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-white/50 text-xs uppercase tracking-widest">{session.name}</h3>
          <p className="font-black text-xl">Tramo {segIdx + 1} / {session.segments.length}</p>
        </div>
        <button onClick={onCancel} className="bg-slate-800 p-3 rounded-full text-slate-400"><Square size={20} fill="currentColor" /></button>
      </div>

      <div className="mb-8">
        <Timer seconds={totalTime - totalElapsed} label="Tiempo Total Restante" size="sm" color="text-emerald-400" />
      </div>

      <div className={`relative flex-1 flex flex-col items-center justify-center rounded-3xl border-4 transition-all duration-300 ${isAlarm ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-800/20'}`}>
        <Timer seconds={segTime} label="Siguiente tramo en" />
        {isAlarm && <p className="absolute top-8 animate-pulse text-red-500 font-black tracking-widest">¡CAMBIO!</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Velocidad</p>
          <p className="text-5xl font-black text-blue-400">{current.speed}<span className="text-sm font-medium ml-1">km/h</span></p>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Inclinación</p>
          <p className="text-5xl font-black text-orange-400">{current.incline}<span className="text-sm font-medium ml-1">%</span></p>
        </div>
      </div>

      <SimpleWorkoutChart segments={session.segments} currentIndex={segIdx} />

      <div className="mt-4 bg-slate-800/30 p-4 rounded-xl border border-dashed border-slate-700 flex justify-between items-center">
        <div>
          <p className="text-[9px] uppercase font-bold text-slate-500">Siguiente</p>
          <p className="text-sm text-slate-300">{next ? `${next.speed} km/h | ${next.incline}%` : 'Final de entrenamiento'}</p>
        </div>
        <ChevronRight size={16} className="text-slate-600" />
      </div>

      <div className="mt-8 flex justify-center gap-8 py-4">
        <button onClick={() => setPaused(!paused)} className={`w-20 h-20 rounded-full flex items-center justify-center ${paused ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-white border border-slate-700'}`}>
          {paused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
        </button>
        <button 
          onClick={() => {
            if(segIdx < session.segments.length - 1) {
              setTotalElapsed(e => e + segTime);
              setSegIdx(i => i + 1);
              setSegTime(session.segments[segIdx + 1].duration);
            } else onFinish();
          }}
          className="w-20 h-20 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center"
        >
          <SkipForward size={32} />
        </button>
      </div>
    </div>
  );
}

function Summary({ session, onDone }: { session: Session, onDone: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
        <Trophy size={48} />
      </div>
      <h2 className="text-4xl font-black mb-4">¡LOGRADO!</h2>
      <p className="text-slate-400 mb-8 font-medium italic">"Cada paso cuenta. Has completado {session.name} con éxito."</p>
      
      <div className="grid grid-cols-2 gap-4 w-full mb-12">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Tiempo</p>
          <p className="text-2xl font-black">{Math.floor(session.segments.reduce((a,b)=>a+b.duration,0)/60)} min</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Tramos</p>
          <p className="text-2xl font-black">{session.segments.length}</p>
        </div>
      </div>

      <button onClick={onDone} className="w-full bg-emerald-500 text-slate-900 py-5 rounded-2xl font-black text-xl">FINALIZAR</button>
    </div>
  );
}
