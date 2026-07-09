<template>
    <div class="app-json-editor">
        <div class="app-json-editor__content">
            <app-split-pane class="app-json-editor__split" split="vertical" :min-percent="hasSecondaryPane ? 20 : 0" :default-percent="effectiveSecondaryPanePercent" :fold="false" :show-resizer="hasSecondaryPane" :show-pane-r="hasSecondaryPane" @resize="handleSecondaryPaneResize">
                <template #paneL>
                    <div class="app-json-editor__pane">
                        <div class="app-json-editor__pane-body">
                            <div ref="primaryEditorContainer" class="app-json-editor__surface"></div>
                        </div>
                        <div v-if="allowFilter && filterBarVisible" class="app-json-editor__pane-footer app-json-editor__pane-footer--left">
                            <div class="app-json-editor__filter-bar">
                                <div class="app-json-editor__filter-shell">
                                    <el-select v-model="selectedFilterType" size="mini" class="app-json-editor__filter-type">
                                        <el-option v-for="item in filterTypeOptions" :key="item.type" :label="item.label" :value="item.type"></el-option>
                                    </el-select>
                                    <span class="app-json-editor__filter-divider" aria-hidden="true"></span>
                                    <el-input ref="filterInput" v-model="filterExpression" size="mini" clearable class="app-json-editor__filter-input" :placeholder="filterExpressionPlaceholder" @keydown.native="handleFilterInputKeydown"></el-input>
                                </div>
                                <button type="button" class="app-json-editor__filter-close" :title="getI18nText('editor.hideFilterBar', '隐藏过滤栏')" @click="hideFilterBar">
                                    <i class="el-icon-close"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
                <template #paneR>
                    <div v-if="hasSecondaryPane" class="app-json-editor__pane app-json-editor__pane--secondary">
                        <div class="app-json-editor__pane-body">
                            <div v-show="shouldShowCompareTab && activeSecondaryTabId === secondaryTabCompare" ref="compareEditorContainer" class="app-json-editor__surface"></div>
                            <div v-show="shouldShowFilterResultTab && activeSecondaryTabId === secondaryTabFilter" class="app-json-editor__result">
                                <app-json-editor ref="filterResultEditor" :value="filterResultValue" :lint="false" :readonly="true" :allow-filter="false"></app-json-editor>
                            </div>
                        </div>
                        <div v-if="secondaryTabs.length > 0" class="app-json-editor__pane-footer app-json-editor__pane-footer--right">
                            <app-tabs class="app-json-editor__secondary-tabs" :tabs="secondaryTabs" :active-id="activeSecondaryTabId" :draggable="false" :enable-overflow="false" :show-tooltip="false" @change="setSecondaryViewMode"></app-tabs>
                        </div>
                    </div>
                </template>
            </app-split-pane>
        </div>
    </div>
</template>

<script>

import lodash from 'lodash';
// import * as monaco            from "monaco-editor/esm/vs/editor/editor.api";

// 异步加载，不然首页加载半天
let monaco;
window.getMonaco = lodash.once(async () => {
    await import("monaco-editor/esm/vs/editor/editor.all");
    await import("monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css");
    await import("monaco-editor/esm/vs/editor/contrib/symbolIcons/browser/symbolIcons");
    return monaco = await import('monaco-editor');
});

window.jsonDefaults = lodash.once(async () => (await import("monaco-editor/esm/vs/language/json/monaco.contribution")).jsonDefaults);
// window.EditorWorker;
// window.JsonWorker;


// const getMonaco = lodash.once(() => import('monaco-editor'));
// const getMonaco = lodash.once(() => import('monaco-editor'));


// async function getMonaco() {
//     if (!window.monaco) {
//         window.monaco = await import('monaco-editor');
//         await import("monaco-editor/esm/vs/editor/editor.all");
//         await import("monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css");
//         await import("monaco-editor/esm/vs/editor/contrib/symbolIcons/browser/symbolIcons");
//         // window.jsonDefaults =  (await import("monaco-editor/esm/vs/language/json/monaco.contribution")).jsonDefaults;
//         // window.EditorWorker = await import( "monaco-editor/esm/vs/editor/editor.worker?worker");
//         // window.JsonWorker = await import( "monaco-editor/esm/vs/language/json/json.worker?worker");
//         console.log("ddd 2 " + Date.now())
//     }
//     return window.monaco;
// }

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// 预加载一下
window.getMonaco();


import JSONUtils              from "@/common/utils/JSONUtils";
import AppTabs                from "@/renderer/components/tabs/index.vue";
import { useThemeStore }      from "@/renderer/store/modules/theme.js";
import { JsonEditorComparer } from "./json-compare/comparer";
import jsonFilter             from './json-filter/';

const RENDER_MODE_SINGLE = "single";
const RENDER_MODE_SPLIT = "split";
const SECONDARY_TAB_COMPARE = "compare";
const SECONDARY_TAB_FILTER = "filter";
let activeShortcutEditor = null;
let jsonDiagnosticsInstanceSeed = 0;
const jsonDiagnosticsLintRegistry = new Map();

self.MonacoEnvironment = {
    getWorker(moduleId, label) {
        if (label === 'json') {
            return new JsonWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new TsWorker();
        }
        return new EditorWorker();
    },
};



