
import React, { useState, useEffect } from 'react';
import { Session, Segment } from '../types.ts';
import { MIN_SEGMENTS, MAX_SPEED, MAX_INCLINE } from '../constants.ts';
import { calculateSessionStats } from '../services/statsService.ts';
import { Trash2, Plus, Play, ChevronLeft, Clock, Zap, Flame } from 'lucide-react';

interface WorkoutSetupProps {
  session: Session;
  onStart: (session: Session) => void;
  onBack: () => void;
}

const NumericInput = ({ 
  value, 
  onChange, 
  label, 
  max, 
  step = "1",
  placeholder = "0"
}: { 
  value: number, 
  onChange: (val: number | string) => void, 
  label: string, 
  max?: number,
  step?: string,
  placeholder?: string
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayValue(val);
    if (val === '') {
      onChange(0);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        if (max !== undefined && num > max) {
          onChange(max);
          setDisplayValue(max.toString());
        } else {
          onChange(num);
        }
      }
    }
  };

  useEffect(() => {
    setDisplayValue(value === 0 && displayValue === '' ? '' : value.toString());
  }, [value]);

  return (
    <div className="flex flex-col">
      <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">{label}</label>
      <input 
        type="number" 
        step={step}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="bg-slate-900 text-white p-2 rounded border border-slate-700 focus:border-emerald-500 outline-none w-full text-center font-mono"
      />
    </div>
  );
};

export const WorkoutSetup: React.FC<WorkoutSetupProps> = ({ session, onStart, onBack }) => {
  const [editedSession, setEditedSession] = useState<Session>({
    ...session,
    segments: [...session.segments]
  });

  const updateSegment = (index: number, updates: Partial<Segment>) => {
    const newSegments = [...editedSession.segments];
    newSegments[index] = { ...newSegments[index], ...updates };
    setEditedSession({ ...editedSession, segments: newSegments });
  };

  const handleTimeChange = (index: number, type: 'm' | 's', val: number | string) => {
    const segment = editedSession.segments[index];
    const numericVal = typeof val === 'string' ? 0 : val;
    
    let m = Math.floor(segment.duration / 60);
    let s = segment.duration % 60;

    if (type === 'm') m = numericVal;
    if (type === 's') s = Math.min(59, numericVal);

    updateSegment(index, { duration: (m * 60) + s });
  };

  const addSegment = () => {
    const lastSegment = editedSession.segments[editedSession.segments.length - 1];
    const newSegment: Segment = {
      id: Date.now().toString(),
      duration: lastSegment?.duration || 60,
      speed: lastSegment?.speed || 5,
      incline: lastSegment?.incline || 0,
    };
    setEditedSession({
      ...editedSession,
      segments: [...editedSession.segments, newSegment]
    });
  };

  const removeSegment = (index: number) => {
    if (editedSession.segments.length <= MIN_SEGMENTS) return;
    const newSegments = editedSession.segments.filter((_, i) => i !== index);
    setEditedSession({ ...editedSession, segments: newSegments });
  };

  const stats = calculateSessionStats(editedSession.segments);
  const totalTime = editedSession.segments.reduce((acc, s) => acc + s.duration, 0);
  const totalMins = Math.floor(totalTime / 60);
  const totalSecs = totalTime % 60;

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6 pb-32 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-white"><ChevronLeft size={24} /></button>
        <h1 className="text-2xl font-bold text-white">Configurar Sesión</h1>
      </div>

      <div className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-2">
           <h2 className="text-lg font-bold text-white">{editedSession.name}</h2>
           <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase px-2 py-1 rounded border border-emerald-500/20">
             {editedSession.segments.length} Tramos
           </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
           <div className="bg-slate-900/50 p-2 rounded-xl flex flex-col items-center border border-slate-700/50">
             <Clock size={14} className="text-slate-500 mb-1" />
             <span className="text-sm font-bold text-white">{totalMins}m {totalSecs}s</span>
             <span className="text-[9px] uppercase font-bold text-slate-500">Tiempo</span>
           </div>
           <div className="bg-slate-900/50 p-2 rounded-xl flex flex-col items-center border border-slate-700/50">
             <Zap size={14} className="text-orange-400 mb-1" />
             <span className="text-sm font-bold text-white">~{stats.calories}</span>
             <span className="text-[9px] uppercase font-bold text-slate-500">Kcal Est.</span>
           </div>
           <div className="bg-slate-900/50 p-2 rounded-xl flex flex-col items-center border border-slate-700/50">
             <div className="flex gap-0.5 mb-1">
               {[1,2,3,4,5].map(i => (
                 <Flame key={i} size={10} className={i <= stats.fatBurnLevel ? 'text-orange-500 fill-orange-500' : 'text-slate-700'} />
               ))}
             </div>
             <span className="text-sm font-bold text-white">{stats.fatBurnLevel}/5</span>
             <span className="text-[9px] uppercase font-bold text-slate-500">Quema G.</span>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {editedSession.segments.map((segment, index) => {
          const m = Math.floor(segment.duration / 60);
          const s = segment.duration % 60;

          return (
            <div key={segment.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col gap-4">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tramo {index + 1}</span>
                  <button 
                    onClick={() => removeSegment(index)}
                    disabled={editedSession.segments.length <= MIN_SEGMENTS}
                    className="text-slate-600 hover:text-red-400 disabled:opacity-30 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
               
               <div className="grid grid-cols-4 gap-2">
                  <NumericInput label="Min" value={m} onChange={(val) => handleTimeChange(index, 'm', val)} />
                  <NumericInput label="Seg" value={s} max={59} onChange={(val) => handleTimeChange(index, 's', val)} />
                  <NumericInput label="Km/h" value={segment.speed} max={MAX_SPEED} step="0.1" onChange={(val) => updateSegment(index, { speed: typeof val === 'string' ? 0 : val })} />
                  <NumericInput label="% Inc" value={segment.incline} max={MAX_INCLINE} onChange={(val) => updateSegment(index, { incline: typeof val === 'string' ? 0 : val })} />
               </div>
            </div>
          );
        })}
      </div>

      <button onClick={addSegment} className="mt-6 w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 font-bold flex items-center justify-center gap-2">
        <Plus size={20} /> Añadir Tramo
      </button>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
        <button 
          onClick={() => onStart(editedSession)}
          className="w-full bg-emerald-500 text-slate-900 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
        >
          <Play size={24} fill="currentColor" /> INICIAR ACTIVIDAD
        </button>
      </div>
    </div>
  );
};
