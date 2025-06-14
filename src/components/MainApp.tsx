import React from "react";
import { TopBar } from "./TopBar";
import { MicStatusPanel } from "./MicStatusPanel";
import { TranscriptionPanel } from "./TranscriptionPanel";
import { RecordingControls } from "./RecordingControls";

export function MainApp() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />

      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-8">
          {/* Mic Status */}
          <div className="flex items-stretch justify-center h-20 space-x-6">
            <MicStatusPanel />
            <RecordingControls />
          </div>

          {/* Transcription Panel */}
          <TranscriptionPanel />

          {/* Recording Controls */}
        </div>
      </main>
    </div>
  );
}
