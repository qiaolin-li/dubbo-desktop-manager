<template>
    <div class="project-page-placeholder">
        <div class="project-page-placeholder__body">
            <i class="el-icon-warning-outline project-page-placeholder__icon"></i>
            <div class="project-page-placeholder__title">{{ $t('project.projectPageMissing') }}</div>
            <div class="project-page-placeholder__desc">{{ dataSourceInfo && dataSourceInfo.type }}</div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        dataSourceInfo: Object,
    },
};
</script>

<style>
.project-page-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--app-theme-text-secondary);
    background: var(--app-theme-surface);
}

.project-page-placeholder__body {
    text-align: center;
}

.project-page-placeholder__icon {
    font-size: 28px;
    color: var(--app-theme-text-tertiary);
}

.project-page-placeholder__title {
    margin-top: 12px;
    font-size: 14px;
    color: var(--app-theme-text-primary);
}

.project-page-placeholder__desc {
    margin-top: 6px;
    font-size: 12px;
}
</style>
