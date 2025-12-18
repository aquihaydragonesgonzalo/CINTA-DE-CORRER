
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Session, Segment } from '../types';
import { TimerDisplay } from './TimerDisplay';
import { audioService } from '../services/audioService';
import { Play, Pause, SkipForward, Square, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea } from 'recharts';

interface WorkoutRunnerProps {
  session: Session;
  onFinish: () => void;
  onCancel: () => void;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({ session, onFinish, onCancel }) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentSecondsLeft, setSegmentSecondsLeft] = useState(session.segments[0].duration);
  const [isActive, setIsActive] = useState(true);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);

  const totalDuration = session.segments.reduce((acc, s) => acc + s.duration, 0);
  const totalSecondsLeft = totalDuration - totalSecondsElapsed;
  
  const currentSegment = session.segments[currentSegmentIndex];
  const nextSegment = session.segments[currentSegmentIndex + 1];

  // For visual alarm
  const isAlarming = segmentSecondsLeft <= 5 && segmentSecondsLeft > 0;

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSegmentSecondsLeft((prev) => {
          if (prev <= 1) {
            // Segment finished
            if (currentSegmentIndex < session.segments.length - 1) {
              const nextIdx = currentSegmentIndex + 1;
              setCurrentSegmentIndex(nextIdx);
              audioService.playSegmentEndBeep();
              return session.segments[nextIdx].duration;
            } else {
              // Workout finished
              setIsActive(false);
              onFinish();
              return 0;
            }
          }
          
          // Sound alarm at 5, 4, 3, 2, 1 seconds
          if (prev <= 6 && prev > 1) {
             audioService.playCountdownBeep();
          }

          return prev - 1;
        });

        setTotalSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentSegmentIndex, session.segments, onFinish]);

  const togglePause = () => setIsActive(!isActive);

  const skipSegment = () => {
    if (currentSegmentIndex < session.segments.length - 1) {
      const skippedTime = segmentSecondsLeft;
      setTotalSecondsElapsed(prev => prev + skippedTime);
      const nextIdx = currentSegmentIndex + 1;
      setCurrentSegmentIndex(nextIdx);
      setSegmentSecondsLeft(session.segments[nextIdx].duration);
    } else {
      onFinish();
    }
  };

  // Prepare chart data
  const chartData = session.segments.map((s, idx) => ({
    name: `T${idx + 1}`,
    speed: s.speed,
    incline: s.incline,
  }));

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-300 ${isAlarming ? 'bg-red-900/40' : 'bg-slate-900'}`}>
      <div className="flex flex-col h-full max-w-md mx-auto p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">{session.name}</h2>
            <p className="text-sm text-slate-400">Tramo {currentSegmentIndex + 1} de {session.segments.length}</p>
          </div>
          <button onClick={onCancel} className="p-2 bg-slate-800 rounded-full text-slate-400">
            <Square size={20} fill="currentColor" />
          </button>
        </div>

        {/* Global Timer */}
        <div className="mb-10">
          <TimerDisplay seconds={totalSecondsLeft} label="Tiempo Total Restante" size="sm" color="text-emerald-400" />
        </div>

        {/* Current Segment Timer */}
        <div className={`relative flex flex-col items-center justify-center p-12 rounded-3xl border-4 transition-all duration-300 ${isAlarming ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'border-slate-700 bg-slate-800/50'}`}>
           <TimerDisplay seconds={segmentSecondsLeft} label="Siguiente Tramo en..." />
           {isAlarming && <div className="absolute top-2 animate-pulse text-red-500 font-bold uppercase tracking-widest">¡ATENCIÓN!</div>}
        </div>

        {/* Active Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
             <span className="text-xs text-slate-400 uppercase font-bold">Velocidad</span>
             <span className="text-4xl font-black text-blue-400">{currentSegment.speed}<span className="text-sm font-normal ml-1">km/h</span></span>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
             <span className="text-xs text-slate-400 uppercase font-bold">Inclinación</span>
             <span className="text-4xl font-black text-orange-400">{currentSegment.incline}<span className="text-sm font-normal ml-1">%</span></span>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="h-24 mt-8 bg-slate-800/30 rounded-xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="stepAfter" dataKey="speed" stroke="#60a5fa" strokeWidth={3} dot={false} />
              <Line type="stepAfter" dataKey="incline" stroke="#fb923c" strokeWidth={3} dot={false} />
              <ReferenceArea x1={`T${currentSegmentIndex + 1}`} x2={`T${currentSegmentIndex + 1}`} fill="rgba(255,255,255,0.1)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Next Segment Info */}
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase font-bold">Siguiente</span>
              <span className="text-sm text-slate-300">
                {nextSegment ? `${nextSegment.speed} km/h | ${nextSegment.incline}% | ${Math.floor(nextSegment.duration/60)}m` : '¡Enfriamiento Final!'}
              </span>
           </div>
           <ChevronRight className="text-slate-600" />
        </div>

        {/* Footer Controls */}
        <div className="mt-auto flex justify-center gap-8 py-6">
          <button 
            onClick={togglePause}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-slate-700 text-white' : 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'}`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          
          <button 
            onClick={skipSegment}
            className="w-20 h-20 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700"
          >
            <SkipForward size={32} />
          </button>
        </div>
      </div>
    </div>
  );
};
