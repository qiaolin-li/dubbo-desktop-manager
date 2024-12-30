import appConfig                from "./config/appConfig"
import excelExporter            from './excel/ExcelExporter'

export default (app) => {
    app.registry("appConfig", appConfig);
    app.registry("excelExporter", excelExporter);
}