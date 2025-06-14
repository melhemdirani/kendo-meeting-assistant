import { ipcMain } from "electron";
import { transcribeWithOpenAi } from "../services/chatGpt.service.js";
import log from "electron-log";

export function registerTranscriptionHandlers() {
  log.info("[Controller] Registering ipcMain.handle for transcribe-audio");
  ipcMain.handle(
    "transcribe-audio",
    async (event, arrayBuffer: ArrayBuffer) => {
      try {
        log.info("[Controller] Received audio buffer for transcription", {
          type: typeof arrayBuffer,
          byteLength: arrayBuffer && (arrayBuffer as ArrayBuffer).byteLength,
        });
        // Pass the ArrayBuffer to the service
        const result = await transcribeWithOpenAi(arrayBuffer);
        log.info("[Controller] Transcription result:", result);
        return result;
      } catch (error) {
        log.error("[Controller] Transcription failed:", error);
        return "Transcription failed";
      }
    }
  );
}
