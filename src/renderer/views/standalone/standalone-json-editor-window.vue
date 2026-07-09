<template>
    <div class="standalone-json-editor-window">
        <app-json-editor ref="editor" v-model="code" :lint="lint"
            :readonly="readonly" :allow-filter="allowFilter" :compare-code="compareCode" :compare-readonly="compareReadonly">
        </app-json-editor>
    </div>
</template>

<script>
import AppJsonEditor from "@/renderer/components/editor/json-editor.vue";

export default {
    name: "StandaloneJsonEditorWindow",
    components: {
        AppJsonEditor,
    },
    data() {
        return {
            code: "",
            compareCode: "",
            lint: false,
            readonly: false,
            allowFilter: true,
            compareReadonly: true,
            compareVisible: false,
            filterBarVisible: false,
            filterExpression: "",
            selectedFilterType: "js",
            secondaryViewMode: "compare",
        };
    },
    async mounted() {
        const windowKey = new URLSearchParams(location.search).get('windowKey');
        const payload = await appRuntime.getStandaloneJsonEditorPayload(windowKey);

        if (!payload) {
            return;
        }

        document.title = payload.title || "JSON Editor";
        this.code = payload.code || "";
        this.compareCode = payload.compareCode || "";
        this.lint = !!payload.lint;
        this.readonly = !!payload.readonly;
        this.allowFilter = payload.allowFilter !== false;
        this.compareReadonly = typeof payload.compareReadonly === "boolean" ? payload.compareReadonly : true;
        this.compareVisible = !!payload.compareVisible;
        this.filterBarVisible = !!payload.filterBarVisible;
        this.filterExpression = payload.filterExpression || "";
        this.selectedFilterType = payload.selectedFilterType || "js";
        this.secondaryViewMode = payload.secondaryViewMode === "filter" ? "filter" : "compare";

        this.$nextTick(() => {
            const editor = this.$refs.editor;
            if (!editor || typeof editor.focus !== "function") {
                return;
            }

            if (this.filterBarVisible) {
                editor.showFilterBar && editor.showFilterBar();
            } else if (editor.hideFilterBar) {
                editor.hideFilterBar();
            }

            editor.setFilterType && editor.setFilterType(this.selectedFilterType);
            editor.setFilterExpression && editor.setFilterExpression(this.filterExpression);
            editor.setSecondaryViewMode && editor.setSecondaryViewMode(this.secondaryViewMode);

            if (this.compareVisible) {
                editor.showCompare(this.compareCode);
            } else {
                editor.hideCompare && editor.hideCompare();
            }
            editor.focus && editor.focus();
        });
    },
};
</script>

<style>

html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: var(--app-theme-bg);
    color: var(--app-theme-text-primary);
}

.standalone-json-editor-window {
    width: 100%;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--app-theme-bg);
}

.standalone-json-editor-window > .app-json-editor {
    flex: 1 1 auto;
    min-height: 0;
}
</style>
