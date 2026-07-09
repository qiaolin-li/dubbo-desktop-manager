<template>
    <div class="settings-page notSelect">
        <div class="settings-page__layout">

            <!-- 左边配置菜单列表 -->
            <aside class="settings-sidebar">
                <div class="settings-sidebar__tree">
                    <template v-for="node in settingTree">
                        <!-- 分组标题节点：不可点击，仅作视觉分隔 -->
                        <div v-if="node.type === 'group'" :key="`group-${node.id}`" class="settings-sidebar__group">
                            <div class="settings-sidebar__group-label" :style="{ paddingLeft: `${10 + node.depth * 14}px` }">{{ node.label }}</div>
                        </div>

                        <!-- 页面节点：可点击，点击后切换右侧内容面板 -->
                        <button v-else :key="`item-${node.id}`" type="button" @click="handleSettingNodeClick(node)"
                            :class="['settings-sidebar__item', { 'is-active': node.id === activeSettingPageId }]" :style="{ paddingLeft: `${10 + node.depth * 14}px` }" >
                            <span class="settings-sidebar__item-label">{{ node.label }}</span>
                        </button>
                    </template>
                </div>
            </aside>

            <!-- 右边配置内容面板 -->
            <div class="settings-page__body">
                <div v-if="currentSettingPage" class="settings-panel">

                    <!-- 头部导航栏，显示当前配置所属的菜单层级路径（面包屑） -->
                    <div class="settings-panel__header">
                        <div class="settings-breadcrumb">
                            <template v-for="(item, index) in currentBreadcrumb" >
                                <span :key="`${item.id}-label`" :class="['settings-breadcrumb__item', { 'settings-breadcrumb__item--current': index === currentBreadcrumb.length - 1 }]">{{ item.label }}</span>
                                <!-- 分隔符，最后一项后面不显示 -->
                                <i v-if="index < currentBreadcrumb.length - 1" :key="`${item.id}-separator`" class="el-icon-arrow-right settings-breadcrumb__separator"></i>
                            </template>
                        </div>
                    </div>

                    <!-- 配置列表：所有页面预先渲染，用 v-show 切换显示，避免切换时丢失表单填写状态 -->
                    <div class="settings-panel__content">
                        <div class="settings-panel__pages">
                        <div v-for="page in pageEntries" v-show="page.id === activeSettingPageId" :key="page.id" class="settings-panel__page">
                            <div v-if="page.description" class="settings-panel__description">{{ page.description }}</div>

                            <!-- 模式一：schema 页，通过 JSON schema 自动生成表单字段 -->
                            <schema v-if="isSchemaPage(page)" :ref="`setting-page-${page.id}`" :schema="page.schema" :value="pageValueMap[page.id] || {}" />
                            
                            <!-- 模式二：自定义组件页，由插件或内置页面提供完整的 Vue 组件 -->
                            <component v-else-if="page.component" :ref="`setting-page-${page.id}`" :is="page.component" :value="pageValueMap[page.id] || {}" :page="page" />
                        </div>
                    </div>
                    </div>
                </div>

                <!-- 没有激活页面时显示占位文字 -->
                <div v-else class="settings-panel settings-panel--empty">
                    <div class="settings-panel__empty-text">{{ $t('menu.settings') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import i18n                         from '@/renderer/common/i18n';
import { appWindow, appConfig }     from '@/renderer/core/AppRenderer.js';

import { useThemeStore }            from '@/renderer/store/modules/theme.js';

import dialogHelper                 from '@/renderer/components/dialog/index.js'
import settingsManager              from '@/renderer/core/settings/index.js';

import schema                       from '@/renderer/views/settings/schema.vue';

/** 内置基础设置分组 ID */
const BUILTIN_BASE_GROUP_ID = 'base';
/** 内置插件设置分组 ID */
const BUILTIN_PLUGIN_GROUP_ID = 'plugins';
/** Mac 平台 UI 字体族 */
const MAC_UI_FONT_FAMILY = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
/** Windows 平台 UI 字体族 */
const WINDOWS_UI_FONT_FAMILY = "'Segoe UI', 'Microsoft YaHei', sans-serif";

export default {
    components: {
        schema,
    },
    data() {
        return {
            
            /** 
             * 当前激活的设置页面 ID，控制左侧高亮项和右侧显示内容 
             */
            activeSettingPageId: '',
            
            /** 
             * Pinia 主题 store，管理主题色与 UI 字体 
             */
            themeStore: useThemeStore(),
            
            /** 
             * i18n 全量语言包，用于构建语言选择下拉列表 
             */
            messages: {},
            
            /** 
             * 插件通过 settingsManager 注册进来的设置条目列表 
             **/
            settingEntryList: [],

            /**
             * 各页面当前值的映射表，结构为 { pageId: { fieldKey: value } }
             */
            pageValueMap: {},
        };
    },

    async created() {
        this.messages = i18n.messages;
        // 组件创建时立即从持久化存储加载已保存的配置
        await this.reloadConfig();
    },

    async mounted() {

        // 插件注册的settings
        this.settingEntryList = settingsManager.getSettingEntryList();
        
        await this.reloadPluginSchemaValues();

        // 确保始终有一个激活的页面（默认选中第一个）
        this.ensureActiveSettingPage();
    },

    computed: {
        /**
         * 语言下拉选项列表
         * 从 i18n 语言包中提取 name 和 code，生成 { label, value } 格式的选项数组
         * @returns {{ label: string, value: string }[]}
         */
        localeOptions() {
            return Object.values(this.messages || {}).map(message => ({
                label: message.name,
                value: message.code,
            }));
        },

        /**
         * UI 字体预设选项列表
         * 包含系统默认、Mac、Windows、自定义四种预设
         * system 预设会根据当前运行平台自动匹配字体族
         * @returns {{ label: string, value: string, fontFamily: string }[]}
         */
        uiFontFamilyOptions() {
            const systemFontFamily = window.constant.platform === 'win32' ? WINDOWS_UI_FONT_FAMILY : MAC_UI_FONT_FAMILY;
            return [
                {
                    label: this.$t('settings.baseSettings.uiFontPresetSystem'),
                    value: 'system',
                    fontFamily: systemFontFamily,
                },
                {
                    label: this.$t('settings.baseSettings.uiFontPresetMac'),
                    value: 'mac',
                    fontFamily: MAC_UI_FONT_FAMILY,
                },
                {
                    label: this.$t('settings.baseSettings.uiFontPresetWindows'),
                    value: 'windows',
                    fontFamily: WINDOWS_UI_FONT_FAMILY,
                },
                {
                    label: this.$t('settings.baseSettings.uiFontPresetCustom'),
                    value: 'custom',
                    fontFamily: '',
                }
            ];
        },

        /**
         * 内置设置条目列表（computed 而非 data，以便 $t() 国际化文本响应式更新）
         * 包含四个内置页面：通用、运行时、项目页面、高级
         * @returns {Array}
         */
        builtinSettingEntries() {
            return [
                {
                    id: BUILTIN_BASE_GROUP_ID,
                    label: this.$t('settings.baseSettings.title'),
                    type: 'group',
                    parentId: null,
                    order: 0,
                },
                {
                    id: 'base.general',
                    label: this.$t('settings.baseSettings.general'),
                    type: 'page',
                    parentId: BUILTIN_BASE_GROUP_ID,
                    order: 0,
                    source: 'schema',
                    schema: [
                        {
                            id: 'base-general',
                            fields: [
                                {
                                    key: 'systemLocale',
                                    type: 'select',
                                    label: this.$t('settings.baseSettings.language'),
                                    options: this.localeOptions,
                                },
                                {
                                    key: 'themeId',
                                    type: 'select',
                                    label: this.$t('settings.baseSettings.theme'),
                                    options: this.themeStore.themeOptions,
                                },
                                {
                                    key: 'uiFontFamilyPreset',
                                    type: 'select',
                                    label: this.$t('settings.baseSettings.uiFontFamily'),
                                    description: this.$t('settings.baseSettings.uiFontPresetDescription'),
                                    options: this.uiFontFamilyOptions,
                                },
                                {
                                    key: 'uiFontFamily',
                                    label: this.$t('settings.baseSettings.uiFontFamily'),
                                    description: this.$t('settings.baseSettings.uiFontFamilyDescription'),
                                    placeholder: this.$t('settings.baseSettings.uiFontFamilyPlaceholder'),
                                    // 仅当预设选择"自定义"时才显示此输入框
                                    visibleWhen: {
                                        uiFontFamilyPreset: 'custom',
                                    },
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'base.runtime',
                    label: this.$t('settings.baseSettings.runtime'),
                    type: 'page',
                    parentId: BUILTIN_BASE_GROUP_ID,
                    order: 10,
                    source: 'schema',
                    schema: [
                        {
                            id: 'base-runtime',
                            fields: [
                                {
                                    key: 'javaHome',
                                    type: 'folder',
                                    label: this.$t('settings.baseSettings.javaHome'),
                                    description: this.$t('settings.baseSettings.javaHomeDescription'),
                                    placeholder: this.$t('settings.baseSettings.javaHomePlaceholder'),
                                },
                                {
                                    key: 'jvmArgs',
                                    type: 'textarea',
                                    rows: 10,
                                    label: this.$t('settings.baseSettings.jvmArgs'),
                                    description: this.$t('settings.baseSettings.jvmArgsDescription'),
                                    placeholder: this.$t('settings.baseSettings.jvmArgsTips'),
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'base.advanced',
                    label: this.$t('settings.baseSettings.advanced'),
                    type: 'page',
                    parentId: BUILTIN_BASE_GROUP_ID,
                    order: 20,
                    source: 'schema',
                    schema: [
                        {
                            id: 'base-advanced',
                            fields: [
                                {
                                    key: 'developerModel',
                                    type: 'checkbox',
                                    label: this.$t('settings.baseSettings.developerMode'),
                                    checkboxLabel: this.$t('settings.baseSettings.developerModeLabel'),
                                }
                            ]
                        }
                    ]
                }
            ];
        },

        /**
         * 合并内置条目与插件条目的完整设置条目列表
         * 当存在插件条目时，会在内置条目后追加插件分组标题及其条目
         * @returns {Array}
         */
        allSettingEntries() {
            const pluginEntries = this.settingEntryList || [];
            if (pluginEntries.length === 0) {
                return this.builtinSettingEntries;
            }

            return [
                ...this.builtinSettingEntries,
                {
                    id: BUILTIN_PLUGIN_GROUP_ID,
                    label: this.$t('menu.plugins'),
                    type: 'group',
                    parentId: null,
                    order: 100,
                },
                ...pluginEntries,
            ];
        },

        /**
         * 仅包含 type === 'page' 的条目列表，用于渲染右侧面板
         * @returns {Array}
         */
        pageEntries() {
            return this.allSettingEntries.filter(entry => entry.type === 'page');
        },

        /**
         * 当前激活的页面对象，找不到时返回 null
         * @returns {Object|null}
         */
        currentSettingPage() {
            return this.pageEntries.find(entry => entry.id === this.activeSettingPageId) || null;
        },

        /**
         * 当前页面的面包屑路径数组
         * 从当前页面出发，沿 parentId 向上追溯至根节点，返回从根到当前的有序路径
         * @returns {Array}
         */
        currentBreadcrumb() {
            if (!this.currentSettingPage) {
                return [];
            }

            const path = [];
            const entryMap = this.getEntryMap();
            let current = this.currentSettingPage;

            while (current) {
                path.unshift(current); // 头部插入，保证顺序从根到叶
                current = current.parentId ? entryMap.get(current.parentId) : null;
            }

            return path;
        },

        /**
         * 扁平化的菜单树行数组（含 depth 字段），供左侧菜单 v-for 遍历
         * 通过 depth 值乘以固定像素数实现视觉缩进，无需递归模板
         * @returns {Array}
         */
        settingTree() {
            return this.buildTreeRows();
        }
    },

    methods: {
        /**
         * 返回对话框底部操作按钮的配置数组
         * - Apply：弹出确认框后保存所有配置
         * - Reload：丢弃未保存的修改，从持久化存储重新加载
         * - Cancel：关闭对话框，不做任何操作
         * @returns {Array}
         */
        dialogActions() {
            return [
                {
                    text: this.$t('settings.apply'),
                    type: 'primary',
                    click: async (done) => {
                        const confirmed = await this.confirmSaveConfig();
                        if (!confirmed) {
                            return false;
                        }
                        await this.saveConfig();
                        done({
                            saved: true,
                        });
                    }
                },
                {
                    text: this.$t('settings.reload'),
                    click: async () => {
                        await this.reloadConfig();
                        await this.reloadPluginSchemaValues();
                        this.resetCustomPages();
                    }
                },
                dialogHelper.getDefaultCancelButton(),
            ];
        },

        /**
         * 判断给定页面是否为 schema 页（通过 JSON schema 自动渲染表单）
         * @param {Object} page - 页面条目对象
         * @returns {boolean}
         */
        isSchemaPage(page) {
            return Array.isArray(page.schema) && page.schema.length > 0;
        },

        /**
         * 构建 id → entry 的 Map，用于 O(1) 查找任意条目（如面包屑向上追溯父级）
         * @returns {Map<string, Object>}
         */
        getEntryMap() {
            return this.allSettingEntries.reduce((map, entry) => {
                map.set(entry.id, entry);
                return map;
            }, new Map());
        },

        /**
         * 获取指定父节点的直接子节点列表，并按 order 升序、label 字母序排序
         * @param {string|null} parentId - 父节点 ID，null 表示根级节点
         * @returns {Array}
         */
        getChildren(parentId) {
            return this.allSettingEntries
                .filter(entry => (entry.parentId || null) === (parentId || null))
                .sort((a, b) => {
                    if ((a.order || 0) !== (b.order || 0)) {
                        return (a.order || 0) - (b.order || 0);
                    }
                    return (a.label || '').localeCompare(b.label || '');
                });
        },

        /**
         * 递归将树形结构拍平为带 depth 字段的线性数组
         * 使用平铺数组而非递归模板，是因为 Vue 2 的 v-for 不擅长递归渲染
         * 缩进通过 depth * 14px 的 paddingLeft 在模板中模拟
         * @param {string|null} parentId - 起始父节点 ID，默认从根开始
         * @param {number} depth - 当前层级深度，默认为 0
         * @param {Array} rows - 累积结果数组（递归传递）
         * @returns {Array}
         */
        buildTreeRows(parentId = null, depth = 0, rows = []) {
            const children = this.getChildren(parentId);

            children.forEach(child => {
                rows.push({
                    ...child,
                    depth,
                });

                // 分组节点需要递归展开其子节点；页面节点没有子节点，无需递归
                if (child.type === 'group') {
                    this.buildTreeRows(child.id, depth + 1, rows);
                }
            });

            return rows;
        },

        /**
         * 从指定节点出发，深度优先查找第一个 type === 'page' 的后代节点 ID
         * 用于点击分组标题时，自动跳转到该分组内第一个可显示的页面
         * @param {string} entryId - 起始节点 ID
         * @returns {string} 找到的页面 ID，未找到时返回空字符串
         */
        findFirstPageId(entryId) {
            const entry = this.getEntryMap().get(entryId);
            if (!entry) {
                return '';
            }

            if (entry.type === 'page') {
                return entry.id;
            }

            const children = this.getChildren(entry.id);
            for (let index = 0; index < children.length; index++) {
                const pageId = this.findFirstPageId(children[index].id);
                if (pageId) {
                    return pageId;
                }
            }

            return '';
        },

        /**
         * 左侧菜单节点点击处理器
         * 若点击的是分组节点，则自动跳转到该分组内第一个页面
         * 若点击的是页面节点，则直接激活该页面
         * @param {Object} node - 被点击的菜单节点（含 depth 字段的 entry 对象）
         */
        handleSettingNodeClick(node) {
            const nextPageId = this.findFirstPageId(node.id);
            if (nextPageId) {
                this.activeSettingPageId = nextPageId;
            }
        },

        /**
         * 确保始终有一个激活的页面
         * 若当前没有激活页面（初始化或条目变化后），则自动选中第一个页面
         */
        ensureActiveSettingPage() {
            if (this.currentSettingPage) {
                return;
            }

            this.activeSettingPageId = this.pageEntries[0] ? this.pageEntries[0].id : '';
        },

        /**
         * 通过动态 ref 名称获取指定页面的组件实例
         * 兼容 v-for 中 ref 生成数组的情况（取第一个元素）
         * @param {string} pageId - 页面 ID
         * @returns {Vue|undefined}
         */
        getPageRef(pageId) {
            const pageRef = this.$refs[`setting-page-${pageId}`];
            return Array.isArray(pageRef) ? pageRef[0] : pageRef;
        },

        /**
         * 弹出确认对话框，防止用户误操作覆盖配置
         * @returns {Promise<boolean>} 用户点击确认返回 true，取消返回 false
         */
        async confirmSaveConfig() {
            try {
                await this.$confirm(this.$t('settings.confirmApply'), this.$t('base.hintTitle'), {
                    confirmButtonText: this.$t('base.confirm'),
                    cancelButtonText: this.$t('base.cancel'),
                    closeOnClickModal: false,
                    type: 'warning',
                });
                return true;
            } catch (error) {
                return false;
            }
        },

        /**
         * 从持久化存储（appConfig）和主题 store 加载内置页面的配置值
         * 将结果写入 pageValueMap，驱动右侧表单的初始显示
         * @returns {Promise<void>}
         */
        async reloadConfig() {
            const uiFontFamily = this.themeStore.uiFontFamily;
            this.pageValueMap = {
                ...this.pageValueMap,
                'base.general': {
                    systemLocale: await appConfig.getProperty('systemLocale'),
                    themeId: this.themeStore.getThemeSelectionValue(),
                    uiFontFamilyPreset: this.resolveUIFontPreset(uiFontFamily),
                    uiFontFamily,
                },
                'base.runtime': {
                    javaHome: await appConfig.getProperty('javaHome'),
                    jvmArgs: await appConfig.getProperty('jvmArgs'),
                },
                'base.advanced': {
                    developerModel: await appConfig.getProperty('developer-mode') || false,
                }
            };
        },

        /**
         * 从持久化存储加载所有插件 schema 页面的配置值
         * 使用 Map 缓存同一 module 的配置，避免对同一插件发起多次 getProperty 请求
         * @returns {Promise<void>}
         */
        async reloadPluginSchemaValues() {
            const pageValueMap = {
                ...this.pageValueMap,
            };
            const pluginConfigCache = new Map();
            const schemaPages = this.pageEntries.filter(page => page.module && this.isSchemaPage(page));

            for (let index = 0; index < schemaPages.length; index++) {
                const page = schemaPages[index];
                if (!pluginConfigCache.has(page.module)) {
                    pluginConfigCache.set(page.module, await appConfig.getProperty(`pluginConfig.${page.module}`) || {});
                }

                pageValueMap[page.id] = {
                    ...(pluginConfigCache.get(page.module) || {}),
                };
            }

            this.pageValueMap = pageValueMap;
        },

        /**
         * 重置所有自定义页面组件的 UI 状态至当前 pageValueMap 中的值
         * 在"还原"操作后调用，确保各页面组件的表单显示与已加载数据保持一致
         * 使用 $nextTick 等待 DOM 更新完成后再操作组件实例
         */
        resetCustomPages() {
            this.$nextTick(() => {
                this.pageEntries.forEach(page => {
                    const pageRef = this.getPageRef(page.id);
                    if (!pageRef) {
                        return;
                    }

                    if (this.isSchemaPage(page) && typeof pageRef.resetSettings === 'function') {
                        pageRef.resetSettings(this.pageValueMap[page.id] || {});
                        return;
                    }

                    if (typeof pageRef.resetSettings === 'function') {
                        pageRef.resetSettings(this.pageValueMap[page.id] || {});
                    }
                });
            });
        },

        /**
         * 保存所有设置页面的配置到持久化存储
         * 执行顺序：
         *   1. 从各页面组件 ref 收集最新值
         *   2. 写入内置设置（语言、主题、字体、Java 路径、JVM 参数、项目页面映射）
         *   3. 检测开发者模式变更，变更时发送系统通知提示重启
         *   4. 按 module 分组收集插件页面配置，兼容三种接口（新/中/旧）
         *   5. 批量写入插件配置，重新加载 UI，显示成功提示
         * @returns {Promise<void>}
         */
        async saveConfig() {
            const baseGeneralPage    = this.getPageRef('base.general');
            const baseRuntimePage    = this.getPageRef('base.runtime');
            const baseAdvancedPage   = this.getPageRef('base.advanced');

            const baseGeneralValue   = baseGeneralPage  && typeof baseGeneralPage.getSettingsValue  === 'function' ? baseGeneralPage.getSettingsValue()  : {};
            const baseRuntimeValue   = baseRuntimePage  && typeof baseRuntimePage.getSettingsValue  === 'function' ? baseRuntimePage.getSettingsValue()  : {};
            const baseAdvancedValue  = baseAdvancedPage && typeof baseAdvancedPage.getSettingsValue === 'function' ? baseAdvancedPage.getSettingsValue() : {};

            // 应用语言设置（立即生效，无需重启）
            i18n.locale = baseGeneralValue.systemLocale;
            await appConfig.setProperty('systemLocale', baseGeneralValue.systemLocale);

            // 应用主题与字体设置
            await this.themeStore.setTheme({
                ...this.themeStore.resolveThemeSelection(baseGeneralValue.themeId),
                uiFontFamily: this.resolveUIFontFamily(baseGeneralValue.uiFontFamilyPreset, baseGeneralValue.uiFontFamily),
            });

            // 保存运行时配置
            await appConfig.setProperty('javaHome', baseRuntimeValue.javaHome);
            await appConfig.setProperty('jvmArgs', baseRuntimeValue.jvmArgs);

            // 检测开发者模式是否发生变化，变更时发送系统通知提示用户重启应用
            const previousDeveloperModel = await appConfig.getProperty('developer-mode') || false;
            const nextDeveloperModel = baseAdvancedValue.developerModel || false;
            if (previousDeveloperModel !== nextDeveloperModel) {
                await appConfig.setProperty('developer-mode', nextDeveloperModel);
                const successNotification = new window.Notification(this.$t('settings.restartNoticeTitle'), { body: this.$t('settings.restartNoticeBody') });
                successNotification.onclick = () => {
                    appWindow.restart();
                };
            }

            // 收集插件页面配置，按 module 分组，避免多个页面属于同一插件时互相覆盖
            const pluginConfigMap = new Map();
            const pluginPages = this.pageEntries.filter(page => page.module);

            for (let index = 0; index < pluginPages.length; index++) {
                const page = pluginPages[index];

                // 先加载该 module 现有的持久化配置作为基础，再合并新值
                if (!pluginConfigMap.has(page.module)) {
                    pluginConfigMap.set(page.module, await appConfig.getProperty(`pluginConfig.${page.module}`) || {});
                }

                const pageRef = this.getPageRef(page.id);
                if (!pageRef) {
                    continue;
                }

                // schema 页通过 getSettingsValue() 返回字段值对象
                if (this.isSchemaPage(page)) {
                    pluginConfigMap.set(page.module, {
                        ...(pluginConfigMap.get(page.module) || {}),
                        ...pageRef.getSettingsValue(),
                    });
                    continue;
                }


                // 自定义组件通过 getPluginSettings() 直接返回完整配置对象
                if (typeof pageRef.getPluginSettings === 'function') {
                    const partialValue = await pageRef.getPluginSettings();
                    pluginConfigMap.set(page.module, {
                        ...(pluginConfigMap.get(page.module) || {}),
                        ...(partialValue || {}),
                    });
                }
            }

            // 批量写入所有插件配置
            for (const [module, value] of pluginConfigMap.entries()) {
                await appConfig.setProperty(`pluginConfig.${module}`, value);
            }

            // 重新加载配置到 UI，确保显示值与持久化存储一致
            await this.reloadConfig();
            await this.reloadPluginSchemaValues();

            this.$message({
                type: 'success',
                message: this.$t('base.saveSuccess'),
            });
        },

        /**
         * 将 CSS font-family 字符串反推为预设枚举值
         * 先对字体字符串做规范化处理，再与预设选项逐一比对
         * 无法匹配任何预设时返回 'custom'
         * @param {string} fontFamily - 当前的 CSS font-family 字符串
         * @returns {'system'|'mac'|'windows'|'custom'}
         */
        resolveUIFontPreset(fontFamily) {
            const normalizedFontFamily = this.themeStore.normalizeUIFontFamily(fontFamily);
            const presetEntry = this.uiFontFamilyOptions.find(option => option.value !== 'custom' && option.fontFamily === normalizedFontFamily);
            return presetEntry ? presetEntry.value : 'custom';
        },

        /**
         * 将预设枚举值转换为实际的 CSS font-family 字符串
         * 若预设有对应的 fontFamily，则直接使用；
         * 否则（custom 预设）对用户输入的自定义字体字符串做规范化处理后返回
         * @param {'system'|'mac'|'windows'|'custom'} preset - 字体预设枚举值
         * @param {string} customFontFamily - 用户在自定义输入框中填写的字体字符串
         * @returns {string} 规范化后的 CSS font-family 字符串
         */
        resolveUIFontFamily(preset, customFontFamily) {
            const presetOption = this.uiFontFamilyOptions.find(option => option.value === preset);
            if (presetOption && presetOption.fontFamily) {
                return presetOption.fontFamily;
            }

            return this.themeStore.normalizeUIFontFamily(customFontFamily);
        }
    }
};
</script>

<style>
.settings-page {
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    color: var(--app-theme-text-primary);
    background-color: var(--app-theme-panel-muted);
}

.settings-page__layout {
    flex: 1;
    min-height: 0;
    display: flex;
}

.settings-sidebar {
    width: 250px;
    min-width: 250px;
    padding: 16px 10px;
    border-right: 1px solid var(--app-theme-border);
    background-color: var(--app-theme-sidebar-bg);
}

.settings-sidebar__tree {
    height: 100%;
    overflow-y: auto;
}

.settings-sidebar__group-label {
    padding-top: 8px;
    padding-bottom: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--app-theme-text-tertiary);
    text-transform: uppercase;
}

.settings-sidebar__item {
    width: 100%;
    padding-top: 6px;
    padding-right: 10px;
    padding-bottom: 6px;
    border: none;
    border-radius: 4px;
    color: var(--app-theme-text-secondary);
    cursor: pointer;
    text-align: left;
    background-color: transparent;
    transition: background-color 0.2s ease, color 0.2s ease;
    font-size: 13px;
    line-height: 20px;
}

.settings-sidebar__item:hover {
    background-color: var(--app-theme-hover-background);
}

.settings-sidebar__item.is-active {
    color: var(--app-theme-text-primary);
    font-weight: 600;
    background-color: var(--app-theme-active-background);
}

.settings-sidebar__item-label {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.settings-page__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 0 24px;
    background-color: var(--app-theme-surface);
}

.settings-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    margin: 0;
    padding: 8px 0 0;
    background-color: transparent;
}

.settings-panel--empty {
    display: flex;
    align-items: center;
    justify-content: center;
}

.settings-panel__empty-text {
    font-size: 14px;
    color: var(--app-theme-text-tertiary);
}

.settings-panel__header {
    flex: 0 0 auto;
    padding: 8px 0 12px;
    border-bottom: 1px solid var(--app-theme-border);
    background-color: var(--app-theme-surface);
}

.settings-panel__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 18px 0 28px;
}

.settings-breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 12px;
    line-height: 18px;
    color: var(--app-theme-text-tertiary);
}

.settings-breadcrumb__item--current {
    color: var(--app-theme-text-secondary);
}

.settings-breadcrumb__separator {
    margin: 0 6px;
    font-size: 11px;
}

.settings-panel__description {
    margin-bottom: 14px;
    font-size: 12px;
    line-height: 18px;
    color: var(--app-theme-text-tertiary);
}

.settings-panel__page {
    max-width: 760px;
}

.settings-panel__page .el-form-item {
    margin-bottom: 18px;
}

.settings-panel__page .el-form-item__label {
    padding-bottom: 6px;
    color: var(--app-theme-text-secondary);
}

.settings-panel__page .el-input__inner,
.settings-panel__page .el-select .el-input__inner {
    border-radius: 4px;
}

.settings-panel__page .el-checkbox__label {
    color: var(--app-theme-text-primary);
}

.settings-panel__page .settings-schema-control {
    width: 100%;
}

.settings-schema-section + .settings-schema-section {
    margin-top: 28px;
}

.settings-schema-section__title {
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 600;
    color: var(--app-theme-text-primary);
}

.settings-schema-section__description,
.settings-schema-field__description {
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 18px;
    color: var(--app-theme-text-tertiary);
}

@media (max-width: 960px) {
    .settings-page__layout {
        flex-direction: column;
    }

    .settings-sidebar {
        width: auto;
        min-width: 0;
        padding: 12px;
        border-right: none;
        border-bottom: 1px solid var(--app-theme-border);
    }

    .settings-sidebar__tree {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        flex-wrap: nowrap;
        align-items: center;
        gap: 8px;
    }

    .settings-sidebar__group {
        display: none;
    }

    .settings-sidebar__item {
        width: auto;
        min-width: max-content;
        padding-left: 10px !important;
    }

    .settings-page__body {
        padding: 0 14px;
    }

    .settings-panel__content {
        padding: 14px 0 18px;
    }
}
</style>
