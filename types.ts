export interface ManifestationResponse {
  affirmations: string[];
  scripting: string;
  visualizations: string[];
  actions: string[];
}

export interface GeneratedManifestation extends ManifestationResponse {
  id: string;
  timestamp: number;
  originalDesire: string;
  visionBoardUrl?: string; // Base64 or URL
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface HistoryItem {
  id: string;
  desire: string;
  date: string;
}