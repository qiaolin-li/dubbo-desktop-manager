


class ActionManager {

    
    #pluginMenuMap = new Map();

    /**
     *
     * @param {object} menuConfig = {
     *  id，唯一ID，可不填
     *  module，输入哪个模块的菜单，必填
     *  group，菜单放到哪个分组下，可不填
     *  relativeMenu，当前菜单相对于哪个菜单的位置，可不填
     *  anchor，放到哪个位置，可不填，取值为 first、last、before、after，存在 relativeMenu 时 first、last 才会生效
     *  test {function}，条件函数，可不填，如果存在，返回 true 才会显示这个菜单
     *  menuInfo，菜单信息（electron 原生菜单）
     * }
     */
    addPluginMenu(menuConfig) {
        if (!menuConfig || !menuConfig.module) {
            console.error("plugin menu config error, module is required");
            return;
        }
        this.#pluginMenuMap.computeIfAbsent(menuConfig.module, () => []).push(menuConfig);
    }

    fillPluginMenu(module, menuTemplate, ...args) {
        const pluginActionList = this.#pluginMenuMap.get(module) || [];
        if (!pluginActionList?.length) {
            return;
        }

        pluginActionList.forEach((item) => {
            const { group, relativeMenu, anchor, test } = item;

            if (test && !test(...args)) {
                return;
            }

            const menuInfo = {
                ...item.menuInfo,
                click: () => item.menuInfo.click && Reflect.apply(item.menuInfo.click, item.menuInfo, args),
            };

            let meuns = group ? (menuTemplate.find((m) => m.id === group) || {}).subMenus || [] : menuTemplate;

            if (["first", "last"].includes(anchor) || !relativeMenu) {
                if (anchor === "first") {
                    meuns.unshift(menuInfo);
                } else {
                    meuns.push(menuInfo);
                }
                return;
            }

            const index = meuns.findIndex((m) => m.id === relativeMenu);
            if (index > -1) {
                if (anchor === "before") {
                    meuns.splice(index, 0, menuInfo);
                } else {
                    meuns.splice(index + 1, 0, menuInfo);
                }
            } else {
                meuns.push(menuInfo);
            }
        });
    }

    
}


export default new ActionManager();
