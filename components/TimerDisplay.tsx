
import React from 'react';

interface TimerDisplayProps {
  seconds: number;
  label: string;
  size?: 'sm' | 'lg';
  color?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, label, size = 'lg', color = 'text-white' }) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</span>
      <span className={`${size === 'lg' ? 'text-7xl font-mono' : 'text-3xl font-mono'} font-bold ${color}`}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};
