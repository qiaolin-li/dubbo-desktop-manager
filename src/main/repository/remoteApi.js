import dataSourceRepository from "./DataSourceRepository"
import invokeHistoryRepository from './InvokeHistoryRepository'
import serviceCollectRepository from './ServiceCollectRepository'


export default  (app) => {
    app.registry("dataSourceRepository", dataSourceRepository);
    app.registry("invokeHistoryRepository", invokeHistoryRepository);
    app.registry("serviceCollectRepository", serviceCollectRepository);
}