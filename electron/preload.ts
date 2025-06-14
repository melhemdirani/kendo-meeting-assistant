import { contextBridge, ipcRenderer } from "electron";

console.log(">>> [preload] Preload script loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  sendAudio: (blobBuffer: ArrayBuffer) =>
    ipcRenderer.invoke("transcribe-audio", blobBuffer),
  logToMain: (msg: string) => ipcRenderer.send("renderer-log", msg),
  getDesktopSources: (options?: any) =>
    ipcRenderer.invoke("get-desktop-sources", options),
  openSystemPreferences: () => ipcRenderer.invoke("open-system-preferences"),
});
