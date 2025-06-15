import { ipcMain } from "electron";
import { createRequire } from "module";
import { Buffer } from "buffer";

const require = createRequire(import.meta.url);
const Audify = require("audify");
let audio: any = null;

export function registerSystemAudioHandlers() {
  //   if (process.platform !== "win32") {
  //     console.warn("System audio capture is only supported on Windows.");
  //     return;
  //   }

  ipcMain.handle("start-system-audio", (event) => {
    if (audio) return;

    const rtaudio = new Audify.RtAudio(Audify.RtAudioApi.WINDOWS_WASAPI);
    const bufferSize = 512;
    const options = {
      deviceId: rtaudio.getDefaultOutputDevice(),
      nChannels: 2,
      firstChannel: 0,
    };
    rtaudio.openStream(
      null, // No output
      {
        deviceId: options.deviceId,
        nChannels: options.nChannels,
        firstChannel: options.firstChannel,
      },
      Audify.RtAudioFormat.RTAUDIO_SINT16,
      44100,
      bufferSize,
      "system-audio-stream", // ✅ Add this string as the stream name
      (buffer: Buffer) => {
        event.sender.send("system-audio-chunk", buffer);
      }
    );

    rtaudio.start();
    audio = rtaudio;
  });

  ipcMain.handle("stop-system-audio", () => {
    if (audio) {
      audio.stop();
      audio = null;
    }
  });
}
