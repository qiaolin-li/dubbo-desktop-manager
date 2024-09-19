import dataSourceFacade from "./DataSourceFacade";


export default  (app) => {
    app.registry("dataSourceFacade", dataSourceFacade);
}