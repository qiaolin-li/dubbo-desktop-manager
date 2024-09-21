<template>
  <el-container style=" height: 100%;">
    <el-aside class="menu-aside dragRegion" width="70px" ondragstart="return false">
      <div class="ddm-menu-list">
        <div>
          <div class="menu-div" :class="[currentMenu.id  == menu.id ? 'active':'']" v-for="menu in topMenuList" :key="menu.id" @click="switchMenu(menu)" @contextmenu.stop="openMenuList($event, menu)">
            <el-tooltip effect="light" :content="menu.label" placement="right-start">
              <i :class="menu.icon"></i>
              <span>{{menu.label}}</span>
            </el-tooltip>
          </div>
        </div>
        <div>
          <div class="ddm-bottom-menu-list menu-div" :class="[currentMenu.id  == menu.id ? 'active':'']" v-for="menu in bottomMenuList" :key="menu.id" @click="switchMenu(menu)" @contextmenu.stop="openMenuList($event, menu)">
            <el-tooltip effect="light" :content="menu.label" placement="right-start">
              <i :class="menu.icon"></i>
              <span>{{menu.label}}</span>
            </el-tooltip>
          </div>
           <div class="ddm-bottom-menu-list menu-div" @click="openGithub">
            <el-tooltip effect="light" content="GitHub" placement="right-start">
              <svg width="28" height="28" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                    clip-rule="evenodd"
                    d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z"
                    fill="currentColor"
                    fill-rule="evenodd" />
                <path
                    clip-rule="evenodd"
                    d="M19.1833 45.4716C18.9898 45.2219 18.9898 42.9973 19.1833 38.798C17.1114 38.8696 15.8024 38.7258 15.2563 38.3667C14.437 37.828 13.6169 36.1667 12.8891 34.9959C12.1614 33.8251 10.5463 33.64 9.89405 33.3783C9.24182 33.1165 9.07809 32.0496 11.6913 32.8565C14.3044 33.6634 14.4319 35.8607 15.2563 36.3745C16.0806 36.8883 18.0515 36.6635 18.9448 36.2519C19.8382 35.8403 19.7724 34.3078 19.9317 33.7007C20.1331 33.134 19.4233 33.0083 19.4077 33.0037C18.5355 33.0037 13.9539 32.0073 12.6955 27.5706C11.437 23.134 13.0581 20.2341 13.9229 18.9875C14.4995 18.1564 14.4485 16.3852 13.7699 13.6737C16.2335 13.3589 18.1347 14.1343 19.4734 16.0001C19.4747 16.0108 21.2285 14.9572 24.0003 14.9572C26.772 14.9572 27.7553 15.8154 28.5142 16.0001C29.2731 16.1848 29.88 12.7341 34.5668 13.6737C33.5883 15.5969 32.7689 18.0001 33.3943 18.9875C34.0198 19.9749 36.4745 23.1147 34.9666 27.5706C33.9614 30.5413 31.9853 32.3523 29.0384 33.0037C28.7005 33.1115 28.5315 33.2855 28.5315 33.5255C28.5315 33.8856 28.9884 33.9249 29.6465 35.6117C30.0853 36.7362 30.117 39.948 29.7416 45.247C28.7906 45.4891 28.0508 45.6516 27.5221 45.7347C26.5847 45.882 25.5669 45.9646 24.5669 45.9965C23.5669 46.0284 23.2196 46.0248 21.837 45.8961C20.9154 45.8103 20.0308 45.6688 19.1833 45.4716Z"
                    fill="currentColor"
                    fill-rule="evenodd" />
              </svg>
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-aside>

    <el-main>
      <component v-for="menuPage in menuPageList" :key="menuPage.id" v-bind="componentProps(menuPage)" v-show="currentMenu.id == menuPage.id" />
    </el-main>

  </el-container>
</template>

<script>
import menuConfig from '@/renderer/config/sidebarMenuList.js';
const remote = require("@electron/remote");