export default {
    name: "AppJsonEditor",
    components: {
        AppTabs,
    },
    props: {
        value: {
            type: String,
            default: "",
        },
        lint: {
            type: Boolean,
            default: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        allowFilter: {
            type: Boolean,
            default: true,
        },
        compareCode: {
            type: String,
            default: "",
        },
        compareReadonly: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        const themeStore = useThemeStore();
        return {
            themeStore,
            // editor: null,
            // compareEditor: null,
            // comparer: null,
            // primaryModel: null,
            // compareModel: null,
            // editorDisposables: [],
            // jqEnginePromise: null,
            filterRunId: 0,
            // foldSummaryStates: [],
            filterBarVisible: false,
            filterExpression: "",
            selectedFilterType: "js",
            secondaryPanePercent: 50,
            filterResultValue: "",
            compareVisible: false,
            secondaryViewMode: SECONDARY_TAB_COMPARE,
            localCompareCode: null,
            isApplyingModelValue: false,
            // focusedEditorInstance: null,
            secondaryTabCompare: SECONDARY_TAB_COMPARE,
            secondaryTabFilter: SECONDARY_TAB_FILTER,
        };
    },
    computed: {
        isDarkTheme() {
            return this.themeStore.isDarkTheme;
        },
        resolvedCompareCode() {
            return this.localCompareCode !== null ? this.localCompareCode : this.compareCode;
        },
        hasFilterExpression() {
            return this.allowFilter && this.filterBarVisible && !!this.filterExpression.trim();
        },
        shouldShowCompareTab() {
            return this.compareVisible;
        },
        shouldShowFilterResultTab() {
            return this.hasFilterExpression;
        },
        secondaryTabs() {
            const tabs = [];
            if (this.shouldShowCompareTab) {
                tabs.push({
                    id: SECONDARY_TAB_COMPARE,
                    label: this.getI18nText("editor.compareResult", "对比结果"),
                });
            }
            if (this.shouldShowFilterResultTab) {
                tabs.push({
                    id: SECONDARY_TAB_FILTER,
                    label: this.getI18nText("editor.filterResult", "过滤结果"),
                });
            }
            return tabs;
        },
        hasSecondaryPane() {
            return this.secondaryTabs.length > 0;
        },
        activeSecondaryTabId() {
            if (this.secondaryViewMode === SECONDARY_TAB_FILTER && this.shouldShowFilterResultTab) {
                return SECONDARY_TAB_FILTER;
            }
            if (this.shouldShowCompareTab) {
                return SECONDARY_TAB_COMPARE;
            }
            if (this.shouldShowFilterResultTab) {
                return SECONDARY_TAB_FILTER;
            }
            return "";
        },
        renderMode() {
            if (this.hasSecondaryPane) {
                return RENDER_MODE_SPLIT;
            }
            return RENDER_MODE_SINGLE;
        },
        effectiveSecondaryPanePercent() {
            return this.hasSecondaryPane ? this.secondaryPanePercent : 100;
        },
        editorLayoutKey() {
            return this.activeSecondaryTabId === SECONDARY_TAB_COMPARE ? SECONDARY_TAB_COMPARE : "primary";
        },
        filterTypeOptions() {
            return jsonFilter.filterTypeOptions();
        },
        filterExpressionPlaceholder() {
            return this.filterTypeOptions.find(x => x.type === this.selectedFilterType).placeholder || "请输入过滤表达式";
        },
        monacoTheme() {
            return this.isDarkTheme ? "vs-dark" : "vs";
        },
    },
    created(){
        
        this.editor = null;
        this.compareEditor = null;
        this.comparer = null;
        this.primaryModel = null;
        this.compareModel = null;
        this.editorDisposables = [];
        this.jqEnginePromise = null;
        this.foldSummaryStates = [];
        this.focusedEditorInstance = null;
        this.jsonDiagnosticsInstanceId = `app-json-editor-${++jsonDiagnosticsInstanceSeed}`;
    } ,
    async mounted() {
        await window.getMonaco();
        await this.applyJsonDiagnostics();
        this.applyEditorTheme();
        this.mountPrimaryEditor();
        this.syncCompareEditorState(true);
        this.runFilterIfNeeded();
    },
    async beforeDestroy() {
        if (activeShortcutEditor === this) {
            activeShortcutEditor = null;
        }
        await this.unregisterJsonDiagnostics();
        this.disposeEditors();
    },
    methods: {
        setEditorValue(value) {
            const nextValue = typeof value === "string" ? value : "";
            this.updatePrimaryModelValue(nextValue);
            this.$emit("input", nextValue);
        },
        markAsActiveShortcutEditor(editorInstance) {
            activeShortcutEditor = this;
            if (editorInstance) {
                this.focusedEditorInstance = editorInstance;
            }
        },
        handleFilterInputKeydown(event) {
            const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
            const isCtrlOrMeta = event.ctrlKey || event.metaKey;
            let handled = false;

            if (event.ctrlKey && event.altKey && key === "f" && this.allowFilter) {
                this.toggleFilterBar();
                handled = true;
            } else if (isCtrlOrMeta && event.altKey && key === "j" && this.allowFilter) {
                this.toggleFilterBar();
                handled = true;
            } else if (isCtrlOrMeta && !event.altKey && key === "f") {
                this.openFind();
                handled = true;
            } else if (
                (isCtrlOrMeta && !event.altKey && key === "h") ||
                (event.metaKey && event.altKey && key === "f")
            ) {
                this.openReplace();
                handled = true;
            } else if (isCtrlOrMeta && !event.altKey && key === "g") {
                if (event.shiftKey) {
                    this.findPrev();
                } else {
                    this.findNext();
                }
                handled = true;
            } else if (!isCtrlOrMeta && key === "f3") {
                if (event.shiftKey) {
                    this.findPrev();
                } else {
                    this.findNext();
                }
                handled = true;
            }

            if (!handled) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
        },
        getI18nText(key, fallback) {
            if (!this.$t) {
                return fallback;
            }

            const translated = this.$t(key);
            return translated === key ? fallback : translated;
        },
        async getJsonDefaults() {
            const jsonDefaults = (await import("monaco-editor/esm/vs/language/json/monaco.contribution")).jsonDefaults;
            if (jsonDefaults && typeof jsonDefaults.setDiagnosticsOptions === "function") {
                return jsonDefaults;
            }

            const monaco = await window.getMonaco();
            const monacoJsonDefaults = monaco &&
                monaco.languages &&
                monaco.languages.json &&
                monaco.languages.json.jsonDefaults;

            if (monacoJsonDefaults && typeof monacoJsonDefaults.setDiagnosticsOptions === "function") {
                return monacoJsonDefaults;
            }

            return null;
        },
        async applyJsonDiagnostics() {
            const defaults = await this.getJsonDefaults();
            if (!defaults) {
                console.warn("app-json-editor jsonDefaults is unavailable");
                return;
            }

            jsonDiagnosticsLintRegistry.set(this.jsonDiagnosticsInstanceId, !!this.lint);

            const validate = Array.from(jsonDiagnosticsLintRegistry.values()).some(Boolean);
            defaults.setDiagnosticsOptions({
                validate,
                allowComments: true,
                trailingCommas: "ignore",
                schemaValidation: "ignore",
                schemaRequest: "ignore",
            });
        },
        async unregisterJsonDiagnostics() {
            jsonDiagnosticsLintRegistry.delete(this.jsonDiagnosticsInstanceId);

            const defaults = await this.getJsonDefaults();
            if (!defaults) {
                return;
            }

            const validate = Array.from(jsonDiagnosticsLintRegistry.values()).some(Boolean);
            defaults.setDiagnosticsOptions({
                validate,
                allowComments: true,
                trailingCommas: "ignore",
                schemaValidation: "ignore",
                schemaRequest: "ignore",
            });
        },
        ensureJsonLanguage(model) {
            
            if (!model || !monaco.editor || typeof monaco.editor.setModelLanguage !== "function") {
                return;
            }

            if (typeof model.getLanguageId === "function" && model.getLanguageId() === "json") {
                return;
            }

            monaco.editor.setModelLanguage(model, "json");
        },
        forceRefreshJsonLanguage(model) {
            if (!model || !monaco.editor || typeof monaco.editor.setModelLanguage !== "function") {
                return;
            }

            const currentLanguageId = typeof model.getLanguageId === "function"
                ? model.getLanguageId()
                : "";

            if (currentLanguageId && currentLanguageId !== "json") {
                monaco.editor.setModelLanguage(model, "json");
                return;
            }

            monaco.editor.setModelLanguage(model, "plaintext");
            requestAnimationFrame(() => {
                monaco.editor.setModelLanguage(model, "json");
            });
        },
        scheduleJsonLanguageRefresh(callback) {
            const models = [this.primaryModel, this.compareModel].filter(Boolean);
            if (models.length === 0) {
                callback && callback();
                return;
            }

            models.forEach(model => {
                this.forceRefreshJsonLanguage(model);
            });

            requestAnimationFrame(() => {
                models.forEach(model => {
                    this.ensureJsonLanguage(model);
                });

                requestAnimationFrame(() => {
                    models.forEach(model => {
                        this.ensureJsonLanguage(model);
                    });

                    setTimeout(() => {
                        models.forEach(model => {
                            this.forceRefreshJsonLanguage(model);
                        });
                        callback && callback();
                    }, 0);
                });
            });
        },
        createCommonOptions(readOnly) {
            return {
                language: "json",
                readOnly,
                theme: this.monacoTheme,
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                minimap: { enabled: false },
                stickyScroll: {
                    enabled: true,
                    defaultModel: "foldingProviderModel",
                },
                find: {
                    addExtraSpaceOnTop: false,
                },
                folding: true,
                foldingStrategy: "auto",
                showFoldingControls: "always",
                renderLineHighlight: "all",
                selectionHighlight: true,
                matchBrackets: "always",
                quickSuggestions: true,
                largeFileOptimizations: false,
                stopRenderingLineAfter: -1,
                maxTokenizationLineLength: 500000,
                scrollbar: {
                    useShadows: false,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    vertical: "auto",
                    horizontal: "auto",
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                },
            };
        },
        disposeEditors() {
            this.disposeFoldSummaryStates();
            this.editorDisposables.forEach(item => item && item.dispose && item.dispose());
            this.editorDisposables = [];
            this.disposeCompareEditorState();

            if (this.editor) {
                this.editor.dispose();
                this.editor = null;
            }

            if (this.primaryModel) {
                this.primaryModel.dispose();
                this.primaryModel = null;
            }
            this.focusedEditorInstance = null;
        },
        disposeCompareEditorState() {
            this.disposeFoldSummaryStates(["secondary"]);
            if (this.comparer) {
                this.comparer.dispose();
                this.comparer = null;
            }

            if (this.compareEditor) {
                this.compareEditor.dispose();
                this.compareEditor = null;
            }

            if (this.compareModel) {
                this.compareModel.dispose();
                this.compareModel = null;
            }

            if (this.focusedEditorInstance && this.focusedEditorInstance !== this.editor) {
                this.focusedEditorInstance = this.editor;
            }
        },
        syncCompareEditorState(revealFirstDiff = false) {
            const shouldRefocusFilterInput = this.isFilterInputFocused();
            this.$nextTick(() => {
                if (this.shouldShowCompareTab) {
                    if (!this.compareEditor) {
                        this.mountCompareEditor();
                    }
                } else if (this.compareEditor || this.compareModel || this.comparer) {
                    this.disposeCompareEditorState();
                    this.refreshLayout();
                    if (shouldRefocusFilterInput && this.filterBarVisible) {
                        this.$nextTick(() => {
                            this.focusFilterInput();
                        });
                    }
                    return;
                }
                this.scheduleJsonLanguageRefresh(() => {
                    if (this.activeSecondaryTabId === SECONDARY_TAB_COMPARE) {
                        this.applyCompareResult({ revealFirstDiff });
                    }
                    this.refreshLayout();
                    this.$refs.filterResultEditor && this.$refs.filterResultEditor.refreshLayout && this.$refs.filterResultEditor.refreshLayout();
                    if (shouldRefocusFilterInput && this.filterBarVisible) {
                        this.$nextTick(() => {
                            this.focusFilterInput();
                        });
                    }
                });
            });
        },
        mountPrimaryEditor() {
            const container = this.$refs.primaryEditorContainer;
            if (!container) {
                return;
            }

            this.primaryModel = monaco.editor.createModel(this.value || "", "json");
            this.ensureJsonLanguage(this.primaryModel);
            this.editor = monaco.editor.create(container, {
                ...this.createCommonOptions(this.readonly),
                model: this.primaryModel,
                wordWrap: "off",
            });

            this.markAsActiveShortcutEditor(this.editor);
            this.bindEditorShortcuts(this.editor);
            this.registerEditorContextMenuActions(this.editor, "primary");
            this.bindPrimaryModel(this.primaryModel);
            this.bindEditorPasteRefresh(this.editor, this.primaryModel);
            this.setupFoldSummary(this.editor, this.primaryModel, "primary");
        },
        mountCompareEditor() {
            const container = this.$refs.compareEditorContainer;
            if (!container) {
                return;
            }

            this.compareModel = monaco.editor.createModel(this.resolvedCompareCode || "", "json");
            this.ensureJsonLanguage(this.compareModel);
            this.compareEditor = monaco.editor.create(container, {
                ...this.createCommonOptions(this.compareReadonly),
                model: this.compareModel,
                wordWrap: "off",
            });

            this.comparer = new JsonEditorComparer(this.editor, this.compareEditor);
            this.bindEditorShortcuts(this.compareEditor);
            this.registerEditorContextMenuActions(this.compareEditor, "secondary");
            this.bindCompareModel(this.compareModel);
            this.bindEditorPasteRefresh(this.compareEditor, this.compareModel);
            this.setupFoldSummary(this.compareEditor, this.compareModel, "secondary");
        },
        disposeFoldSummaryStates(scopes = null) {
            const scopeList = Array.isArray(scopes) ? scopes : null;
            const remainStates = [];

            this.foldSummaryStates.forEach(state => {
                if (scopeList && !scopeList.includes(state.scope)) {
                    remainStates.push(state);
                    return;
                }
                state.disposed = true;
                state.disposables.forEach(item => item && item.dispose && item.dispose());
                state.disposables = [];
                if (state.refreshTimer) {
                    clearTimeout(state.refreshTimer);
                    state.refreshTimer = null;
                }
                this.clearFoldSummaryWidgets(state);
            });
            this.foldSummaryStates = remainStates;
        },
        setupFoldSummary(editorInstance, model, scope) {
            if (!editorInstance || !model) {
                return;
            }

            const state = {
                scope,
                editor: editorInstance,
                model,
                disposables: [],
                widgets: [],
                requestId: 0,
                disposed: false,
                refreshTimer: null,
            };

            const foldingController = this.getFoldingController(editorInstance);
            if (foldingController && typeof foldingController.getFoldingModel === "function") {
                state.disposables.push(editorInstance.onDidChangeHiddenAreas(() => {
                    this.scheduleFoldSummaryRefresh(state);
                }));
                state.disposables.push(model.onDidChangeContent(() => {
                    this.scheduleFoldSummaryRefresh(state);
                }));
                Promise.resolve(foldingController.getFoldingModel()).then(foldingModel => {
                    if (!foldingModel || state.disposed) {
                        return;
                    }

                    state.disposables.push(foldingModel.onDidChange(() => {
                        this.scheduleFoldSummaryRefresh(state);
                    }));
                    this.scheduleFoldSummaryRefresh(state);
                }).catch(() => {
                    this.updateFoldSummaryDecorations(state, []);
                });
            } else {
                this.updateFoldSummaryDecorations(state, []);
            }

            this.foldSummaryStates.push(state);
        },
        getFoldingController(editorInstance) {
            if (!editorInstance || typeof editorInstance.getContribution !== "function") {
                return null;
            }
            return editorInstance.getContribution("editor.contrib.folding");
        },
        scheduleFoldSummaryRefresh(state) {
            if (!state || state.disposed) {
                return;
            }

            const requestId = ++state.requestId;
            if (state.refreshTimer) {
                clearTimeout(state.refreshTimer);
            }
            state.refreshTimer = setTimeout(() => {
                state.refreshTimer = null;
                this.refreshFoldSummary(state, requestId);
            }, 16);
        },
        async refreshFoldSummary(state, requestId) {
            if (!state || state.disposed || requestId !== state.requestId) {
                return;
            }

            try {
                const hiddenRanges = this.getEditorHiddenRanges(state.editor);
                this.updateFoldSummaryWidgets(state, this.buildFoldSummaryWidgets(state.editor, state.model, hiddenRanges, state.scope));
            } catch (error) {
                if (!state.disposed && requestId === state.requestId) {
                    this.clearFoldSummaryWidgets(state);
                }
            }
        },
        clearFoldSummaryWidgets(state) {
            if (!state || !state.editor || !Array.isArray(state.widgets)) {
                return;
            }

            state.widgets.forEach(widget => {
                state.editor.removeContentWidget(widget);
            });
            state.widgets = [];
        },
        updateFoldSummaryWidgets(state, widgets) {
            if (!state || state.disposed || !state.editor) {
                return;
            }

            this.clearFoldSummaryWidgets(state);
            widgets.forEach(widget => {
                state.editor.addContentWidget(widget);
                state.editor.layoutContentWidget(widget);
            });
            state.widgets = widgets;
        },
        buildFoldSummaryWidgets(editorInstance, model, hiddenRanges, scope) {
            if (!editorInstance || !model || !hiddenRanges || !hiddenRanges.length) {
                return [];
            }

            const usedPositionSet = new Set();
            const widgets = [];

            for (let i = 0; i < hiddenRanges.length; i++) {
                const hiddenRange = hiddenRanges[i];
                if (!hiddenRange) {
                    continue;
                }

                const startLineNumber = hiddenRange.startLineNumber - 1;
                const endLineNumber = hiddenRange.endLineNumber;
                if (startLineNumber < 1 || endLineNumber <= startLineNumber) {
                    continue;
                }

                const foldSummaryInfo = this.buildFoldSummaryInfo(model, startLineNumber, endLineNumber);

                if (!foldSummaryInfo) {
                    continue;
                }

                const decorationColumn = this.getFoldSummaryColumn(model, startLineNumber, foldSummaryInfo.type);
                if (!decorationColumn) {
                    continue;
                }
                const key = `${startLineNumber}:${decorationColumn}`;
                if (usedPositionSet.has(key)) {
                    continue;
                }
                usedPositionSet.add(key);

                widgets.push(this.createFoldSummaryWidget(scope, startLineNumber, decorationColumn, foldSummaryInfo.label));
            }

            return widgets;
        },
        createFoldSummaryWidget(scope, lineNumber, column, label) {
            const domNode = document.createElement("span");
            domNode.className = "app-json-editor__fold-summary-widget";
            domNode.textContent = label;

            return {
                allowEditorOverflow: false,
                suppressMouseDown: false,
                getId: () => `ddm-fold-summary-${scope}-${lineNumber}-${column}`,
                getDomNode: () => domNode,
                getPosition: () => ({
                    position: { lineNumber, column },
                    preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
                }),
            };
        },
        getEditorHiddenRanges(editorInstance) {
            const viewModel = editorInstance && typeof editorInstance._getViewModel === "function"
                ? editorInstance._getViewModel()
                : null;

            if (!viewModel || typeof viewModel.getHiddenAreas !== "function") {
                return [];
            }

            return viewModel.getHiddenAreas() || [];
        },
        buildFoldSummaryInfo(model, startLineNumber, endLineNumber) {
            const foldInfo = this.getFoldSummaryInfo(model, startLineNumber, endLineNumber);
            if (foldInfo) {
                return {
                    ...foldInfo,
                    label: this.getFoldSummaryText(foldInfo.type, foldInfo.count),
                };
            }

            const lineCount = Math.max(0, endLineNumber - startLineNumber);
            if (lineCount <= 0) {
                return null;
            }

            return {
                type: "lines",
                count: lineCount,
                label: this.getFoldSummaryText("lines", lineCount),
            };
        },
        getFoldSummaryText(type, count) {
            return `[ ${count} ]`;
        },
        getFoldSummaryColumn(model, startLineNumber, type) {
            if (!model) {
                return 0;
            }

            return model.getLineMaxColumn(startLineNumber);
        },
        getFoldSummaryInfo(model, startLineNumber, endLineNumber) {
            if (!model || startLineNumber >= endLineNumber) {
                return null;
            }

            const blockText = model.getValueInRange({
                startLineNumber,
                startColumn: 1,
                endLineNumber,
                endColumn: model.getLineMaxColumn(endLineNumber),
            });
            const type = this.detectFoldBlockType(blockText);
            if (!type) {
                return null;
            }

            const count = this.countTopLevelFoldEntries(blockText, type);
            if (count < 0) {
                return null;
            }

            return {
                type,
                count,
            };
        },
        detectFoldBlockType(blockText) {
            const text = blockText || "";
            const startIndex = text.search(/[\[{]/);
            if (startIndex < 0) {
                return "";
            }

            const startChar = text.charAt(startIndex);
            if (startChar === "[") {
                return "array";
            }
            if (startChar === "{") {
                return "object";
            }
            return "";
        },
        countTopLevelFoldEntries(blockText, type) {
            const text = (blockText || "").trim();
            if (!text) {
                return -1;
            }

            const openChar = type === "array" ? "[" : "{";
            const closeChar = type === "array" ? "]" : "}";
            const startIndex = text.indexOf(openChar);
            if (startIndex < 0) {
                return -1;
            }

            const endIndex = text.lastIndexOf(closeChar);
            const innerText = endIndex > startIndex
                ? text.slice(startIndex + 1, endIndex)
                : text.slice(startIndex + 1);
            if (!innerText.trim()) {
                return 0;
            }

            let depth = 0;
            let inString = false;
            let escaped = false;
            let hasToken = false;
            let count = 0;

            for (let i = 0; i < innerText.length; i++) {
                const char = innerText.charAt(i);

                if (inString) {
                    hasToken = true;
                    if (escaped) {
                        escaped = false;
                        continue;
                    }
                    if (char === "\\") {
                        escaped = true;
                        continue;
                    }
                    if (char === "\"") {
                        inString = false;
                    }
                    continue;
                }

                if (char === "\"") {
                    inString = true;
                    hasToken = true;
                    continue;
                }

                if (char === "[" || char === "{") {
                    depth++;
                    hasToken = true;
                    continue;
                }

                if (char === "]" || char === "}") {
                    if (depth > 0) {
                        depth--;
                    }
                    hasToken = true;
                    continue;
                }

                if (char === "," && depth === 0) {
                    count++;
                    hasToken = false;
                    continue;
                }

                if (!/\s/.test(char)) {
                    hasToken = true;
                }
            }

            return count + (hasToken ? 1 : 0);
        },
        registerEditorContextMenuActions(editorInstance, scope = "primary") {
            if (!editorInstance || typeof editorInstance.addAction !== "function") {
                return;
            }

            const actionList = [
                {
                    id: `ddm.find.${scope}`,
                    label: this.$t ? this.$t("editor.find") : "查找",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
                    order: 1.1,
                    run: () => this.openFind(),
                },
                {
                    id: `ddm.replace.${scope}`,
                    label: this.$t ? this.$t("editor.replace") : "替换",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH],
                    order: 1.2,
                    run: () => this.openReplace(),
                },
                {
                    id: `ddm.findNext.${scope}`,
                    label: this.$t ? this.$t("editor.findNext") : "查找下一个",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, monaco.KeyCode.F3],
                    order: 1.3,
                    run: () => this.findNext(),
                },
                {
                    id: `ddm.findPrev.${scope}`,
                    label: this.$t ? this.$t("editor.findPrev") : "查找上一个",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyG, monaco.KeyMod.Shift | monaco.KeyCode.F3],
                    order: 1.4,
                    run: () => this.findPrev(),
                },
                {
                    id: `ddm.format.${scope}`,
                    label: this.$t ? this.$t("editor.format") : "格式化",
                    group: "1_modification",
                    order: 1.5,
                    run: () => this.formatContent(),
                },
                {
                    id: `ddm.openWindow.${scope}`,
                    label: this.$t ? this.$t("editor.openInWindow") : "在新窗口打开",
                    group: "1_modification",
                    order: 1.55,
                    run: () => this.openStandaloneWindow(),
                },
                {
                    id: `ddm.deleteLines.${scope}`,
                    label: "删除行",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD],
                    group: "1_modification",
                    order: 1.61,
                    run: editor => this.runNativeEditorAction(editor, "editor.action.deleteLines"),
                },
                {
                    id: `ddm.moveLinesUp.${scope}`,
                    label: "上移行",
                    keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.UpArrow],
                    group: "1_modification",
                    order: 1.62,
                    run: editor => this.runNativeEditorAction(editor, "editor.action.moveLinesUpAction"),
                },
                {
                    id: `ddm.moveLinesDown.${scope}`,
                    label: "下移行",
                    keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.DownArrow],
                    group: "1_modification",
                    order: 1.63,
                    run: editor => this.runNativeEditorAction(editor, "editor.action.moveLinesDownAction"),
                },
                {
                    id: `ddm.copyLinesUp.${scope}`,
                    label: "向上复制行",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.UpArrow],
                    group: "1_modification",
                    order: 1.64,
                    run: editor => this.runNativeEditorAction(editor, "editor.action.copyLinesUpAction"),
                },
                {
                    id: `ddm.copyLinesDown.${scope}`,
                    label: "向下复制行",
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow],
                    group: "1_modification",
                    order: 1.65,
                    run: editor => this.runNativeEditorAction(editor, "editor.action.copyLinesDownAction"),
                },
            ];

            if (this.allowFilter) {
                actionList.push({
                    id: `ddm.toggleFilter.${scope}`,
                    label: this.filterBarVisible
                        ? (this.$t ? this.$t("editor.hideFilterBar") : "隐藏过滤栏")
                        : (this.$t ? this.$t("editor.showFilterBar") : "显示过滤栏"),
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyJ,
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
                    ],
                    group: "1_modification",
                    order: 1.66,
                    run: () => this.toggleFilterBar(),
                });
            }

            actionList.forEach(action => {
                const disposable = editorInstance.addAction({
                    id: action.id,
                    label: action.label,
                    keybindings: action.keybindings,
                    contextMenuGroupId: action.group || "navigation",
                    contextMenuOrder: action.order,
                    run: editor => action.run(editor),
                });

                this.editorDisposables.push(disposable);
            });
        },
        runNativeEditorAction(editorInstance, actionId) {
            if (!editorInstance || typeof editorInstance.trigger !== "function") {
                return;
            }

            this.markAsActiveShortcutEditor(editorInstance);
            editorInstance.trigger("app-json-editor", actionId, null);
        },
        bindEditorShortcuts(editorInstance) {
            if (!editorInstance) {
                return;
            }

            this.editorDisposables.push(editorInstance.onDidFocusEditorText(() => {
                this.markAsActiveShortcutEditor(editorInstance);
            }));
            this.editorDisposables.push(editorInstance.onDidFocusEditorWidget(() => {
                this.markAsActiveShortcutEditor(editorInstance);
            }));
            this.editorDisposables.push(editorInstance.onMouseDown(() => {
                this.markAsActiveShortcutEditor(editorInstance);
            }));
        },
        bindPrimaryModel(model) {
            if (!model) {
                return;
            }

            this.editorDisposables.push(model.onDidChangeContent(() => {
                if (this.isApplyingModelValue) {
                    return;
                }
                this.setEditorValue(model.getValue());
                this.runFilterIfNeeded();
                if (this.activeSecondaryTabId === SECONDARY_TAB_COMPARE) {
                    this.applyCompareResult();
                }
            }));
        },
        bindCompareModel(model) {
            if (!model) {
                return;
            }

            this.editorDisposables.push(model.onDidChangeContent(() => {
                if (this.isApplyingModelValue) {
                    return;
                }
                this.setCompareCode(model.getValue());
                if (this.activeSecondaryTabId === SECONDARY_TAB_COMPARE) {
                    this.applyCompareResult();
                }
            }));
        },
        bindEditorPasteRefresh(editorInstance, model) {
            if (!editorInstance || !model || typeof editorInstance.onDidPaste !== "function") {
                return;
            }

            this.editorDisposables.push(editorInstance.onDidPaste(() => {
                this.$nextTick(() => {
                    this.forceRefreshJsonLanguage(model);
                    this.refreshLayout();
                });
            }));
        },
        getPrimaryEditor() {
            return this.editor;
        },
        getPrimaryModel() {
            return this.primaryModel;
        },
        getCompareModel() {
            return this.compareModel;
        },
        getActionTargetEditor() {
            if (this.focusedEditorInstance) {
                return this.focusedEditorInstance;
            }
            return this.getPrimaryEditor();
        },
        applyEditorTheme() {
            monaco.editor.defineTheme("app-json-editor-light", {
                base: "vs",
                inherit: true,
                rules: [],
                colors: {
                    "editor.lineHighlightBackground": "#f6f8fa",
                    "editor.lineHighlightBorder": "#f6f8fa",
                    "editorGutter.background": "#ffffff",
                },
            });
            monaco.editor.defineTheme("app-json-editor-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.lineHighlightBackground": "#24272b",
                    "editor.lineHighlightBorder": "#24272b",
                },
            });
            monaco.editor.setTheme(this.isDarkTheme ? "app-json-editor-dark" : "app-json-editor-light");
        },
        applyEditorOptions() {
            this.applyJsonDiagnostics();

            const editor = this.getPrimaryEditor();
            if (editor) {
                editor.updateOptions({
                    readOnly: this.readonly,
                });
            }

            if (this.compareEditor) {
                this.compareEditor.updateOptions({
                    readOnly: this.compareReadonly,
                });
            }
        },
        updatePrimaryModelValue(value) {
            const model = this.getPrimaryModel();
            if (!model || model.getValue() === value) {
                return;
            }

            this.isApplyingModelValue = true;
            // model.setValue(value || "");
            // 用 pushEditOperations 替换全文，保留撤销栈
            model.pushEditOperations(
                [],
                [
                    {
                        range: model.getFullModelRange(),
                        text: value || "",
                    },
                ],
                () => null
            );
            
            this.isApplyingModelValue = false;
        },
        updateCompareModelValue(value) {
            const model = this.getCompareModel();
            if (model && model.getValue() !== value) {
                model.setValue(value || "");
                this.ensureJsonLanguage(model);
                return;
            }
            this.setCompareCode(value || "");
        },
        fullScreen() {
            this.refreshLayout();
        },
        copy() {
            navigator.clipboard.writeText(this.value || "");
            this.$message({
                type: "success",
                message: this.$t ? this.$t("editor.copySuccess") : "复制成功",
            });
        },
        formatContent() {
            const formatedCode = JSONUtils.formatBigIntAsBigInt(this.value || "");
            this.setEditorValue(formatedCode);
        },
        refreshLayout() {
            this.$nextTick(() => {
                this.editor && this.editor.layout && this.editor.layout();
                this.compareEditor && this.compareEditor.layout && this.compareEditor.layout();
                this.$refs.filterResultEditor && this.$refs.filterResultEditor.refreshLayout && this.$refs.filterResultEditor.refreshLayout();
            });
        },
        focus() {
            const editor = this.getActionTargetEditor();
            editor && editor.focus && editor.focus();
            this.refreshLayout();
        },
        openFind() {
            const editor = this.getActionTargetEditor();
            if (!editor) {
                return;
            }
            const action = editor.getAction("actions.find");
            action && action.run && action.run();
        },
        openReplace() {
            const editor = this.getActionTargetEditor();
            if (!editor) {
                return;
            }
            const action = editor.getAction("editor.action.startFindReplaceAction");
            action && action.run && action.run();
        },
        findNext() {
            const editor = this.getActionTargetEditor();
            if (!editor) {
                return;
            }
            const action = editor.getAction("editor.action.nextMatchFindAction");
            action && action.run && action.run();
        },
        findPrev() {
            const editor = this.getActionTargetEditor();
            if (!editor) {
                return;
            }
            const action = editor.getAction("editor.action.previousMatchFindAction");
            action && action.run && action.run();
        },
        focusFilterInput() {
            this.$nextTick(() => {
                const filterInput = this.$refs.filterInput;
                if (filterInput && typeof filterInput.focus === "function") {
                    filterInput.focus();
                }
            });
        },
        isFilterInputFocused() {
            const filterInput = this.$refs.filterInput;
            const activeElement = document.activeElement;
            if (!filterInput || !activeElement) {
                return false;
            }

            const inputElement = filterInput.$refs && filterInput.$refs.input
                ? filterInput.$refs.input
                : filterInput.$el && typeof filterInput.$el.querySelector === "function"
                    ? filterInput.$el.querySelector("input,textarea")
                    : null;

            return !!inputElement && inputElement === activeElement;
        },
        setFilterBarVisible(visible) {
            if (!this.allowFilter) {
                return;
            }
            this.filterBarVisible = !!visible;
            this.$nextTick(() => {
                this.runFilterIfNeeded();
                this.refreshLayout();
                if (this.filterBarVisible) {
                    this.focusFilterInput();
                } else {
                    const editor = this.getPrimaryEditor();
                    editor && editor.focus && editor.focus();
                }
            });
        },
        showFilterBar() {
            this.setFilterBarVisible(true);
        },
        hideFilterBar() {
            this.setFilterBarVisible(false);
        },
        toggleFilterBar(forceVisible) {
            if (typeof forceVisible === "boolean") {
                this.setFilterBarVisible(forceVisible);
                return;
            }
            this.setFilterBarVisible(!this.filterBarVisible);
        },
        setSecondaryViewMode(tab) {
            if (tab.id === SECONDARY_TAB_FILTER && !this.shouldShowFilterResultTab) {
                return;
            }
            if (tab.id === SECONDARY_TAB_COMPARE && !this.shouldShowCompareTab) {
                return;
            }
            this.secondaryViewMode = tab.id === SECONDARY_TAB_FILTER ? SECONDARY_TAB_FILTER : SECONDARY_TAB_COMPARE;
        },
        toggleFilterBarAndFocus() {
            if (this.filterBarVisible) {
                this.hideFilterBar();
                return;
            }
            this.showFilterBar();
            this.focusFilterInput();
        },
        setFilterExpression(expression) {
            this.filterExpression = typeof expression === "string" ? expression : "";
        },
        setCompareVisible(visible) {
            this.compareVisible = !!visible;
        },
        showCompare(compareCode) {
            if (typeof compareCode !== "undefined") {
                this.setCompareCode(compareCode);
            }
            this.setCompareVisible(true);
            this.secondaryViewMode = SECONDARY_TAB_COMPARE;
            this.syncCompareEditorState(true);
        },
        hideCompare() {
            this.setCompareVisible(false);
        },
        toggleCompare(forceVisible) {
            if (typeof forceVisible === "boolean") {
                this.setCompareVisible(forceVisible);
                return;
            }
            this.setCompareVisible(!this.compareVisible);
        },
        setCompareCode(compareCode) {
            this.localCompareCode = typeof compareCode === "string" ? compareCode : "";
        },
        async openStandaloneWindow(options = {}) {
            return appRuntime.openStandaloneJsonEditor({
                title: options.title || this.getI18nText("editor.standaloneWindowTitle", "JSON 编辑器"),
                code: this.value || "",
                compareCode: this.resolvedCompareCode || "",
                compareVisible: this.compareVisible,
                compareReadonly: this.compareReadonly,
                allowFilter: this.allowFilter,
                lint: this.lint,
                readonly: this.readonly,
                filterBarVisible: this.filterBarVisible,
                filterExpression: this.filterExpression,
                selectedFilterType: this.selectedFilterType,
                secondaryViewMode: this.secondaryViewMode,
            });
        },
        handleFilterResultResize(percent) {
            this.secondaryPanePercent = percent;
            this.refreshLayout();
        },
        handleSecondaryPaneResize(percent) {
            this.secondaryPanePercent = percent;
            this.refreshLayout();
        },
        applyCompareResult(options = {}) {
            if (!this.comparer || this.activeSecondaryTabId !== SECONDARY_TAB_COMPARE) {
                return;
            }
            const diffPairs = this.comparer.compare(this.value || "", this.resolvedCompareCode || "");
            this.comparer.highlightDiff(diffPairs, options);
        },

        async runFilterIfNeeded() {
            const runId = ++this.filterRunId;
            if (!this.hasFilterExpression) {
                this.filterResultValue = "";
                return;
            }

            try {
                const sourceData = this.parseSourceCode();
                const filterResult = await jsonFilter.execute(this.selectedFilterType, this.filterExpression, sourceData);
                if (runId !== this.filterRunId) {
                    return;
                }
                this.filterResultValue = filterResult;
            } catch (error) {
                if (runId !== this.filterRunId) {
                    return;
                }
                this.filterResultValue = JSONUtils.formatBigIntAsBigInt({
                    error: true,
                    message: error && error.message ? error.message : String(error),
                    filterType: this.selectedFilterType,
                    expression: this.filterExpression,
                });
            }

            this.$nextTick(() => this.$refs?.filterResultEditor?.refreshLayout?.());
        },
        parseSourceCode() {
            return JSONUtils.parseBigIntAsBigInt(this.value || "");
        },
        

    },
    watch: {
        isDarkTheme() {
            this.applyEditorTheme();
        },
        lint() {
            this.applyEditorOptions();
        },
        readonly() {
            this.applyEditorOptions();
        },
        compareReadonly() {
            this.applyEditorOptions();
        },
        editorLayoutKey() {
            this.syncCompareEditorState(this.activeSecondaryTabId === SECONDARY_TAB_COMPARE);
        },
        compareVisible() {
            if (!this.compareVisible) {
                if (this.secondaryViewMode === SECONDARY_TAB_COMPARE && this.shouldShowFilterResultTab) {
                    this.secondaryViewMode = SECONDARY_TAB_FILTER;
                }
            } else if (this.secondaryViewMode !== SECONDARY_TAB_FILTER) {
                this.secondaryViewMode = SECONDARY_TAB_COMPARE;
            }
            this.refreshLayout();
        },
        hasFilterExpression(value) {
            if (!value && this.compareVisible && this.secondaryViewMode === SECONDARY_TAB_FILTER) {
                this.secondaryViewMode = SECONDARY_TAB_COMPARE;
            }
            if (value) {
                this.secondaryViewMode = SECONDARY_TAB_FILTER;
            }
        },
        hasSecondaryPane() {
            this.runFilterIfNeeded();
            this.refreshLayout();
        },
        filterExpression() {
            if (this.compareVisible) {
                this.secondaryViewMode = this.hasFilterExpression ? SECONDARY_TAB_FILTER : SECONDARY_TAB_COMPARE;
            }
            this.runFilterIfNeeded();
        },
        selectedFilterType() {
            this.runFilterIfNeeded();
        },
        value(value) {
            this.updatePrimaryModelValue(typeof value === "string" ? value : "");
            this.runFilterIfNeeded();
            if (this.activeSecondaryTabId === SECONDARY_TAB_COMPARE) {
                this.applyCompareResult();
            }
        },
        resolvedCompareCode(value) {
            this.updateCompareModelValue(value || "");
            if (this.activeSecondaryTabId === SECONDARY_TAB_COMPARE) {
                this.applyCompareResult();
            }
        },
    },
};
</script>

