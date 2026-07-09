
import { ipcMain }        from 'electron'
import windowHolder             from '@/main/window/WindowHolder.js';

class WindowManager {
    
    #payloadMap = new Map();

    constructor(){
        this.registerWindowIpcHandlers();
    }


    /**
     * 插件不要去依赖这个，后期可能会去掉它
     */
    registerWindowIpcHandlers() {
        ipcMain.handle('window-open-standalone-json-editor', (event, payload = {}) =>  this.createStandaloneJsonEditorWindow(payload));
        ipcMain.handle('window-get-standalone-json-editor-payload', (event, windowKey) => this.getStandaloneJsonEditorPayload(windowKey));
    }

    async createStandaloneJsonEditorWindow(payload){
        const windowKey = Math.random().toString(36).substr(2, 9);

        this.#payloadMap.set(windowKey, { ...payload });

        const standaloneWindow = await windowHolder.createStandaloneJsonEditorWindow(payload.title, {
            windowKey
        });

        standaloneWindow.on("closed", () => this.#payloadMap.delete(windowKey));

        return {
            id: standaloneWindow ? standaloneWindow.id : null,
        };
    }

    getStandaloneJsonEditorPayload(windowKey){
        return this.#payloadMap.get(windowKey) || null;
    }

}

export default new WindowManager();