export default {
  data() {
    return {
      currentMenu: {},
      topMenuList: [],
      bottomMenuList: [],
      menuPageList: [],
    }
  },
  mounted() {
    this.topMenuList = menuConfig.topMenu.map(x => {
      x.id = `menu-${Math.random()}`;
      if (x.ready) {
        x.ready(this, x);
      }
      return x;
    });
    this.bottomMenuList = menuConfig.bottomMenu.map(x => {
      x.id = `menu-${Math.random()}`;
      if (x.ready) {
        x.ready(this, x);
      }
      return x;
    });
    this.switchMenu(this.topMenuList[0]);
  },
  methods: {
    resize() {},
    componentProps(menu) {
      if (menu.component) {
        return {
          is: menu.component,
          ...menu.params,
          mainPanel: this,
          switchCurrentMenu: () => this.switchMenu(menu),
        };
      }
      
      return {
        target: '_blank',
        rel: 'noopener',
        is: 'iframe',
        src: menu.src,
        height: "100%",
        width: "100%",
        style: "vertical-align:top",
        webpreferences: 'nodeIntegration=true, contextIsolation=false'
      }
    },
    addMenu(menu, location){
      location = location || 'top';

      const menuList = location === 'top' ? this.topMenuList : this.bottomMenuList;
      if(!menuList.find(x => x.id === menu.id)){
        menuList.push(menu);
      }
      
      this.switchMenu(menu);
    },
    switchMenu(menu) {
      if(this.currentMenu && this.currentMenu.id === menu.id){
        return;
      }

      if (menu.click) {
        menu.click(this);
        return;
      }

      if (menu.component || menu.src) {
        if(!this.menuPageList.find(x => x.id === menu.id)){
          this.menuPageList.push(menu);
        }
      }

      if(this.currentMenu.cache === false){
        this.menuPageList = this.menuPageList.filter(info => this.currentMenu.id !== info.id);
      }

      this.currentMenu = menu;
    },
    openGithub(){
      remote.shell.openExternal("https://github.com/qiaolin-li/dubbo-desktop-manager")
    },

    removeMenu(menu) {
      // 删除tab，并且记录当前删除的下标位置
      for (let i = 0; i < this.menuPageList.length; i++) {
        if (this.menuPageList[i] === menu) {
          if(this.currentMenu === menu){
            this.currentMenu = this.menuPageList[i + 1] || this.menuPageList[i - 1];
          }

          this.menuPageList.splice(i, 1);
          this.topMenuList = this.topMenuList.filter(menuInfo => menuInfo !== menu);
          this.bottomMenuList = this.bottomMenuList.filter(menuInfo => menuInfo !== menu);
          break;
        }
      }
    },
    removeOtherMenu(menu) {
      this.menuPageList = this.menuPageList.filter(menuInfo => !menuInfo.closable || menuInfo === menu);
      this.topMenuList = this.topMenuList.filter(menuInfo => !menuInfo.closable || menuInfo === menu);
      this.bottomMenuList = this.bottomMenuList.filter(menuInfo => !menuInfo.closable || menuInfo === menu);

      // 当前选中的menu没被删除
      if(this.menuPageList.find(x => x === this.currentMenu)){
        return;
      }
      
      this.currentMenu = menu;
    },
    removeAllMenu(menu) {
      this.menuPageList = this.menuPageList.filter(menuInfo => !menuInfo.closable);
      this.topMenuList = this.topMenuList.filter(menuInfo => !menuInfo.closable);
      this.bottomMenuList = this.bottomMenuList.filter(menuInfo => !menuInfo.closable);

      // 当前选中的menu没被删除
      if(this.menuPageList.find(x => x === this.currentMenu)){
        return;
      }
      
      this.currentMenu = menu;
    },
    forceUpdateComponent(menu) { 
      // 相信不会有人点开100000个tab, 所以这里不会有id重复的情况
      menu.id += 100000;
      this.currentMenu = menu;
    },
    openMenuList(event, menuInfo){
      const menuTemplate = [
        {
          label: this.$t('tab.refresh'),
          click: async () => this.forceUpdateComponent(menuInfo)
        },
        { type: 'separator' },
        ...(menuInfo.closable ? [{
          label: this.$t('tab.close'),
          click: async () => this.removeMenu(menuInfo)
        }] : []),
        {
          label: this.$t('tab.closeOther'),
          click: async () => this.removeOtherMenu(menuInfo)
        },
        {
          label: this.$t('tab.closeAll'),
          click: async () => this.removeAllMenu(menuInfo)
        }
      ];
      // 阻止默认行为
      event.preventDefault();
      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    }
  },
}
</script>

<style>
.menu-aside {
  height: 100%;
  align-items: center;
  background-color: #f0f0f0;
}

.ddm-menu-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.ddm-bottom-menu-list {
  margin-bottom: 10px;
}

.el-main {
  padding: 0px !important;
}

.menu-aside,
.menu-div {
  display: flex;
  flex-direction: column;
}
.menu-div {
  width: 50px;
  height: 50px;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 10px;
  border-radius: 10%;
  color: #666666;
  -webkit-user-drag: none;
}

.menu-div:hover {
  background-color: rgba(225, 226, 226, 0.8);
  color: #3fb24f;
}

.active {
  background-color: rgba(225, 226, 226, 0.8);
  color: #3fb24f;
}
.menu-div i {
  font-size: 28px;
}
.menu-txt {
  font-size: 11px;
}
</style>