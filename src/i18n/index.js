import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {sync} from 'os-locale'

import appConfig from "@/main/repository/appConfig.js";
Vue.use(VueI18n)


// 准备翻译的语言环境信息
let messages = {};
//第一个参数表示相对的文件目录，第二个参数表示是否包括子目录中的文件，第三个参数表示引入的文件匹配的正则表达式。
const files = require.context('./lang/', false, /\.js$/);
files.keys().forEach((key) => {
    let optionKey = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.js')); //截取文件名称
    let message = require(`./lang/${optionKey}.js`).default;
    messages[`${optionKey}`] = message;
})

let locale =  appConfig.getProperty("systemLocale");
if(!locale && process.type != "renderer"){
    let osLocale = locale = sync();
    appConfig.setProperty("systemLocale", osLocale);
}

// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
    locale: locale || "zh-CN", // 设置地区
    messages, // 设置地区信息
})

export default i18n;