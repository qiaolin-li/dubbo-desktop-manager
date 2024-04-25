import i18n from '@/renderer/common/i18n'
import {
    ipcRenderer
} from 'electron'

export default {
    topMenu: [
        {
            label: "数据源",
            icon: "el-icon-house",
            componentName: "registryList",
        },
    ],
    bottomMenu: [
        {
            label: "设置",
            icon: "el-icon-setting",
            ready(self) {
                ipcRenderer.on('openSettingsTabEvent', () =>  this.click(self));
            },
            click(self) {
                self.switchMenu({id: 'settings', componentName: 'settings'});
            },
        },
    ]
}