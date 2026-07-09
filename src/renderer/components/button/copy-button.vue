<template>
    <AppIconButton iconClass="el-icon-document-copy" :tooltip="$t('editor.copy')" @click="copy" :size="14"></AppIconButton>
</template>

<script>
import AppIconButton from '@/renderer/components/button/icon-button.vue'

export default {
    name: "AppCopyButton",
    components: {
        AppIconButton
    },
    props: {
        message: String,
    },
    methods: {
        copy() {
            navigator.clipboard.writeText(this.message);
            this.$message({
                type: "success",
                message: this.$t("editor.copySuccess"),
            });
        },
    },
};
</script>

<style>
</style>
