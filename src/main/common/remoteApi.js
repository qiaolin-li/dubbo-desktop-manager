import appConfig from "./config/appConfig"
import excelExporter from './excel/ExcelExporter'

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