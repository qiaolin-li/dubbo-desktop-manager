import Vue                          from "vue";

import ElementUI                    from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import "./assets/style/global.css";
import "./assets/iconfont.css";

import AppSplitPane                 from "@/renderer/components/split-pane/split-pane.vue";
import StandaloneJsonEditorWindow   from "@/renderer/views/standalone/standalone-json-editor-window.vue";

import { PiniaVuePlugin }           from "pinia";
import pinia                        from "@/renderer/store";
import { useThemeStore }            from "@/renderer/store/modules/theme.js";
import VueCompositionApi            from "@vue/composition-api";

if (window.constant.platform === "win32") {
    import("./assets/style/windows.css");
} else {
    import("./assets/style/mac.css");
}

import "./assets/icomoon/style.css";

Vue.use(ElementUI);
Vue.use(VueCompositionApi);
Vue.use(PiniaVuePlugin);
Vue.component("app-split-pane", AppSplitPane);

Vue.config.productionTip = false;
Vue.config.ignoredElements = ["tab-group"];
Vue.config.devtools = true;

const themeStore = useThemeStore(pinia);
themeStore.initTheme().catch((error) => {
    console.error("初始化独立窗口主题失败", error);
}).finally(() => {
    new Vue({
        pinia,
        render: h => h(StandaloneJsonEditorWindow),
    }).$mount("#app");
});
