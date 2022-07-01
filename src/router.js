import Vue from 'vue'
import Router from 'vue-router'
import index from "./views/index.vue";
import settings from "@/views/settings/settings.vue";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/settings',
      name: 'settings',
      component: settings
    },
  ]
})
