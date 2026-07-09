<template>
    <div class="settings-schema-page">
        <!-- 遍历规范化后的 schema，每个 section 对应一个设置分组 -->
        <div v-for="section in normalizedSchema" :key="section.id" class="settings-schema-section">

            <!-- 分组标题（可选） -->
            <div v-if="section.title" class="settings-schema-section__title">{{ section.title }}</div>
            <!-- 分组描述（可选） -->
            <div v-if="section.description" class="settings-schema-section__description">{{ section.description }}</div>

            <!-- 使用 label-position="top" 使标签显示在控件上方 -->
            <el-form label-position="top" class="settings-schema-form">
                <el-form-item v-for="field in section.fields" v-show="isFieldVisible(field)" :key="field.key" :label="field.label" class="settings-schema-form__item">
                    <!-- 下拉选择框 -->
                    <el-select v-if="field.type === 'select'" v-model="localValue[field.key]" class="settings-schema-control">
                        <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value"></el-option>
                    </el-select>

                    <!-- 目录选择输入框：右侧附带文件夹选择按钮，点击后唤起系统目录选择对话框 -->
                    <el-input v-else-if="field.type === 'folder'" v-model="localValue[field.key]" :placeholder="field.placeholder" class="settings-schema-control">
                        <el-button slot="append" icon="el-icon-search" @click="selectDirectory(field)"></el-button>
                    </el-input>

                    <!-- 多行文本域 -->
                    <el-input v-else-if="field.type === 'textarea'" v-model="localValue[field.key]" :type="field.type" :rows="field.rows || 4" :placeholder="field.placeholder" class="settings-schema-control"></el-input>

                    <!-- 数字输入框，支持 min / max / step 限制 -->
                    <el-input-number v-else-if="field.type === 'number'" v-model="localValue[field.key]" :min="field.min" :max="field.max" :step="field.step || 1" controls-position="right"></el-input-number>

                    <!-- 开关控件（boolean 值） -->
                    <el-switch v-else-if="field.type === 'switch'" v-model="localValue[field.key]"></el-switch>

                    <!-- 复选框控件（boolean 值），优先使用 checkboxLabel 作为勾选文本 -->
                    <el-checkbox v-else-if="field.type === 'checkbox'" v-model="localValue[field.key]">{{ field.checkboxLabel || field.label }}</el-checkbox>

                    <!-- 兜底：普通单行输入框，password 类型时自动隐藏内容 -->
                    <el-input v-else v-model="localValue[field.key]" :type="field.type === 'password' ? 'password' : 'text'" :placeholder="field.placeholder" class="settings-schema-control"></el-input>

                    <!-- 字段级描述文字，显示在控件下方 -->
                    <div v-if="field.description" class="settings-schema-field__description">{{ field.description }}</div>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { appDialog } from '@/renderer/core/AppRenderer.js';

/**
 * 深拷贝一个对象，用于隔离外部 value 与内部 localValue，防止直接 mutation prop
 * 使用 JSON 序列化实现，适用于纯数据对象（不含函数、Date、undefined 等特殊类型）
 * @param {Object} value - 待拷贝的对象
 * @returns {Object}
 */
const cloneValue = value => JSON.parse(JSON.stringify(value || {}));