<style>
.app-json-editor {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
}

.app-json-editor__content {
    flex: 1 1 auto;
    height: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.app-json-editor__content > .app-json-editor__split,
.app-json-editor__content > .app-json-editor__pane {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
}

.app-json-editor__split,
.app-json-editor__pane,
.app-json-editor__pane-body,
.app-json-editor__result,
.app-json-editor__surface {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
}

.app-json-editor__pane,
.app-json-editor__result {
    display: flex;
    flex-direction: column;
}

.app-json-editor__pane-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
}

.app-json-editor__result > .app-json-editor {
    flex: 1 1 auto;
    min-height: 0;
}

.app-json-editor__pane-footer {
    flex: 0 0 36px;
    min-height: 36px;
    border-top: 1px solid var(--app-theme-border);
    background: var(--app-theme-workbench-panel-bg);
    display: flex;
    align-items: stretch;
    min-width: 0;
}

.app-json-editor__surface {
    min-width: 0;
}

.app-json-editor__secondary-tabs {
    width: 100%;
}

.app-json-editor__secondary-tabs.app-tabs {
    border-bottom: none;
}

.app-json-editor__secondary-tabs /deep/ .app-tabs-nav-scroll,
.app-json-editor__secondary-tabs /deep/ .app-tabs-nav {
    height: 100%;
}

