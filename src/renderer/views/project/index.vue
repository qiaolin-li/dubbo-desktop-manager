<template>
    <div class="project-page notSelect">
        <div class="project-toolbar-wrap" :class="{ 'project-toolbar-shadow': toolbarShadow }">
            <div class="project-toolbar">
                <el-button class="project-create-btn" type="primary" @click="openAddConnectDialog()">
                    <i class="el-icon-plus"></i>
                    <span>{{ $t('project.newProject') }}</span>
                </el-button>
            </div>
        </div>

        <div class="project-scroll-area" @scroll="handleScroll">
            <div class="project-shell">
                <div class="project-board">
                    <div v-if="projectList.length === 0" class="project-empty">
                        <div class="project-empty-icon">
                            <i class="el-icon-office-building"></i>
                        </div>
                        <div class="project-empty-title">{{ $t('project.emptyTitle') }}</div>
                        <div class="project-empty-desc">{{ $t('project.emptyDesc') }}</div>
                    </div>

                    <div v-else class="project-grid">
                        <div
                            v-for="projectInfo in projectList"
                            :key="projectInfo._id"
                            class="project-card"
                            @dblclick="openProject(projectInfo)"
                            @contextmenu.stop="openMenuList($event, projectInfo)">
                            <div class="project-card-top">
                                <div class="project-card-icon" :style="{ background: projectInfo.themeColor }">
                                    <i :class="projectInfo.cardIcon"></i>
                                </div>

                                <div class="project-card-meta">
                                    <el-tooltip effect="light" :content="projectInfo.name" placement="top">
                                        <div class="project-card-name">{{ projectInfo.name }}</div>
                                    </el-tooltip>
                                </div>
                            </div>

                            <div class="project-card-body">
                                <div class="project-card-line">
                                    <el-tooltip effect="light" :content="projectInfo.description || $t('project.cardDesc')" placement="top">
                                        <span class="project-card-label">{{ projectInfo.description || $t('project.cardDesc') }}</span>
                                    </el-tooltip>
                                </div>
                            </div>

                            <div class="project-card-footer">
                                <el-button type="primary" plain size="mini" @click.stop="openProject(projectInfo)">{{ $t('project.openProject') }}</el-button>
                                <el-tooltip effect="light" :content="$t('project.editProject')" placement="top">
                                    <button class="project-tool-btn" @click.stop="openAddConnectDialog(projectInfo._id)">
                                        <i class="el-icon-edit"></i>
                                    </button>
                                </el-tooltip>
                                <el-tooltip effect="light" :content="$t('project.deleteProject')" placement="top">
                                    <button class="project-tool-btn project-tool-btn-danger" @click.stop="deleteConnect(projectInfo._id)">
                                        <i class="el-icon-delete"></i>
                                    </button>
                                </el-tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import addConnect                 from "./addProject.vue";
import dataSourceRepository       from "@/renderer/api/DataSourceRepositoryClient.js";
import lodash                     from 'lodash';
import { appWindow }              from '@/renderer/core/AppRenderer.js';
import projectManager 			  from '@/renderer/core/project/index.js'
import dialogHelper               from '@/renderer/components/dialog/index.js'
import pluginProvider             from "@/renderer/api/plugin/PluginProvider.js";

let iconIndex = 0;
const iconList = lodash.shuffle(['el-icon-light-rain', 'el-icon-lightning', 'el-icon-heavy-rain', 'el-icon-sunrise',
                    'el-icon-sunrise-1', 'el-icon-sunset', 'el-icon-sunny', 'el-icon-cloudy', 'el-icon-partly-cloudy',
                    'el-icon-cloudy-and-sunny', 'el-icon-moon', 'el-icon-moon-night']);
const colorList = ['linear-gradient(135deg, #1f8fff 0%, #0d5bd4 100%)',
                    'linear-gradient(135deg, #19b37d 0%, #0b8f63 100%)',
                    'linear-gradient(135deg, #ff9f1c 0%, #ff6b35 100%)',
                    'linear-gradient(135deg, #6c63ff 0%, #3f37c9 100%)',
                    'linear-gradient(135deg, #ff5d8f 0%, #d6336c 100%)',
                    'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)'];

