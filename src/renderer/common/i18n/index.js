import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from '@/common/i18n/index.js'
import appConfig from "@/renderer/api/appConfig.js";
Vue.use(VueI18n)



// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
    locale: "zh-CN", // 设置地区
    messages, // 设置地区信息
})


appConfig.getProperty("systemLocale").then(locale => {
    i18n.locale = locale;
});

export default i18n;