import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {sync} from 'os-locale'
import messages from '@/common/i18n/index.js'
import appConfig from "@/main/common/config/appConfig.js";

Vue.use(VueI18n)

let locale =  appConfig.getProperty("systemLocale");
if(!locale && process.type != "renderer"){
    const osLocale = locale = sync();
    appConfig.setProperty("systemLocale", osLocale);
}

// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
    locale: locale || "zh-CN", // 设置地区
    messages, // 设置地区信息
})

export default i18n;