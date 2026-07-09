import Vue          from 'vue'
import VueI18n      from 'vue-i18n'
import messages     from '@/common/i18n/index.js'


Vue.use(VueI18n)

// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
    locale: "zh-CN", // 设置地区
    messages, // 设置地区信息
})


i18n.locale = appRuntime.getSystemLocale();

export default i18n;