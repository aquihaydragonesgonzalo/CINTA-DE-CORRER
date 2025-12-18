
import { Session } from './types.ts';

export const MIN_SEGMENTS = 5;
export const MAX_SPEED = 15;
export const MAX_INCLINE = 15;

export const DEFAULT_SESSIONS: Session[] = [
  {
    id: 'hiit-gonzalo',
    name: 'HIIT GONZALO',
    description: 'Sesión de alta intensidad con escalada piramidal y enfriamiento progresivo controlado.',
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
    description: 'Intervalos constantes para optimizar la oxidación de grasas.',
    segments: [
      { id: '1', duration: 300, speed: 5, incline: 1 },
      { id: '2', duration: 300, speed: 6, incline: 2 },
      { id: '3', duration: 300, speed: 6.5, incline: 3 },
      { id: '4', duration: 300, speed: 6, incline: 2 },
      { id: '5', duration: 300, speed: 5, incline: 1 },
    ]
  },
  {
    id: 'hiit-power',
    name: 'HIIT Intenso',
    description: 'Alta intensidad con periodos de recuperación corta.',
    segments: [
      { id: 'h1', duration: 120, speed: 4, incline: 0 },
      { id: 'h2', duration: 60, speed: 12, incline: 2 },
      { id: 'h3', duration: 60, speed: 4, incline: 0 },
      { id: 'h4', duration: 60, speed: 12, incline: 4 },
      { id: 'h5', duration: 60, speed: 4, incline: 0 },
      { id: 'h6', duration: 60, speed: 14, incline: 2 },
      { id: 'h7', duration: 180, speed: 3, incline: 0 },
    ]
  },
  {
    id: 'hill-climber',
    name: 'Escalada Progresiva',
    description: 'Enfoque en inclinación para fortalecer tren inferior.',
    segments: [
      { id: 'c1', duration: 240, speed: 5, incline: 2 },
      { id: 'c2', duration: 240, speed: 5, incline: 5 },
      { id: 'c3', duration: 240, speed: 5, incline: 8 },
      { id: 'c4', duration: 240, speed: 4.5, incline: 12 },
      { id: 'c5', duration: 240, speed: 5, incline: 5 },
    ]
  }
];
