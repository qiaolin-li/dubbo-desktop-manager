import i18n from '@/renderer/common/i18n'
import { ipcRenderer } from 'electron'

export default {
    topMenu: [
        {
            label: i18n.t("menu.datasource"),
            icon: "el-icon-house",
            component: "registryList",
            ready(mananger, self) {
                mananger.switchMenu(self);
                ipcRenderer.on('openSettingsTabEvent', () => mananger.switchMenu(self));
            }
        },
    ],
    bottomMenu: [
        {
            label: i18n.t("menu.plugins"),
            icon: "el-icon-goods",
            component: "plugins",
        },
        {
            label: i18n.t("menu.settings"),
            icon: "el-icon-setting",
            component: "settings",
            ready(mananger, self) {
                ipcRenderer.on('openSettingsTabEvent', () => mananger.switchMenu(self));
            }
        },
    ]
}