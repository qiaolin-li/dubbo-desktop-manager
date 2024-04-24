import Vue from 'vue'
import App from './App.vue'
import "./assets/style/global.css";
import "./assets/iconfont.css";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Splitpane from '@/renderer/components/split-pane/index.vue'


import registryList from '@/renderer/views/connect/index.vue';
import historyList from '@/renderer/views/history/index.vue';
import dubboPage from '@/renderer/views/dubbo/index.vue';
import welcome from '@/renderer/components/welcome.vue';
import settings from '@/renderer/views/settings/index.vue';
Vue.component('registryList', registryList);
Vue.component('historyList', historyList);
Vue.component('dubboPage', dubboPage);
Vue.component('welcome', welcome);
Vue.component('settings', settings);

import dubboProviderList from "@/renderer/views/dubbo/dubbo-provider-list.vue";
import dubboConsumerList from "@/renderer/views/dubbo/dubbo-consumer-list.vue";
import dubboTelnet from "@/renderer/views/dubbo/dubbo-telnet.vue";
import dubboInvoke from "@/renderer/views/dubbo/dubbo-invoke.vue";
import dubboProviderConfiguration from "@/renderer/views/dubbo/dubbo-provider-configuration.vue";
Vue.component('dubboProviderList', dubboProviderList);
Vue.component('dubboConsumerList', dubboConsumerList);
Vue.component('dubboTelnet', dubboTelnet);
Vue.component('dubboInvoke', dubboInvoke);
Vue.component('dubboProviderConfiguration', dubboProviderConfiguration);


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

Vue.config.ignoredElements = [
  'tab-group',
]

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
