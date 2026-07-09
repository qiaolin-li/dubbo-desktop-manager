

class SettingsManager {

    /**
     * 所有插件注册的设置组件
     */
    // #pluginSettingComponent = [];
	// getPluginSettingComponentList = () => this.#pluginSettingComponent;

    /**
     * 插件入口信息，展示在设置的左边树结构下
     */
	#settingEntryList = [];
	getSettingEntryList = () => this.#settingEntryList.slice();


    /**
     * 增加插件的设置页
     * @param {*} label 
     * @param {*} component 
     * @param {*} pluginName 
     * @param {*} options 
     */
    addPluginSettingPage(label, component, pluginName, options = {}) {
        const groupId = `plugin-settings-group-${pluginName}`;

        // 插件的分组不存在，给他加一个
        if(!this.#settingEntryList.find(s => s.id === groupId)) {
            this.#addSettingEntry({
                id: groupId,
                parentId: "plugins",
                label: pluginName,
                type: "group",
                module: pluginName ,
            });
        }

        // 增加配置页面入口
        this.#addSettingEntry({
            id: `plugin-settings-settings-${pluginName}-${this.#settingEntryList.length + 1}`,
            parentId: groupId,
            label: label,
            component: component,
            description: options.description || "",
            type: "page",
            module: pluginName,
        });
    }

    /**
     * 增加注册页入口
     * @param {*} settingEntry 
     * @returns 
     */
    #addSettingEntry(settingEntry) {
        const currentIndex = this.#settingEntryList.findIndex((item) => item.id === settingEntry.id);
        if (currentIndex > -1) {
            this.#settingEntryList.splice(currentIndex, 1, settingEntry);
            return;
        }

        this.#settingEntryList.push(settingEntry);
    }

}

export default new SettingsManager();