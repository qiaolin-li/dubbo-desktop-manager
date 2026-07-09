import type { MenuItem } from './AppView';

export interface Constant {
    VERSION: string;
    IS_DEVELOPMENT: boolean;
    USER_HOME_DIR: string;
    APPLICATION_DIR: string;
    APPLICATION_CONFIG_FILE: string;
    APPLICATION_DATA_DIR: string;
    APPLICATION_LOG_DIR: string;
    APPLICATION_LOG_FILE: string;
    APPLICATION_LOG_ERROR_File: string;
    APPLICATION_NPM_PATH_PREFIX: string;
    APPLICATION_PLUGINS_DIR: string;
    APPLICATION_INTERNAL_PLUGINS_DIR: string;
    APPLICATION_PLUGINS_NAME_PREFIX: string;
    APPLICATION_PLUGIN_CONFIG_DIR: string;
    APPLICATION_TEMP_DIR: string;
    IS_MAC: boolean;
    API_HTTP_PORT: number;
    initPlugins: Record<string, string>;
    COMMUNICATION_CHANNEL: string;
    platform: NodeJS.Platform;
}

export interface AppConfigBridge {
    setProperty(key: string, value: any): any;
    hasProperty(key: string): boolean;
    getProperty<T = any>(key: string): T;
}

export interface AppIpcBridge {
    on(channel: string, callback: (...args: any[]) => void): () => void;
    send(channel: string, ...args: any[]): void;
}

export interface AppDialogBridge {
    showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
    showOpenDialogSync(options: Electron.OpenDialogOptions): string[] | undefined;
    showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
    showMessageBox(options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue>;
    confirm(message: string, title?: string, options?: { confirmButtonText?: string; cancelButtonText?: string }): Promise<void>;
}

export interface AppShellBridge {
    openExternal(url: string): Promise<void>;
    showItemInFolder(fullPath: string): void;
    openPath(fullPath: string): Promise<string>;
    trashItem(fullPath: string): Promise<void>;
}

export interface AppClipboardBridge {
    readText(): string;
    writeText(text: string): void;
}

export interface AppWindowBridge {
    minimize(): void;
    toggleMaximize(): void;
    close(): void;
    restart(): void;
    forceReload(): void;
    openDevTools(): void;
    popupMenu(menuInfo: { template: MenuItem[] }): void;
    openStandaloneJsonEditor(payload?: Record<string, any>): Promise<{ id: number | null }>;
    getStandaloneJsonEditorPayload(windowKey?: string): Promise<Record<string, any> | null>;
}

export interface TelnetConnectOptions {
    ip: string;
    port: number;
    onConnect?: () => void;
    onError?: (error: { message: string }) => void;
    onClose?: () => void;
    onData?: (data: string) => void;
}

export interface AppTelnetBridge {
    connect(options: TelnetConnectOptions): string;
    write(sessionId: string, content: string): boolean;
    close(sessionId: string): boolean;
}

export interface AppRuntimeBridge {
    isDeveloperMode(): boolean;
    getSystemLocale(): string;
    getThemeMode(): string;
    getPreferredDarkThemeId(): string;
    getPreferredLightThemeId(): string;
    getIconThemeId(): string;
    getUIFontFamily(): string;
    openStandaloneJsonEditor(payload?: Record<string, any>): Promise<{ id: number | null }>;
    getStandaloneJsonEditorPayload(windowKey?: string): Promise<Record<string, any> | null>;
}

export interface UnifyInvocation {
    moduleName: string;
    method: string;
    args?: any[];
    replyChannel?: string;
    [key: string]: any;
}

export interface UnifyInvoker {
    send(invocation: UnifyInvocation): void;
    on(callback: (...args: any[]) => void): () => void;
}

export interface PluginHelper {
    requireModule(moduleName: string): string | null;
}

export interface DdmBridge {
    appIpc: AppIpcBridge;
    appDialog: AppDialogBridge;
    appShell: AppShellBridge;
    appClipboard: AppClipboardBridge;
    appWindow: AppWindowBridge;
    appTelnet: AppTelnetBridge;
    appConfig: AppConfigBridge;
    pluginHelper(pluginDir: string, pluginName: string): PluginHelper;
}

declare global {
    const appRuntime: AppRuntimeBridge;

    interface Window {
        constant: Constant;
        appRuntime: AppRuntimeBridge;
        createUnifyInvoker(): UnifyInvoker;
        ddmBridge(): DdmBridge;
        getMonaco?: () => Promise<any>;
        jsonDefaults?: () => Promise<any>;
        jsyaml?: any;
        diff_match_patch?: any;
        DIFF_DELETE?: number;
        DIFF_INSERT?: number;
        DIFF_EQUAL?: number;
    }
}

export {};
