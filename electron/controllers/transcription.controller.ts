import { ipcMain } from "electron";
import { transcribeWithOpenAi } from "../services/chatGpt.service.js";
import log from "electron-log";
import { Buffer } from "buffer";

function convertPcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 44100,
  numChannels = 2
): Buffer {
  const header = Buffer.alloc(44);

  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;

  header.write("RIFF", 0); // ChunkID
  header.writeUInt32LE(36 + pcmBuffer.length, 4); // ChunkSize
  header.write("WAVE", 8); // Format
  header.write("fmt ", 12); // Subchunk1ID
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat (PCM)
  header.writeUInt16LE(numChannels, 22); // NumChannels
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(byteRate, 28); // ByteRate
  header.writeUInt16LE(blockAlign, 32); // BlockAlign
  header.writeUInt16LE(16, 34); // BitsPerSample
  header.write("data", 36); // Subchunk2ID
  header.writeUInt32LE(pcmBuffer.length, 40); // Subchunk2Size

  return Buffer.concat([header, pcmBuffer]);
}

export function registerTranscriptionHandlers() {
  log.info("[Controller] Registering ipcMain.handle for transcribe-audio");
  ipcMain.handle(
    "transcribe-audio",
    async (event, arrayBuffer: ArrayBuffer, needsConversion?: boolean) => {
      try {
        if (needsConversion) {
          log.info("[Controller] Received audio buffer for transcription", {
            type: typeof arrayBuffer,
            byteLength: arrayBuffer && (arrayBuffer as ArrayBuffer).byteLength,
          });
          // Pass the ArrayBuffer to the service
          const pcmBuffer = Buffer.from(arrayBuffer);
          const wavBuffer = convertPcmToWav(pcmBuffer);
          const result = await transcribeWithOpenAi(wavBuffer);
          log.info("[Controller] Transcription result:", result);
          return result;
        } else {
          log.info("[Controller] Received audio buffer for transcription", {
            type: typeof arrayBuffer,
            byteLength: arrayBuffer && (arrayBuffer as ArrayBuffer).byteLength,
          });
          // Pass the ArrayBuffer to the service
          const result = await transcribeWithOpenAi(arrayBuffer);
          log.info("[Controller] Transcription result:", result);
          return result;
        }
      } catch (error) {
        log.error("[Controller] Transcription failed:", error);
        return "Transcription failed";
      }
    }
  );
}
