import Vue from 'vue'
import App from './App.vue'
import router from '@/renderer/router'
import store from '@/renderer/store'
import "./assets/style/global.css";
import "./assets/iconfont.css";


import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import splitPane from 'vue-splitpane'

import jsonlint from 'jsonlint' 
window.jsonlint = jsonlint

import i18n from './i18n'

if(process.platform === 'win32'){
  import("./assets/style/windows.css")
}

console.log(__dirname)


import moment from 'moment'
Vue.prototype.$moment = moment
moment.locale('zh-cn')  //设置区域为中国

Vue.use(ElementUI);
Vue.component('split-pane', splitPane);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
