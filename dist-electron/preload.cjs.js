"use strict";
const { desktopCapturer, contextBridge, ipcRenderer } = require("electron");
console.log(">>> [preload] Preload script loaded::", desktopCapturer);
contextBridge.exposeInMainWorld("electronAPI", {
    sendAudio: (blobBuffer) => ipcRenderer.invoke("transcribe-audio", blobBuffer),
    logToMain: (msg) => ipcRenderer.send("renderer-log", msg),
});
