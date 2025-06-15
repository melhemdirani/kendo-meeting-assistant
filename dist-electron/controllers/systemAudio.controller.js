import { ipcMain } from "electron";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const AudifyModule = require("audify");
// Some versions of audify export the constructor as `.default`
const Audify = AudifyModule.default || AudifyModule;
let audio = null;
export function registerSystemAudioHandlers() {
    ipcMain.handle("start-system-audio", (event) => {
        if (audio)
            return;
        console.log("[DEBUG] Audify module export:", Audify);
        audio = Audify.create();
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
