import { ipcMain } from "electron";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Audify = require("audify");

let audio: any = null;

// Remove system audio IPC handlers from here; now handled in systemAudio.controller.ts

export {};