.app-json-editor__filter-bar {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-height: 35px;
    box-sizing: border-box;
    padding: 4px;
    background: transparent;
    margin: 0;
    overflow: hidden;
}

.app-json-editor__filter-shell {
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    height: 28px;
    min-width: 0;
    gap: 0;
    background: var(--app-theme-control-bg);
    border: 1px solid var(--app-theme-control-border);
    border-radius: 4px;
    box-sizing: border-box;
}

.app-json-editor__filter-divider {
    display: inline-block;
    flex: 0 0 auto;
    width: 1px;
    height: 16px;
    margin: 0 8px;
    background: var(--app-theme-control-border);
}

.app-json-editor__filter-type {
    flex: 0 0 104px;
}

.app-json-editor__filter-input {
    flex: 1 1 auto;
}

.app-json-editor__filter-close {
    width: 24px;
    min-width: 24px;
    height: 24px;
    margin-left: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--app-theme-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease;
}

.app-json-editor__filter-close:hover {
    background: var(--app-theme-hover-background);
    color: var(--app-theme-text-primary);
}

.app-json-editor__filter-shell .el-select,
.app-json-editor__filter-shell .el-input {
    min-width: 0;
}

.app-json-editor__filter-bar .el-input__inner {
    height: 28px;
    line-height: 28px;
    padding-left: 10px;
    padding-right: 10px;
    border: none;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
}

