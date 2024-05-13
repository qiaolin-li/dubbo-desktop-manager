import connectRepository from "./connectRepository"
import invokeHistoryRepository from './invokeHistoryRepository'
import interfaceCollectRepository from './interfaceCollectRepository'

export default [
    {
        name: "connectRepository",
        target: connectRepository,
    },

    {
        name: "invokeHistoryRecord",
        target: invokeHistoryRepository
    },

    {
        name: "interfaceCollectRepository",
        target: interfaceCollectRepository
    }
]