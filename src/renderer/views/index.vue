<template>
  <el-container style=" height: 100%;">
    <el-aside class="menu-aside dragRegion" width="70px" ondragstart="return false">
      <div class="ddm-menu-list">
        <div>
          <div class="menu-div" :class="[currentMenu.id  == menu.id ? 'active':'']" v-for="menu in topMenuList" :key="menu.id" @click="switchMenu(menu)">
            <el-tooltip effect="light" :content="menu.label" placement="right-start">
              <i :class="menu.icon"></i>
              <span>{{menu.label}}</span>
            </el-tooltip>
          </div>
        </div>
        <div>
          <div class="ddm-bottom-menu-list menu-div" :class="[currentMenu.id  == menu.id ? 'active':'']" v-for="menu in bottomMenuList" :key="menu.id" @click="switchMenu(menu)">
            <el-tooltip effect="light" :content="menu.label" placement="right-start">
              <i :class="menu.icon"></i>
              <span>{{menu.label}}</span>
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
        x.ready(this);
      }
      return x;
    });
    this.bottomMenuList = menuConfig.bottomMenu.map(x => {
      x.id = `menu-${Math.random()}`;
      if (x.ready) {
        x.ready(this);
      }
      return x;
    });
    this.switchMenu(this.topMenuList[0]);
  },
  methods: {
    resize() {
    },
    componentProps(menu) {
      return {
        is: menu.componentName,
        ...menu.params,
        mainPanel: this,
      };
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

      if (menu.componentName) {
        if(!this.menuPageList.find(x => x.id === menu.id)){
          this.menuPageList.push(menu);
        }
      }

      if(this.currentMenu.cache === false){
        this.menuPageList = this.menuPageList.filter(info => this.currentMenu.id !== info.id);
      }

      this.currentMenu = menu;
    },
  },
}
</script>

<style>
.menu-aside {
  height: 100%;
  align-items: center;
  background-color: #ececec;
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

.left-container {
  height: 100%;
  overflow: auto;
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