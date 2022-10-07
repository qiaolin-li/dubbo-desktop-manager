<template>
  <div>
    <el-container>
      <el-aside class="menu-aside" width="70px">
          <router-link :to="routing.path" class="route"
            v-for="routing in routesList" :key="routing.path">
            <div class="menu-div" :class="[$route.name == routing.name?'active':'']"  >
              <i class="el-icon-menu"></i>  
              <span class="menu-txt">{{routing.meta.title}}</span>
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
      menuBg:'rgba(225,226,226,.8)',
      menuText:'#3FB24F',
      menuActiveText:'#3FB24F'
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
    // debugger
    this.routesList = routesList;
  }
}
</script>

<style>
.route {
  text-decoration: none;
}
.menu-aside, .menu-div {
  display: flex;
  flex-direction: column;
}
.menu-aside {
  padding-top: 20px;
  align-items: center;
  background-color: #ECECEC;
}

.el-main {
  padding: 0px !important;
}

.menu-div{
  width: 50px;
  height: 50px;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 10px;
  border-radius: 10%;
  color: #666666;
}
.active {
  background-color: rgba(225,226,226,.8);
  color: #3FB24F;
}
.el-icon-menu {
  font-size: 22px;
}
.menu-txt{
  font-size: 11px;
}

</style>