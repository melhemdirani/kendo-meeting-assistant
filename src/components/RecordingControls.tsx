// Add this TypeScript declaration to avoid type errors for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      sendAudio: (buffer: ArrayBuffer) => Promise<string>;
      logToMain?: (msg: string) => void;
      getDesktopSources?: (options?: any) => Promise<any[]>;
      openSystemPreferences?: () => void;
    };
  }
}

import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { useApp } from "../context/AppContext";

export function RecordingControls() {
  const { state, dispatch } = useApp();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Helper: Detect silence in audio
  function setupSilenceDetection(
    stream: MediaStream,
    onSpeechSegment: (audioChunks: Blob[]) => void
  ) {
    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let speaking = false;
    let silenceMs = 0;
    let lastCheck = Date.now();
    let segmentChunks: Blob[] = [];

    function check() {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const val = (data[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / data.length);
      const now = Date.now();
      if (rms > 0.02) {
        // Detected speech
        if (!speaking) {
          speaking = true;
          segmentChunks = [];
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "inactive"
          ) {
            mediaRecorderRef.current.start(250); // 250ms chunks for low latency
          }
        }
        silenceMs = 0;
      } else {
        // Detected silence
        silenceMs += now - lastCheck;
        if (speaking && silenceMs > 800) {
          // 0.8s of silence
          speaking = false;
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
          ) {
            mediaRecorderRef.current.stop();
          }
          // Send the segment for transcription
          if (segmentChunks.length > 0) {
            onSpeechSegment(segmentChunks);
          }
          segmentChunks = [];
        }
      }
      lastCheck = now;
      requestAnimationFrame(check);
    }
    check();
    return {
      addChunk: (blob: Blob) => {
        segmentChunks.push(blob);
      },
      cleanup: () => audioContext.close(),
    };
  }

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mediaStream]);

  // Helper to request screen recording permission and guide user
  async function requestScreenPermission() {
    try {
      await window.electronAPI.getDesktopSources?.();
      // Permission granted or already allowed
      return true;
    } catch (err) {
      alert(
        "Screen recording permission is required. Please enable it in System Settings > Privacy & Security > Screen Recording, then restart the app."
      );
      window.electronAPI.openSystemPreferences?.();
      return false;
    }
  }

  const handleToggleRecording = async () => {
    // If you want to record system audio or screen, check permission first
    const screenOk = await requestScreenPermission();
    if (!screenOk) return;

    if (state.isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      dispatch({ type: "SET_RECORDING", payload: false });
      dispatch({ type: "SET_MIC_STATUS", payload: "idle" });
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        setMediaStream(null);
      }
    } else {
      // Start recording
      dispatch({ type: "SET_RECORDING", payload: true });
      dispatch({ type: "SET_MIC_STATUS", payload: "listening" });
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_ERROR", payload: null });
      setIsProcessing(false);
      try {
        // Check for permission before requesting stream
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const status = await navigator.permissions.query({
              name: "microphone" as PermissionName,
            });
            console.log("Microphone permission status:", status.state);
            if (status.state === "denied") {
              dispatch({
                type: "SET_ERROR",
                payload:
                  "Microphone access denied. Please enable it in System Settings.",
              });
              dispatch({ type: "SET_RECORDING", payload: false });
              dispatch({ type: "SET_MIC_STATUS", payload: "idle" });
              return;
            }
          } catch (permErr) {
            console.error("Permission API error:", permErr);
          }
        }
        // Always prompt for permission if not granted
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMediaStream(stream);
        logToMain("[Renderer] getUserMedia stream: " + JSON.stringify(stream));
        audioChunksRef.current = [];
        const mediaRecorder = new window.MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        mediaRecorderRef.current = mediaRecorder;

        // Speech segment detection
        let silenceDetection = setupSilenceDetection(
          stream,
          async (segmentChunks: Blob[]) => {
            // Called when a speech segment ends (on silence)
            if (segmentChunks.length > 0) {
              const audioBlob = new Blob(segmentChunks, { type: "audio/webm" });
              const arrayBuffer = await audioBlob.arrayBuffer();
              try {
                logToMain("[Renderer] Sending speech segment to backend");
                const transcript = await window.electronAPI.sendAudio(
                  arrayBuffer
                );
                dispatch({
                  type: "ADD_TRANSCRIPTION",
                  payload: {
                    id: `${Date.now()}`,
                    text: transcript,
                    timestamp: new Date(),
                  },
                });
              } catch (err) {
                logToMain("[Renderer] Error sending speech segment: " + err);
              }
            }
          }
        );

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            silenceDetection.addChunk(e.data);
          }
        };
        mediaRecorder.onstart = () => {
          logToMain("[Renderer] MediaRecorder started");
          dispatch({ type: "SET_MIC_STATUS", payload: "recording" });
        };
        mediaRecorder.onstop = () => {
          logToMain("[Renderer] MediaRecorder stopped");
          dispatch({ type: "SET_MIC_STATUS", payload: "idle" });
        };
        mediaRecorder.onerror = (event) => {
          logToMain("MediaRecorder error: " + JSON.stringify(event));
          dispatch({
            type: "SET_ERROR",
            payload: "MediaRecorder error. Check system permissions.",
          });
          dispatch({ type: "SET_RECORDING", payload: false });
          dispatch({ type: "SET_MIC_STATUS", payload: "idle" });
        };
        // Do not start mediaRecorder immediately; let speech detection handle it
      } catch (err) {
        console.error("getUserMedia error:", err);
        dispatch({ type: "SET_ERROR", payload: "Could not access microphone" });
        dispatch({ type: "SET_RECORDING", payload: false });
        dispatch({ type: "SET_MIC_STATUS", payload: "idle" });
      }
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleToggleRecording}
        disabled={state.isLoading || isProcessing}
        className={`
          flex items-center space-x-3 px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${
            state.isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-[#B34EDF] hover:bg-[#A03DD1] text-white"
          }
        `}
      >
        {state.isRecording ? (
          <>
            <Square className="w-6 h-[100%]" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Play className="w-6 h-[100%]" />
            <span>Start Recording</span>
          </>
        )}
      </button>
    </div>
  );
}

function logToMain(msg: string) {
  if (
    window.electronAPI &&
    typeof window.electronAPI.logToMain === "function"
  ) {
    window.electronAPI.logToMain(msg);
  } else {
    // Fallback for debugging
    console.warn("logToMain not available", msg);
  }
}
