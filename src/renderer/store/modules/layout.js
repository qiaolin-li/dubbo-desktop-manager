import { defineStore } from 'pinia';

const HOME_TAB = {id: 'HOME'};

export const useLayoutStore = defineStore('layout', {
    state: () => ({
        // 顶部 TabBar 展示的页签
        tabList: [],

        // toolbar 上的菜单列表
        toolbarMenuList: [],

        // 当前正在主舞台展示的页面
        currentPage: {},

        // 主舞台已经打开的页面
        pageList: [],

        // 底部状态栏的项目
        statusbarItems: [],

        // 底部工作台是否显示
        workbenchVisible: false,
    }),

    getters: {
        currentPageId: state => state.currentPage.id,
    },

    actions: {

        /**
         * 注册一个toolbar菜单，显示在标题栏右边
         * @param {*} menu 
         */
        addToolbarMenu(menu) {
            menu.id = menu.id || `menu-${Math.random()}`;
            this.toolbarMenuList.push(menu);
        },


        /**
         * 打开一个页面，并在需要时加入主舞台页面列表。
         * @param {object} page 要打开的页面配置
         * @returns {boolean} 页面是否发生切换
         */
        openPage(page) {

            const currentPage = this.currentPage;

            if (page.id && currentPage.id === page.id) {
                return false;
            }

            let pageList = this.pageList;

            if (page.component || page.src) {
                if (!pageList.find(x => x.id === page.id)) {
                    pageList = [...pageList, page];
                }
            }

            // 如果当前页面不允许缓存，并且不在顶部页签列表中，说明它是一个临时页面，应该被释放
            if (currentPage.cache === false && !this.tabList.find(m => m.id === currentPage.id)) {
                pageList = pageList.filter(info => currentPage.id !== info.id);
            }

            this.setPageList(pageList);
            this.setCurrentPage(page);
            return true;
        },

        /**
         * 强制刷新页面对应的组件。
         * @param {object} menu 要刷新的页面配置
         */
        forceUpdateComponent(menu) {
            menu.id += 100000;
            this.setCurrentPage(menu);
        },

        /**
         * 设置主舞台页面列表。
         * @param {Array<object>} pageList 主舞台页面列表
         */
        setPageList(pageList) {
            this.pageList = pageList || [];
        },

        /**
         * 设置当前正在主舞台展示的页面。
         * @param {object} currentPage 当前页面
         */
        setCurrentPage(currentPage) {
            this.currentPage = currentPage || {};
        },

        /**
         * 设置顶部页签列表。
         * @param {Array<object>} tabList 顶部页签列表
         */
        setTabList(tabList) {
            this.tabList = tabList || [];
        },

        /**
         * 添加一个顶部页签。
         * @param {object} tab 要添加的页签
         * @returns {object|undefined} 已存在的页签
         */
        addTab(tab) {
            const exist = this.tabList.find(m => m.id === tab.id);
            if (!exist) {
                this.setTabList([...this.tabList, tab]);
            }

            return exist;
        },

        /**
         * 关闭一个顶部页签，并在需要时切换当前页面。
         * @param {string} id 要关闭的页签 id
         */
        closeTab(id) {
            const oldTabList = this.tabList;

            const currentIndex = oldTabList.findIndex(menu => menu.id === id);
            if (currentIndex < 0) {
                return;
            }

            const tabList = oldTabList.filter(menu => menu.id !== id);

            this.setTabList(tabList);

            // 关闭的不是当前正在展示的页面，无所谓
            if (this.currentPage.id !== id) {
                return;
            }

            // 延续策略：优先后一个、其次前一个、如果都没有就显示主页
            const nextMenu = tabList[currentIndex] || tabList[currentIndex - 1] || HOME_TAB;
            if (nextMenu) {
                this.setCurrentPage(nextMenu);
            }

            // 剔除已经打开的容器
            this.setPageList(this.pageList.filter(menu => menu.id !== id));
        },

        /**
         * 关闭其它顶部页签，并同步主舞台页面列表。
         * @param {object} tab 要保留的页签
         */
        closeOtherTabs(tab) {
            const oldList = this.tabList;

            const newList = oldList.filter(menu => menu.id === tab.id);
            this.setTabList(newList);

            // 剔除已经打开的容器
            this.setCurrentPage(tab);
            this.setPageList(this.pageList.filter(page => {
                // 两种情况下不需要关闭
                // 1. 在 tabList 中不存在的, 这说明已经打开的组件可能不是顶部页签
                // 2. 在 tabList 中存在的且在 newTabList 中存在的，证明它没有被关闭，需要保留
                return !oldList.some(tabInfo => tabInfo.id === page.id) || newList.some(tabInfo => tabInfo.id === page.id);
            }));
        },

        /**
         * 关闭所有可关闭的顶部页签。
         */
        closeAllTabs() {
            const tabList = this.tabList;

            this.setTabList([]);
            this.setCurrentPage(HOME_TAB);
            this.setPageList(this.pageList.filter(page => !tabList.some(tabInfo => tabInfo.id === page.id)));
        },
        
        /**
         * 增加 statusbar
         * @param {*} item 
         */
        addStatusbar(item){
            this.statusbarItems.push(item);
            this.reorderStatusbarItems();
        },

        /**
         * 移除 statusbar
         * @param {*} item 
         */
        removeStatusbar(item){
            const index = this.statusbarItems.indexOf(item); 
            if (index > -1) {
                this.statusbarItems.splice(index, 1); 
                this.reorderStatusbarItems();
            }
        },
        
        /**
         * 重新排序 statusbar list
         */
        reorderStatusbarItems() {
            this.statusbarItems = this.statusbarItems.sort((a, b) => {
                if (a.order !== b.order) {
                    return a.order - b.order;
                }
                return 0;
            });
        },
        
        /**
         * 显示底部工作台。
         */
        showWorkbench() {
            this.workbenchVisible = true;
        },

        /**
         * 隐藏底部工作台。
         */
        hideWorkbench() {
            this.workbenchVisible = false;
        },

        /**
         * 切换底部工作台显示状态。
         */
        toggleWorkbench() {
            if (this.workbenchVisible) {
                this.hideWorkbench();
                return;
            }

            this.showWorkbench();
        },

    },
});

export default useLayoutStore;
