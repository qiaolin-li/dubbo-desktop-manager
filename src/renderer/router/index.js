/**
 * 路由实例化，拦截器配置
 */
 import Vue from 'vue';
 import Router from 'vue-router';
 import Routes from './routes';
 
 Vue.use(Router);
 
 // 注入默认配置、路由表
 const index = new Router({
   routes: Routes,
 });
 
 // 重置路由（接入Kylin可删）
 // Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
 export function resetRouter() {
   const newRouter = new Router({ routes: Routes });
   index.matcher = newRouter.matcher; // the relevant part
 }
 
 export default index;
 