export default {
    props: {
        /**
         * 表单 schema 定义数组，每个元素描述一个设置分组（section）
         * section 结构：{ id, title?, description?, fields: Field[] }
         * Field 结构：{ key, type, label, options?, placeholder?, rows?, min?, max?, step?,
         *               checkboxLabel?, description?, visibleWhen? }
         */
        schema: {
            type: Array,
            default: () => [],
        },
        /**
         * 外部传入的初始值对象，结构为 { [fieldKey]: value }
         * 组件内部不直接修改此 prop，而是克隆为 localValue 后使用
         */
        value: {
            type: Object,
            default: () => ({}),
        }
    },

    data() {
        return {
            /**
             * 内部独立维护的表单值副本
             * 通过深拷贝与外部 value 隔离，避免直接 mutation prop
             * 用户在表单中的所有修改都写入此对象，最终通过 getSettingsValue() 向外暴露
             */
            localValue: cloneValue(this.value),
        };
    },

    computed: {
        /**
         * 对原始 schema 做规范化处理，补全缺省字段，保证模板遍历时不会出现 undefined
         * - id：缺失时用 section 下标生成兜底 ID
         * - title / description：缺失时置为空字符串，避免 v-if 多余判断
         * - fields：缺失时置为空数组，避免 v-for 报错
         * @returns {Array<{ id: string, title: string, description: string, fields: Array }>}
         */
        normalizedSchema() {
            return (this.schema || []).map((section, index) => ({
                id: section.id || `section-${index}`,
                title: section.title || '',
                description: section.description || '',
                fields: section.fields || [],
            }));
        }
    },

    watch: {
        /**
         * 监听外部 value prop 的深层变化
         * 当父组件执行"还原"操作重新赋值时，同步更新内部 localValue
         * 使用深拷贝确保内外数据完全隔离，防止引用共享导致意外联动
         */
        value: {
            deep: true,
            handler(value) {
                this.localValue = cloneValue(value);
            }
        }
    },

    methods: {
        /**
         * 唤起系统原生目录选择对话框（仅适用于 type === 'folder' 的字段）
         * 若用户已有填写值，则以该值作为对话框的初始路径
         * 选择确认后通过 $set 响应式地更新 localValue，保证 Vue 能够检测到新增属性的变化
         * @param {Object} field - 当前字段的 schema 定义对象
         * @returns {Promise<void>}
         */
        async selectDirectory(field) {
            const result = await appDialog.showOpenDialog({
                defaultPath: this.localValue[field.key] || '',
                properties: ['openDirectory']
            });
            if (!result.canceled) {
                // 使用 $set 而非直接赋值，确保 Vue 2 能追踪到对象属性的新增/变化
                this.$set(this.localValue, field.key, result.filePaths[0]);
            }
        },

        /**
         * 判断某个字段是否应当显示
         * 支持两种 visibleWhen 声明方式：
         *   1. 函数形式：visibleWhen(currentValue) => boolean，适合复杂的联动逻辑
         *   2. 对象形式：{ fieldKey: expectedValue, ... }，所有条件均满足时显示（AND 逻辑）
         * 未声明 visibleWhen 时默认始终显示
         * @param {Object} field - 字段 schema 定义对象
         * @returns {boolean}
         */
        isFieldVisible(field) {
            // 函数形式：将当前所有值传入，由外部逻辑决定
            if (typeof field.visibleWhen === 'function') {
                return field.visibleWhen(this.localValue);
            }

            // 无条件或非对象：默认显示
            if (!field.visibleWhen || typeof field.visibleWhen !== 'object') {
                return true;
            }

            // 对象形式：所有键值对均匹配时才显示（AND 逻辑）
            return Object.keys(field.visibleWhen).every(key => this.localValue[key] === field.visibleWhen[key]);
        },

        /**
         * 获取当前表单的所有字段值（深拷贝）
         * 供父组件在保存时调用（通过 $refs 访问此方法）
         * 返回副本而非引用，防止外部修改影响组件内部状态
         * @returns {Object} 当前表单值的深拷贝对象
         */
        getSettingsValue() {
            return cloneValue(this.localValue);
        },

        /**
         * 以编程方式覆写当前表单的所有字段值
         * 供父组件在需要主动注入数据时调用（通过 $refs 访问此方法）
         * 使用深拷贝隔离外部数据，防止引用共享
         * @param {Object} value - 要写入的新值对象
         */
        setSettingsValue(value) {
            this.localValue = cloneValue(value);
        },

        /**
         * 将表单重置为指定值，语义上等同于 setSettingsValue
         * 作为约定接口单独暴露，供父组件统一通过 resetSettings(value) 调用各页面的还原逻辑
         * @param {Object} value - 要还原到的目标值对象
         */
        resetSettings(value) {
            this.setSettingsValue(value);
        }
    }
};
</script>

<style>
.settings-schema-page {
    color: var(--app-theme-text-primary);
}

.settings-schema-section + .settings-schema-section {
    margin-top: 24px;
}

.settings-schema-section__title {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--app-theme-text-primary);
}

.settings-schema-section__description,
.settings-schema-field__description {
    color: var(--app-theme-text-tertiary);
}

.settings-schema-section__description {
    margin-bottom: 16px;
}

.settings-schema-field__description {
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 18px;
}

.settings-schema-form__item {
    margin-bottom: 18px;
}

.settings-schema-control {
    width: 100%;
}
</style>