.app-json-editor__filter-bar .el-input__icon,
.app-json-editor__filter-bar .el-select .el-input .el-select__caret {
    line-height: 28px;
}

.app-json-editor__filter-type .el-input__inner {
    padding-left: 10px;
    padding-right: 18px;
}

.app-json-editor .monaco-editor .current-line {
    background-color: var(--app-theme-tabs-bg);
}

.app-json-editor .monaco-editor .margin-view-overlays .current-line-margin,
.app-json-editor .monaco-editor .glyph-margin .current-line-margin {
    background-color: var(--app-theme-tabs-bg);
}

.app-json-editor .monaco-editor .line-numbers.active-line-number {
    color: inherit;
    font-weight: inherit;
}

.app-json-editor .monaco-editor .selected-text {
    background-color: rgba(24, 144, 255, 0.12) !important;
}

.app-json-editor .monaco-editor .focused .selected-text {
    background-color: rgba(24, 144, 255, 0.2) !important;
}

html.theme-dark .app-json-editor .monaco-editor .line-numbers.active-line-number {
    color: inherit;
}

html.theme-dark .app-json-editor .monaco-editor .selected-text {
    background-color: rgba(97, 97, 97, 0.2) !important;
}

html.theme-dark .app-json-editor .monaco-editor .focused .selected-text {
    background-color: rgba(128, 203, 196, 0.2) !important;
}

.monaco-editor .app-json-editor__diff-line--main {
    background-color: #ff9b9533;
}

.monaco-editor .app-json-editor__diff-line--secondary {
    background-color: #82ffa433;
}

.monaco-editor .app-json-editor__diff-inline--main {
    background-color: #ff818266;
}

.monaco-editor .app-json-editor__diff-inline--secondary {
    background-color: #2ddf5966;
}

.monaco-editor .app-json-editor__blank-hunk {
    height: 100%;
    width: 100%;
    background: rgba(128, 128, 128, 0.08);
    border-top: 1px solid rgba(128, 128, 128, 0.08);
    border-bottom: 1px solid rgba(128, 128, 128, 0.08);
}

.monaco-editor .app-json-editor__fold-summary-widget {
    color: var(--app-theme-text-secondary);
    opacity: 0.9;
    pointer-events: none;
    white-space: nowrap;
    margin-left: 18px;
    padding-right: 6px;
}
</style>
