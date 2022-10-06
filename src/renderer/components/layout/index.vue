<template>
  <div>
    <el-container>
      <el-aside class="menu-aside" width="70px">
          <router-link :to="routing.path"  v-for="routing in routesList" :key="routing.path">
            <div class="menu-div">
              <i class="el-icon-menu"></i>  
              <span class="aa">{{routing.meta.title}}</span>
            </div>
          </router-link>

      </el-aside>
      <el-main>
        <!-- 功能页面 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>

import layoutAside from './layout-aside.vue'
import layoutMain from './layout-main.vue'
import routes from '../../router/routes.js'

export default {
  name: 'index',
  components: {
    layoutAside,
    layoutMain,
  },
  data() {
    return {
      routesList: [],
    }
  },
  created() {
    let routesList = [];
    for (let i = 0; i < routes.length; i++) {
      const routing = routes[i];
      if (routing.children) {
        for (let j = 0; j < routing.children.length; j++) {
          routesList.push(routing.children[j]);
        }
      }
    }
    debugger
    this.routesList = routesList;
  }

}
</script>

<style>
.menu-aside {
  padding-top: 20px;
}

.menu-div{
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  background-color: pink;
  margin: 10px;
  align-items: center;
}

.el-icon-menu{
  background-color: aqua;
  width: 20px;
  height: 20px;
}

.aa{
  background-color: bisque;
  font-size: 12px;
}


</style>