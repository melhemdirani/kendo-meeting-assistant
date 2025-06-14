import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, MicStatus, TranscriptionLine, User } from '../types';

type AppAction = 
  | { type: 'SET_AUTHENTICATED'; payload: { user: User } }
  | { type: 'SET_LOGOUT' }
  | { type: 'SET_MIC_STATUS'; payload: MicStatus }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_TRANSCRIPTION'; payload: TranscriptionLine }
  | { type: 'CLEAR_TRANSCRIPTION' }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  micStatus: 'idle',
  isRecording: false,
  isLoading: false,
  transcriptionLines: [],
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case 'SET_LOGOUT':
      return {
        ...initialState,
      };
    case 'SET_MIC_STATUS':
      return {
        ...state,
        micStatus: action.payload,
      };
    case 'SET_RECORDING':
      return {
        ...state,
        isRecording: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'ADD_TRANSCRIPTION':
      return {
        ...state,
        transcriptionLines: [...state.transcriptionLines, action.payload],
      };
    case 'CLEAR_TRANSCRIPTION':
      return {
        ...state,
        transcriptionLines: [],
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}