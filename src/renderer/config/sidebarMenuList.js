import i18n from '@/renderer/common/i18n'
import { ipcRenderer } from 'electron'

export default [{
        label: "调用",
        icon: "el-icon-aim",
        componentName: "registryList",
    },
    {
        label: "历史",
        icon: "el-icon-tickets",
        componentName: "historyList",
    },
    {
        label: "设置",
        icon: "el-icon-setting",
        ready(self){
            ipcRenderer.on('openSettingsTabEvent', (event) => {
                this.click(self);
            });
        },
        click(self) {
            self.addTab({
                title: i18n.t('menu.settings'),
                componentName: 'settings',
            });
        },
    },
]