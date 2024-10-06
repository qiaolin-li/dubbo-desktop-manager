import Vue from 'vue'
import App from './App.vue'
import "./assets/style/global.css";
import "./assets/iconfont.css";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Splitpane from '@/renderer/components/split-pane/index.vue'

import registryList               from '@/renderer/views/datasource/index.vue';
import serviceManager             from '@/renderer/views/service/index.vue';
import plugins                    from '@/renderer/views/plugin/index.vue';
import settings                   from '@/renderer/views/settings/index.vue';
Vue.component('registryList', registryList);
Vue.component('serviceManager', serviceManager);
Vue.component('plugins', plugins);
Vue.component('settings', settings);

import infiniteScroll from 'vue-infinite-scroll'
Vue.use(infiniteScroll)

import jsonlint from 'jsonlint' 
window.jsonlint = jsonlint

import i18n from '@/renderer/common/i18n'

if(process.platform === 'win32'){
  import("./assets/style/windows.css")
} else {
  import("./assets/style/mac.css")
}

import moment from 'moment'
Vue.prototype.$moment = moment
moment.locale('zh-cn')  //设置区域为中国

Vue.use(ElementUI);
Vue.component('split-pane', Splitpane);

Vue.config.productionTip = false
Vue.config.ignoredElements = ['tab-group',]
Vue.config.devtools = true;

import MavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
Vue.use(MavonEditor)

Map.prototype.computeIfAbsent = function (key, fun) {
  if(!this.has(key)){
      this.set(key, fun(key));
  }
  return this.get(key);
}


// 加载-基础组件
import appCore from './core/AppRendener';

appCore.init(Vue).then(() => {
  new Vue({
    i18n,
    render: h => h(App)
  }).$mount('#app')
});

