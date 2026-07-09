<template>
    <div class="plugin-item element-hover"  @click="$emit('selectPlugin', plugin)">
        <img class="plugin-item__logo" v-if="plugin.logoLoadSuccess" :src="plugin.logo" @error="() => plugin.logoLoadSuccess = false" />
        <img class="plugin-item__logo"  v-else src="../../../assets/icon.png"/>
        <div class="plugin-item__content" :class="{ disabled: plugin.enabled === false }">
            <div class="plugin-item__content-info">
                <div class="plugin-item__name">{{ plugin.pluginNickName }}</div>
                <div>
                    <slot></slot>
                    <template v-if="showDefaultStatus">
                        <span class="plugin-item__status" v-if="plugin.installStatus === 'installed' && !plugin.ing"><i class="el-icon-success plugin-item__meta-icon"></i>{{ $t('plugin.installed') }}</span>
                        <span class="plugin-item__status" v-if="plugin.installStatus === 'update' && !plugin.ing"><i class="el-icon-refresh plugin-item__meta-icon"></i>{{ $t('plugin.updateAvailable') }}</span>
                        <span class="plugin-item__status" v-if="plugin.installStatus === 'update' && plugin.ing"><i class="el-icon-loading plugin-item__meta-icon"></i>{{ $t('plugin.updating') }}</span>
                        <span class="plugin-item__status" v-if="plugin.installStatus === 'uninstalled' && !plugin.ing"><i class="el-icon-download plugin-item__meta-icon"></i>{{ $t('plugin.install') }}</span>
                        <span class="plugin-item__status" v-if="plugin.installStatus === 'uninstalled' && plugin.ing"><i class="el-icon-loading plugin-item__meta-icon"></i>{{ $t('plugin.installing') }}</span>
                    </template>
                </div>
            </div>
            <div> 
                <span class="plugin-item__version">
                    <i class="el-icon-price-tag plugin-item__meta-icon"></i>{{ plugin.version }}
                </span>
                <template v-if="showDownloads">
                    <span>&nbsp;&nbsp;</span>
                    <span class="plugin-item__downloads">
                        <i class="el-icon-download plugin-item__meta-icon"></i>{{ plugin.downloads || 0 }}
                    </span>
                </template>
                <span>&nbsp;&nbsp;</span>
                <span class="plugin-item__author">
                    <i class="el-icon-user plugin-item__meta-icon"></i>{{ plugin.author }}
                </span>
            </div>    
        </div>
    </div>
</template>

<script>
export default {
    props: {
        plugin: {
            type: Object,
            required: true
        },
        showDownloads: {
            type: Boolean,
            default: true
        },
        showDefaultStatus: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
        }
    }
}
</script>

<style>

.plugin-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px 4px;
    height: 60px;
    cursor: pointer;
    transition: background-color .15s ease;
    color: var(--app-theme-text-primary);
    background: var(--app-theme-surface);
}

.plugin-item:not(:first-child) {
    border-top: 1px solid var(--app-theme-border);
}

.plugin-item:hover {
    background: var(--app-theme-hover-background);
}

.plugin-item__logo {
    width: 55px;
    height: 55px;
    padding: 0px 5px;
    object-fit: cover;
    flex-shrink: 0;
}

.plugin-item__content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.plugin-item__content.disabled {
    opacity: .65;
}

.plugin-item__content-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}

.plugin-item__name {
    font-size: 16px;
    font-weight: 700;
    height: 22px;
    line-height: 22px;
    color: var(--app-theme-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    transition: all .2s ease-in-out;
}

.plugin-item__version,
.plugin-item__author,
.plugin-item__downloads {
    font-size: 12px;
    color: var(--app-theme-text-secondary);
}

.plugin-item__downloads {
    display: inline-block;
    width: 40px;
}

.plugin-item__meta-icon {
    margin-right: 4px;
    font-size: 12px;
}

.plugin-item__status {
    display: inline-flex;
    align-items: center;
    height: 18px;
    padding: 0 6px;
    border-radius: 3px;
    background: var(--app-theme-surface-elevated);
    color: var(--app-theme-text-primary);
    font-size: 12px;
    line-height: 18px;
    font-weight: 500;
}


</style>
