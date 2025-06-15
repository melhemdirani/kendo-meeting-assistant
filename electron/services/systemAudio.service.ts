import { ipcMain } from "electron";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Audify = require("audify");

let audio: any = null;

ipcMain.handle("start-system-audio", (event) => {
  if (audio) return; // Already running
  audio = Audify();
  audio.on("data", (chunk: Buffer) => {
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
