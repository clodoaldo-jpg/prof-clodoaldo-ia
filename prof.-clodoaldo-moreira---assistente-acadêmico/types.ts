
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  audioBase64?: string; // Cache do áudio gerado pelo Gemini TTS
}

export enum AppView {
  CHAT = 'CHAT',
  FILES = 'FILES',
  PROFILE = 'PROFILE',
  SPEAK = 'SPEAK',
  PLANNING = 'PLANNING'
}

export interface FileAnalysisResult {
  fileName: string;
  analysis: string;
}
