/**
 * 让 TypeScript 插件模板可以直接 import Vue 单文件组件。
 */
declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
