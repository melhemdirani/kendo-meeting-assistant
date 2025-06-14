import { app, BrowserWindow, ipcMain, desktopCapturer, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
// import dotenv from "dotenv";
import log from "electron-log";
// Load .env variables (OPENAI_API_KEY, etc.)
// dotenv.config();
// Import your IPC handler controller
import { registerTranscriptionHandlers } from "./controllers/transcription.controller.js";
// Needed for ES module compatibility (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
log.info("Electron main process starting...");
function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.resolve(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
            // Enable media access for Electron
            webSecurity: false,
            // Optionally, enable devTools for debugging
            devTools: true,
            sandbox: false,
        },
    });
    // Handle media permissions for Electron
    win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === "media") {
            log.info("Granting media (microphone) permission to renderer");
            callback(true);
        }
        else {
            callback(false);
        }
    });
    const isDev = process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === "development";
    const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    if (isDev) {
        win.loadURL(devUrl);
        log.info("Main window created and loaded URL:", devUrl);
    }
    else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
        log.info("Main window created and loaded file: dist/index.html");
    }
}
// Register all IPC handlers
registerTranscriptionHandlers();
log.info("IPC handlers registered");
// Listen for renderer logs and print to main process log
ipcMain.on("renderer-log", (_event, msg) => {
    log.info("[Renderer]", msg);
});
// Add IPC handler for desktop sources
ipcMain.handle("get-desktop-sources", async (_event, options) => {
    const sources = await desktopCapturer.getSources({
        types: ["screen", "window"],
        fetchWindowIcons: true,
        thumbnailSize: { width: 320, height: 180 },
        ...options,
    });
    return sources.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail.toDataURL(),
    }));
});
// Add IPC handler to open macOS System Preferences
ipcMain.handle("open-system-preferences", async () => {
    if (process.platform === "darwin") {
        await shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture");
    }
});
app.whenReady().then(() => {
    log.info("App is ready, creating window");
    createWindow();
});
app.on("window-all-closed", () => {
    log.info("All windows closed");
    if (process.platform !== "darwin")
        app.quit();
});
