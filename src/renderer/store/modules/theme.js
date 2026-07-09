import appRenderer, { appConfig }          from '@/renderer/core/AppRenderer.js';
import themesManager 		               from '@/renderer/themes/index.js'

import { defineStore }                     from 'pinia';

const THEME_MODE_STORAGE_KEY = 'themeMode';
const LIGHT_THEME_STORAGE_KEY = 'preferredLightThemeId';
const DARK_THEME_STORAGE_KEY = 'preferredDarkThemeId';
const ICON_THEME_STORAGE_KEY = 'iconThemeId';
const UI_FONT_FAMILY_STORAGE_KEY = 'uiFontFamily';
const THEME_MODE_LIST = ['system', 'light', 'dark'];
const LIGHT_APPEARANCE = 'light';
const DARK_APPEARANCE = 'dark';
const MAC_UI_FONT_FAMILY = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
const WINDOWS_UI_FONT_FAMILY = "'Segoe UI', 'Microsoft YaHei', sans-serif";
const DEFAULT_UI_FONT_FAMILY = (() => {
    if (window.constant.platform === 'win32') {
        return WINDOWS_UI_FONT_FAMILY;
    }

    return MAC_UI_FONT_FAMILY;
})();

export const useThemeStore = defineStore('theme', {
    state: () => ({
        themeMode: 'system',
        preferredLightThemeId: 'light-default',
        preferredDarkThemeId: 'dark-vscode',
        currentThemeId: 'light-default',
        resolvedTheme: 'light',
        lightThemeOptions: [],
        darkThemeOptions: [],
        iconThemeId: 'default',
        uiFontFamily: DEFAULT_UI_FONT_FAMILY,
        systemThemeMedia: null,
        systemThemeListener: null,
        themeRegistryListener: null,
    }),

    getters: {
        isDarkTheme: state => state.resolvedTheme === DARK_APPEARANCE,
        themeOptions(state) {
            return [
                ...state.lightThemeOptions,
                ...state.darkThemeOptions,
            ];
        },
    },

    actions: {
        normalizeThemeMode(themeMode) {
            return THEME_MODE_LIST.includes(themeMode) ? themeMode : 'system';
        },
        normalizeAppearance(appearance) {
            return appearance === DARK_APPEARANCE ? DARK_APPEARANCE : LIGHT_APPEARANCE;
        },
        getThemeDefinitions() {
            return themesManager.getThemeDefinitionList();
        },
        getIconThemes() {
            return themesManager.getIconThemeList();
        },
        getThemeDefinitionsByAppearance(appearance) {
            const nextAppearance = this.normalizeAppearance(appearance);
            return this.getThemeDefinitions().filter(theme => theme.appearance === nextAppearance);
        },
        getBuiltinThemeDefinition(appearance) {
            return themesManager.getBuiltinThemeDefinition(this.normalizeAppearance(appearance));
        },
        refreshThemeOptions() {
            this.lightThemeOptions = this.getThemeDefinitionsByAppearance(LIGHT_APPEARANCE).map(theme => ({
                label: theme.label,
                value: theme.id,
                description: theme.description || '',
            }));
            this.darkThemeOptions = this.getThemeDefinitionsByAppearance(DARK_APPEARANCE).map(theme => ({
                label: theme.label,
                value: theme.id,
                description: theme.description || '',
            }));
        },
        getThemeDefinitionById(themeId) {
            return this.getThemeDefinitions().find(theme => theme.id === themeId) || null;
        },
        normalizeThemeId(themeId, appearance) {
            const nextAppearance = this.normalizeAppearance(appearance);
            const matchedTheme = this.getThemeDefinitionsByAppearance(nextAppearance).find(theme => theme.id === themeId);
            if (matchedTheme) {
                return matchedTheme.id;
            }

            const builtinTheme = this.getBuiltinThemeDefinition(nextAppearance);
            if (builtinTheme) {
                return builtinTheme.id;
            }

            const themeList = this.getThemeDefinitionsByAppearance(nextAppearance);
            return themeList[0] ? themeList[0].id : '';
        },
        normalizeIconThemeId(iconThemeId) {
            const iconThemes = this.getIconThemes();
            if (iconThemes.find(theme => theme.id === iconThemeId)) {
                return iconThemeId;
            }

            return iconThemes[0] ? iconThemes[0].id : 'default';
        },
        normalizeUIFontFamily(fontFamily) {
            return typeof fontFamily === 'string' && fontFamily.trim() ? fontFamily.trim() : DEFAULT_UI_FONT_FAMILY;
        },
        getSystemTheme() {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                return LIGHT_APPEARANCE;
            }

            return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_APPEARANCE : LIGHT_APPEARANCE;
        },
        getResolvedAppearance() {
            if (this.themeMode === LIGHT_APPEARANCE || this.themeMode === DARK_APPEARANCE) {
                return this.themeMode;
            }

            return this.getSystemTheme();
        },
        getActiveThemeId(appearance = this.getResolvedAppearance()) {
            const nextAppearance = this.normalizeAppearance(appearance);
            if (nextAppearance === DARK_APPEARANCE) {
                return this.normalizeThemeId(this.preferredDarkThemeId, DARK_APPEARANCE);
            }

            return this.normalizeThemeId(this.preferredLightThemeId, LIGHT_APPEARANCE);
        },
        getThemeSelectionValue() {
            return this.currentThemeId || this.getActiveThemeId();
        },
        resolveThemeSelection(themeId) {
            const themeDefinition = this.getThemeDefinitionById(themeId);
            if (!themeDefinition) {
                return {
                    themeMode: this.themeMode,
                    preferredLightThemeId: this.preferredLightThemeId,
                    preferredDarkThemeId: this.preferredDarkThemeId,
                };
            }

            if (themeDefinition.appearance === DARK_APPEARANCE) {
                return {
                    themeMode: DARK_APPEARANCE,
                    preferredLightThemeId: this.preferredLightThemeId,
                    preferredDarkThemeId: themeDefinition.id,
                };
            }

            return {
                themeMode: LIGHT_APPEARANCE,
                preferredLightThemeId: themeDefinition.id,
                preferredDarkThemeId: this.preferredDarkThemeId,
            };
        },
        getCurrentThemeDefinition() {
            return themesManager.getThemeDefinition(this.currentThemeId);
        },
        syncDocumentTheme() {
            if (typeof document === 'undefined') {
                return;
            }

            const root = document.documentElement;
            const body = document.body;
            const appearance = this.getResolvedAppearance();
            const isDarkTheme = appearance === DARK_APPEARANCE;
            const builtinThemeDefinition = this.getBuiltinThemeDefinition(appearance);
            const themeDefinition = this.getCurrentThemeDefinition();
            const tokenMap = {
                ...(builtinThemeDefinition && builtinThemeDefinition.tokens ? builtinThemeDefinition.tokens : {}),
                ...(themeDefinition && themeDefinition.tokens ? themeDefinition.tokens : {}),
            };

            root.setAttribute('data-theme', appearance);
            root.setAttribute('data-theme-mode', this.themeMode);
            root.setAttribute('data-theme-id', this.currentThemeId);
            root.setAttribute('data-icon-theme-id', this.iconThemeId);
            root.style.setProperty('--app-font-family', this.uiFontFamily);
            root.style.colorScheme = isDarkTheme ? 'dark' : 'light';
            root.classList.toggle('theme-dark', isDarkTheme);
            root.classList.toggle('theme-light', !isDarkTheme);
            Array.from(root.style).forEach((styleKey) => {
                if (styleKey.startsWith('--app-theme-')) {
                    root.style.removeProperty(styleKey);
                }
            });
            Object.entries(tokenMap).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });

            if (body) {
                body.setAttribute('data-theme', appearance);
                body.setAttribute('data-theme-mode', this.themeMode);
                body.setAttribute('data-theme-id', this.currentThemeId);
                body.setAttribute('data-icon-theme-id', this.iconThemeId);
                body.style.setProperty('--app-font-family', this.uiFontFamily);
                body.classList.toggle('theme-dark', isDarkTheme);
                body.classList.toggle('theme-light', !isDarkTheme);
            }
        },
        bindThemeRegistryListener() {
            if (this.themeRegistryListener) {
                return;
            }

            this.themeRegistryListener = () => {
                this.refreshThemeOptions();
                this.preferredLightThemeId = this.normalizeThemeId(this.preferredLightThemeId, LIGHT_APPEARANCE);
                this.preferredDarkThemeId = this.normalizeThemeId(this.preferredDarkThemeId, DARK_APPEARANCE);
                this.currentThemeId = this.getActiveThemeId();
                this.iconThemeId = this.normalizeIconThemeId(this.iconThemeId);
                this.syncDocumentTheme();
            };
            appRenderer.on('theme-registry-change', this.themeRegistryListener);
        },
        bindSystemThemeListener() {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function' || this.systemThemeListener) {
                return;
            }

            const media = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = () => {
                if (this.themeMode !== 'system') {
                    return;
                }

                this.applyTheme({
                    themeMode: this.themeMode,
                    preferredLightThemeId: this.preferredLightThemeId,
                    preferredDarkThemeId: this.preferredDarkThemeId,
                });
            };

            if (typeof media.addEventListener === 'function') {
                media.addEventListener('change', listener);
            } else if (typeof media.addListener === 'function') {
                media.addListener(listener);
            }

            this.systemThemeMedia = media;
            this.systemThemeListener = listener;
        },
        async initTheme() {
            this.refreshThemeOptions();
            this.bindThemeRegistryListener();
            this.bindSystemThemeListener();
            const themeMode = this.normalizeThemeMode(await appConfig.getProperty(THEME_MODE_STORAGE_KEY));
            const preferredLightThemeId = this.normalizeThemeId(await appConfig.getProperty(LIGHT_THEME_STORAGE_KEY), LIGHT_APPEARANCE);
            const preferredDarkThemeId = this.normalizeThemeId(await appConfig.getProperty(DARK_THEME_STORAGE_KEY), DARK_APPEARANCE);
            this.iconThemeId = this.normalizeIconThemeId(await appConfig.getProperty(ICON_THEME_STORAGE_KEY));
            this.uiFontFamily = this.normalizeUIFontFamily(await appConfig.getProperty(UI_FONT_FAMILY_STORAGE_KEY));
            this.applyTheme({
                themeMode,
                preferredLightThemeId,
                preferredDarkThemeId,
                uiFontFamily: this.uiFontFamily,
            });
        },
        applyTheme(payload = {}) {
            this.themeMode = this.normalizeThemeMode(typeof payload === 'string' ? payload : payload.themeMode);
            this.preferredLightThemeId = this.normalizeThemeId(payload.preferredLightThemeId || this.preferredLightThemeId, LIGHT_APPEARANCE);
            this.preferredDarkThemeId = this.normalizeThemeId(payload.preferredDarkThemeId || this.preferredDarkThemeId, DARK_APPEARANCE);
            this.uiFontFamily = this.normalizeUIFontFamily(payload.uiFontFamily || this.uiFontFamily);
            this.resolvedTheme = this.getResolvedAppearance();
            this.currentThemeId = this.getActiveThemeId(this.resolvedTheme);
            this.syncDocumentTheme();
        },
        async setTheme(payload = {}) {
            this.applyTheme(payload);
            await appConfig.setProperty(THEME_MODE_STORAGE_KEY, this.themeMode);
            await appConfig.setProperty(LIGHT_THEME_STORAGE_KEY, this.preferredLightThemeId);
            await appConfig.setProperty(DARK_THEME_STORAGE_KEY, this.preferredDarkThemeId);
            await appConfig.setProperty(UI_FONT_FAMILY_STORAGE_KEY, this.uiFontFamily);
        },
        async setIconTheme(iconThemeId) {
            this.iconThemeId = this.normalizeIconThemeId(iconThemeId);
            this.syncDocumentTheme();
            await appConfig.setProperty(ICON_THEME_STORAGE_KEY, this.iconThemeId);
        },
    },
});
