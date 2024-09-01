import axios                    from 'axios';
import i18n                     from '@/main/common/i18n'
import appCore                  from '@/main/AppCore.js';
import appConfig                from "./config/appConfig"
import constant                 from "@/main/common/Constant.js";
import excelExporter            from './excel/ExcelExporter'

appCore.axios = axios;
appCore.i18n = i18n;
appCore.appConfig = appConfig;
appCore.constant = constant;

export default [

    // 配置管理对象
    {
        name: "appConfig",
        target: appConfig,
    },

    {
        name: "excelExporter",
        target: excelExporter
    }
]