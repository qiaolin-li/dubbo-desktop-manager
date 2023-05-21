<template>
  <el-container>
    <el-aside class="menu-aside dragRegion" width="70px" ondragstart="return false">
      <div class="menu-div" :class="[currentMenu == menu.id ? 'active':'']" v-for="menu in menuList" :key="menu.id" @click="switchMenu(menu)">
        <el-tooltip effect="light" :content="menu.label" placement="right-start">
          <i :class="menu.icon"></i>
        </el-tooltip>
      </div>
    </el-aside>

    <el-main>
      <split-pane @resize="resize" split="vertical" :min-percent="15" :default-percent="20">
        <template slot="paneL">
          <div class="left-container">
            <component v-for="menuPage in menuPageList" :key="menuPage.id" v-bind="componentProps(menuPage)" v-show="currentMenu == menuPage.id" />
          </div>
        </template>
        <template slot="paneR">
          <myTabList ref="myTabs" navScrollClassList="dragRegion"></myTabList>
        </template>
      </split-pane>
    </el-main>

  </el-container>
</template>

<script>
import menuList from '@/renderer/config/sidebarMenuList.js';
import myTabList from '@/renderer/components/tabs/index.vue';

export default {
  components: {
    myTabList
  },
  data() {
    return {
      currentMenu: {},
      menuList: [],
      menuPageList: [],
    }
  },
  mounted() {
    this.menuList = menuList.map(x => {
      x.id = `menu-${Math.random()}`;
      if (x.ready) {
        x.ready(this);
      }
      return x;
    });
    this.switchMenu(this.menuList[0]);
  },
  methods: {
    resize() {
    },
    componentProps(menu) {
      return {
        is: menu.componentName,
        ...menu.params,
        tab: this,
      };
    },
    switchMenu(menu) {
      if (menu.componentName) {
        if(!this.menuPageList.find(x => x.id === menu.id)){
          this.menuPageList.push(menu);
        }
        this.currentMenu = menu.id;
        return;
      }

      if (menu.click) {
        menu.click(this);
        return;
      }

      // 后续可以考虑报错
    },
    addTab(tabInfo) {
      this.$refs.myTabs.addTab(tabInfo);
    },
  },
}
</script>

<style>
.menu-aside {
  height: 100vh;
  padding-top: 20px;
  align-items: center;
  background-color: #ececec;
}


.el-main {
  padding: 0px !important;
}

.left-container {
  height: 100vh;
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