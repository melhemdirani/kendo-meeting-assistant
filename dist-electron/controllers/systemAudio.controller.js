import { ipcMain } from "electron";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Audify = require("audify");
let audio = null;
export function registerSystemAudioHandlers() {
    ipcMain.handle("start-system-audio", (event) => {
        if (audio)
            return;
        audio = Audify();
        audio.on("data", (chunk) => {
            event.sender.send("system-audio-chunk", chunk);
        });
        audio.start();
    });
    ipcMain.handle("stop-system-audio", () => {
        if (audio) {
            audio.stop();
            audio = null;
        }
    });
}
