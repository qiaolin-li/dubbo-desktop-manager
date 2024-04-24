<template>
  <el-container>
    <el-aside class="menu-aside dragRegion" width="70px" ondragstart="return false">
      <div class="menu-div" :class="[currentMenu == menu ? 'active':'']" v-for="menu in menuList" :key="menu.id" @click="switchMenu(menu)">
        <el-tooltip effect="light" :content="menu.label" placement="right-start">
          <i :class="menu.icon"></i>
        </el-tooltip>
      </div>
    </el-aside>

    <el-main>
      <split-pane @resize="resize" split="vertical" :min-percent="15" :default-percent="20">
        <template slot="paneL">
          <div class="left-container">
            <registryList @clickServiceInfo="clickServiceInfo" />
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
import menuList from '@/renderer/sidebarMenuList.js';
import myTabList from '@/renderer/components/tabs/index1.vue';

export default {
  components: {
    myTabList
  },
  data() {
    return {
      currentMenu: {},
      menuList: []
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
    this.currentMenu = this.menuList[0];
  },
  methods: {
    resize() {
    },
    switchMenu(menu) {
      if (menu.componentName) {


        return;
      }

      if (menu.click) {
        menu.click(this);
        return;
      }

      // 后续可以考虑报错
    },
    clickServiceInfo(data) {
      let { serviceName, interfaceName, registryCenterId } = data;
      this.$refs.myTabs.addTab({
        title: interfaceName.split(".")[interfaceName.split(".").length - 1],
        fullTitle: interfaceName,
        componentName: 'dubboPage',
        params: {
          registryCenterId,
          interfaceName,
          serviceName
        }
      });

    },
    addTab(tabInfo) {
      this.$refs.myTabs.addTab(tabInfo);
    },
  },
}
</script>

<style>
.menu-aside {
  height: 100%;
  padding-top: 20px;
  align-items: center;
  background-color: #ececec;
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