export default {
    props: {
        mainPanel: Object,
        switchCurrentMenu: Function
    },  
    data() {
        return {
            projectList: [],
            typeLabelMap: {},
            toolbarShadow: false,
        };
    },
    mounted() {
        this.initProjectTypeLabelMap();
        this.findProjectList();
    },
    methods: {
        resize() {},
        handleScroll(event) {
            this.toolbarShadow = event.target.scrollTop > 0;
        },
        initProjectTypeLabelMap() {
            const componentList = projectManager.getProjectUpdateComponentList();
            this.typeLabelMap = componentList.reduce((result, item) => {
                result[item.type] = item.label || item.type;
                return result;
            }, {});
        },
        async findProjectList() {
            let projectList = await dataSourceRepository.findList();
            projectList = projectList.sort((a, b) => {
                return (b.createTime || 0) - (a.createTime || 0);
            });
            this.projectList = projectList.map((projectInfo, index) => {
                return {
                    ...projectInfo,
                    typeLabel: this.typeLabelMap[projectInfo.type] || projectInfo.type,
                    cardIcon: iconList[index % iconList.length],
                    themeColor: colorList[index % colorList.length]
                }
            });
        },
        async openProject(projectInfo) {
            const projectPageComponent = await projectManager.getProjectPageComponent(projectInfo.type);

            if(!projectPageComponent){
                this.$message({
                    type: 'warning',
                    message: this.$t('project.notFoundProjectPage'),
                });
                pluginProvider.getRecommendPluginList("projectPage", projectInfo.type);
                return;
            }

            this.$openTab({
                id: projectInfo._id, 
                label: projectInfo.name,
                tooltip: projectInfo.description || projectInfo.name,
                icon: iconList[iconIndex % iconList.length],
                component: projectPageComponent,
                closable: true,
                params: {
                    dataSourceInfo: projectInfo
                }
            });
            iconIndex++;
        },
        // eslint-disable-next-line no-unused-vars
        saveConnectSuccess(data) {
            this.findProjectList();
        },
        openAddConnectDialog(id) {
            dialogHelper.openDialog({
                component: addConnect,
                title: id ? this.$t('project.editProject') : this.$t('project.newProject'),
                width: 80,  
                height: 90,
                params: {
                    id: id || "",
                    onSaveSuccess: this.saveConnectSuccess,
                }
            });
        },
        deleteConnect(id) {
            this.$confirm(this.$t('connect.confirmDeleteConnect'), this.$t('base.hintTitle'), {
                confirmButtonText: this.$t('base.confirm'),
                cancelButtonText: this.$t('base.cancel'),
                closeOnClickModal: false,
                type: "warning",
            }).then(async () => {
                await dataSourceRepository.deleteConnect(id);
                this.$message({
                    type: "success",
                    message: this.$t('base.deleteSuccess'),
                });
                this.findProjectList();
            });
        },
        openMenuList(event, projectInfo){
            const menuTemplate = [
                {
                    label: this.$t('project.openProject'),
                    click: async () => this.openProject(projectInfo)
                },
                { type: 'separator' },
                {
                    label: this.$t('project.editProject'),
                    click: async () => this.openAddConnectDialog(projectInfo._id)
                },
                {
                    label: this.$t('project.deleteProject'),
                    click: async () => this.deleteConnect(projectInfo._id)
                }
            ];
            event.preventDefault();

            appWindow.popupMenu({ template: menuTemplate });
        }
    }
}
</script>

<style>
.project-page {
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    background: var(--app-theme-surface);
    display: flex;
    flex-direction: column;
}

.project-toolbar-wrap {
    flex-shrink: 0;
    z-index: 2;
    padding: 18px 18px 14px;
    background: var(--app-theme-surface);
    transition: box-shadow 0.15s ease;
}

.project-toolbar-shadow {
    box-shadow: 0 8px 18px rgba(19, 28, 48, 0.08);
}

.project-toolbar {
    display: flex;
    justify-content: flex-end;
    max-width: 1320px;
    margin: 0 auto;
}

.project-create-btn {
    height: 36px;
    padding: 0 16px;
    border-radius: 6px;
}

.project-scroll-area {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-top: 10px;
}

.project-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 18px 18px;
    box-sizing: border-box;
}

.project-board {
    width: 100%;
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
}

.project-card {
    display: flex;
    flex-direction: column;
    height: 156px;
    padding: 16px;
    border-radius: 10px;
    background: var(--app-theme-surface-elevated);
    border: 1px solid var(--app-theme-border);
    box-shadow: 0 8px 18px rgba(19, 28, 48, 0.05);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.project-card:hover {
    transform: translateY(-2px);
    border-color: rgba(55, 125, 255, 0.24);
    box-shadow: 0 14px 28px rgba(19, 28, 48, 0.08);
}

.project-card-top {
    display: flex;
    align-items: center;
    gap: 12px;
}

.project-card-icon {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
    flex-shrink: 0;
}

.project-card-meta {
    min-width: 0;
    flex: 1;
}

.project-card-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--app-theme-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.project-tool-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.05);
    color: var(--app-theme-text-secondary);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.project-tool-btn:hover {
    background: rgba(55, 125, 255, 0.12);
    color: #377dff;
}

.project-tool-btn-danger:hover {
    background: rgba(230, 57, 70, 0.12);
    color: #e63946;
}

.project-card-body {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--app-theme-border);
    flex: 1;
}

.project-card-line {
    display: block;
    line-height: 1.7;
    height: 44px;
    overflow: hidden;
}

.project-card-label {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: var(--app-theme-text-secondary);
    font-size: 13px;
    overflow: hidden;
}

.project-card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
}

.project-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 320px;
    border-radius: 12px;
    border: 1px dashed var(--app-theme-border-strong);
    background: color-mix(in srgb, var(--app-theme-surface-elevated) 88%, transparent);
    text-align: center;
}

.project-empty-icon {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: #377dff;
    background: rgba(55, 125, 255, 0.1);
}

.project-empty-title {
    margin-top: 18px;
    font-size: 22px;
    font-weight: 700;
    color: var(--app-theme-text-primary);
}

.project-empty-desc {
    margin: 10px 0 22px;
    color: var(--app-theme-text-secondary);
}

@media (max-width: 1400px) {
    .project-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 1120px) {
    .project-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 860px) {
    .project-grid {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

</style>
