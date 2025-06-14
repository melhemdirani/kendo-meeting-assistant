import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function TranscriptionPanel() {
  const { state } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcription is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.transcriptionLines]);

  return (
    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-slate-500" />
          <h3 className="font-medium text-slate-900">Live Transcription</h3>
          {state.transcriptionLines.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {state.transcriptionLines.length} lines
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 space-y-3"
      >
        {state.transcriptionLines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 mb-1">No transcription yet</p>
            <p className="text-sm text-slate-400">Start recording to see live transcription</p>
          </div>
        ) : (
          state.transcriptionLines.map((line) => (
            <div key={line.id} className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
              <p className="text-slate-800 leading-relaxed">{line.text}</p>
              <p className="text-xs text-slate-400 mt-2">
                {line.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}