<template>
    <div class="plugin-item element-hover"  @click="$emit('selectPlugin', item)">
        <img class="plugin-item__logo" v-if="item.logoLoadSuccess" :src="item.logo" @error="() => item.logoLoadSuccess = false" />
        <img class="plugin-item__logo"  v-else src="../../../assets/icon.png"/>
        <div class="plugin-item__content" :class="{ disabled: !item.enabled }">
            <div class="plugin-item__content_info">
                <div class="plugin-item__name">{{ item.name }}</div>
                <div>
                    <slot></slot>
                    <span class="config-button ing" v-if="item.installStatus === 'installed' && !item.ing" > 已安装</span>
                    <span class="config-button ing" v-if="item.installStatus === 'update' && !item.ing" >更新</span>
                    <span class="config-button ing" v-if="item.installStatus === 'update' && item.ing" >更新中</span>
                    <span class="config-button ing" v-if="item.installStatus === 'uninstalled' && !item.ing" >安装</span>
                    <span class="config-button ing" v-if="item.installStatus === 'uninstalled' && item.ing" >安装中</span>
                    <!-- <span class="config-button ing" v-if="item.installStatus === 'disabled'" > 已禁用 </span> -->
                </div>
            </div>
            <div> 
                <span class="plugin-item__version">{{ item.version }}</span>
                <span>&nbsp;&nbsp;</span>
                <span class="plugin-item__author">{{ item.author }}</span>
            </div>    
        </div>
    </div>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
        }
    }
}
</script>

<style>

</style>