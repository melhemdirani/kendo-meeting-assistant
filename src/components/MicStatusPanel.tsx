import React from "react";
import { Mic, MicOff, Radio } from "lucide-react";
import { useApp } from "../context/AppContext";

export function MicStatusPanel() {
  const { state } = useApp();

  const getStatusConfig = () => {
    switch (state.micStatus) {
      case "idle":
        return {
          icon: MicOff,
          text: "Idle",
          bgColor: "bg-slate-100",
          textColor: "text-slate-600",
          iconColor: "text-slate-500",
          description: "Ready to start recording",
        };
      case "listening":
        return {
          icon: Mic,
          text: "Listening",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          iconColor: "text-green-600",
          description: "Waiting for audio input",
        };
      case "recording":
        return {
          icon: Radio,
          text: "Recording",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          iconColor: "text-red-600",
          description: "Actively transcribing audio",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  console.log("MicStatusPanel render", {
    micStatus: state.micStatus,
    isLoading: state.isLoading,
  });

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {/* Status Indicator */}
      <div
        className={`${config.bgColor} rounded-2xl p-6  transition-all duration-300 w-full h-full flex flex-col justify-center`}
      >
        <div className="flex items-center space-x-3">
          <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
          <div>
            <h3 className={`text-xl font-semibold ${config.textColor}`}>
              {config.text}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{config.description}</p>
          </div>
        </div>
      </div>
      {/* Recording Animation */}
      {state.micStatus === "recording" && (
        <div className="flex items-center space-x-2 absolute bottom-[-20px]">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-red-300 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      )}
      {/* Loading Spinner */}
      {state.isLoading && (
        <div className="flex items-center space-x-2 text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
          <span className="text-sm">Processing audio...</span>
        </div>
      )}
    </div>
  );
}
