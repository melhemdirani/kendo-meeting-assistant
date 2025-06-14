"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log(">>> [preload] Preload script loaded");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    sendAudio: (blobBuffer) => electron_1.ipcRenderer.invoke("transcribe-audio", blobBuffer),
    logToMain: (msg) => electron_1.ipcRenderer.send("renderer-log", msg),
    getDesktopSources: (options) => electron_1.ipcRenderer.invoke("get-desktop-sources", options),
    openSystemPreferences: () => electron_1.ipcRenderer.invoke("open-system-preferences"),
});
