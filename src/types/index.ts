export type MicStatus = 'idle' | 'listening' | 'recording';

export interface TranscriptionLine {
  id: string;
  text: string;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  micStatus: MicStatus;
  isRecording: boolean;
  isLoading: boolean;
  transcriptionLines: TranscriptionLine[];
  error: string | null;
}