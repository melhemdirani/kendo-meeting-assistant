import { spawn } from "child_process";
import { ipcMain } from "electron";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Audify = require("audify");
let audio = null;
let ffmpegProcess = null;
let chunks = [];
export function registerSystemAudioHandlers() {
    ipcMain.handle("start-system-audio", (event) => {
        if (audio)
            return;
        const rtaudio = new Audify.RtAudio(Audify.RtAudioApi.WINDOWS_WASAPI);
        const bufferSize = 512;
        const sampleRate = 44100;
        const channels = 2;
        chunks = [];
        // Spawn ffmpeg to encode PCM to WebM audio to stdout (memory)
        ffmpegProcess = spawn("ffmpeg", [
            "-f",
            "s16le",
            "-ar",
            sampleRate.toString(),
            "-ac",
            channels.toString(),
            "-i",
            "pipe:0", // input from stdin
            "-c:a",
            "libopus",
            "-b:a",
            "128k",
            "-f",
            "webm",
            "pipe:1", // output to stdout
        ]);
        // Collect output chunks into chunks array
        ffmpegProcess.stdout.on("data", (chunk) => {
            chunks.push(chunk);
        });
        ffmpegProcess.stderr.on("data", (data) => {
            // Optional: uncomment to debug ffmpeg logs
            // console.log("ffmpeg stderr:", data.toString());
        });
        ffmpegProcess.on("close", (code) => {
            const webmBuffer = Buffer.concat(chunks);
            // Send the WebM audio buffer back to renderer
            event.sender.send("system-audio-finished", webmBuffer);
        });
        rtaudio.openStream(null, {
            deviceId: rtaudio.getDefaultOutputDevice(),
            nChannels: channels,
            firstChannel: 0,
        }, Audify.RtAudioFormat.RTAUDIO_SINT16, sampleRate, bufferSize, "system-audio-stream", (buffer) => {
            if (ffmpegProcess && ffmpegProcess.stdin.writable) {
                ffmpegProcess.stdin.write(buffer);
            }
            // You can also send raw PCM chunks to renderer if you want
            event.sender.send("system-audio-chunk", buffer);
        });
        rtaudio.start();
        audio = rtaudio;
    });
    ipcMain.handle("stop-system-audio", () => {
        if (audio) {
            audio.stop();
            audio = null;
        }
        if (ffmpegProcess) {
            ffmpegProcess.stdin.end();
            ffmpegProcess = null;
        }
    });
}
