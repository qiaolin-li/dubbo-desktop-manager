import dataSourceRepository from "./DataSourceRepository"
import invokeHistoryRepository from './InvokeHistoryRepository'
import serviceCollectRepository from './ServiceCollectRepository'

export default [
    {
        name: "dataSourceRepository",
        target: dataSourceRepository,
    },

    {
        name: "invokeHistoryRecord",
        target: invokeHistoryRepository
    },

    {
        name: "serviceCollectRepository",
        target: serviceCollectRepository
    }
]