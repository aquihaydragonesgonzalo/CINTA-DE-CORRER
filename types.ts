
export interface Segment {
  id: string;
  duration: number; // in seconds
  speed: number;    // 0 to 15
  incline: number;  // 0 to 15%
}

export interface Session {
  id: string;
  name: string;
  description: string;
  segments: Segment[];
  isCustom?: boolean;
}

export type ViewState = 'HOME' | 'SETUP' | 'ACTIVE' | 'SUMMARY';
