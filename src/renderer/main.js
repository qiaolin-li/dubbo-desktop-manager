import Vue 					from "vue";
import App 					from "./App.vue";



import ElementUI 			from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import "./assets/style/global.css";
import "./assets/iconfont.css";

import AppSplitPane 					from "@/renderer/components/split-pane/split-pane.vue";

import projectList 						from "@/renderer/views/project/index.vue";
import projectPagePlaceholder 			from "@/renderer/views/project/project-page-placeholder.vue";
import plugins 							from "@/renderer/views/plugin/index.vue";
import settings 						from "@/renderer/views/settings/index.vue";

Vue.component("projectList", projectList);
Vue.component("projectPagePlaceholder", projectPagePlaceholder);
Vue.component("plugins", plugins);
Vue.component("settings", settings);

import infiniteScroll from "vue-infinite-scroll";
Vue.use(infiniteScroll);

import i18n from "@/renderer/common/i18n";
import VueCompositionApi from "@vue/composition-api";
import { PiniaVuePlugin } from "pinia";
import pinia from "@/renderer/store";
import { useThemeStore } from "@/renderer/store/modules/theme.js";

if (window.constant.platform === "win32") {
	import("./assets/style/windows.css");
} else {
	import("./assets/style/mac.css");
}

import "./assets/icomoon/style.css"; // 引入 icomoon 样式

import moment from "moment";
Vue.prototype.$moment = moment;
moment.locale("zh-cn"); // 设置区域为中国

Vue.use(ElementUI);
Vue.use(VueCompositionApi);
Vue.use(PiniaVuePlugin);
Vue.component("app-split-pane", AppSplitPane);
Vue.component("split-pane", AppSplitPane);

Vue.config.productionTip = false;
Vue.config.ignoredElements = ["tab-group"];
Vue.config.devtools = true;

import MavonEditor from "mavon-editor";
import "mavon-editor/dist/css/index.css";
Vue.use(MavonEditor);

Map.prototype.computeIfAbsent = function (key, fun) {
	if (!this.has(key)) {
		this.set(key, fun(key));
	}
	return this.get(key);
};

// 加载-基础组件
import appRenderer from "./core/AppRenderer";

appRenderer.init(Vue).then(async () => {
	
	const themeStore = useThemeStore(pinia);
	try {
		await themeStore.initTheme();
	} catch (error) {
		console.error("初始化主题失败", error);
	}
	new Vue({
		i18n,
		pinia,
		render: (h) => h(App),
	}).$mount("#app");
});
