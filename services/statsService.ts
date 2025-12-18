
import { Segment } from '../types.ts';

/**
 * Calcula una estimación de calorías quemadas basada en velocidad, inclinación y tiempo.
 * Fórmula simplificada: METs aproximados * peso (75kg) * tiempo.
 */
export const calculateSessionStats = (segments: Segment[]) => {
  const weightKg = 75; // Peso estándar para la estimación
  let totalCalories = 0;
  let intensitySum = 0;

  segments.forEach((s) => {
    const durationHours = s.duration / 3600;
    // Estimación MET: base 3.5 + 0.1 * velocidad(m/min) + 1.8 * velocidad * inclinación
    const speedMetersPerMin = (s.speed * 1000) / 60;
    const inclineFraction = s.incline / 100;
    
    // METs aproximados para cinta
    const mets = (0.1 * speedMetersPerMin + 1.8 * speedMetersPerMin * inclineFraction + 3.5) / 3.5;
    const kcal = mets * weightKg * durationHours;
    
    totalCalories += kcal;
    intensitySum += (s.speed * 0.6 + s.incline * 0.4) * (s.duration / 60);
  });

  const totalMinutes = segments.reduce((acc, s) => acc + s.duration, 0) / 60;
  const avgIntensity = intensitySum / (totalMinutes || 1);

  let fatBurnLevel = 1;
  if (avgIntensity > 8) fatBurnLevel = 5;
  else if (avgIntensity > 6) fatBurnLevel = 4;
  else if (avgIntensity > 4) fatBurnLevel = 3;
  else if (avgIntensity > 2) fatBurnLevel = 2;

  return {
    calories: Math.round(totalCalories),
    fatBurnLevel: fatBurnLevel
  };
};
