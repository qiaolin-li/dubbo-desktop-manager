import connectRepository from "./connectRepository"
import invokeHistoryRepository from './invokeHistoryRepository'

export default [
    {
        name: "connectRepository",
        target: connectRepository,
    },

    {
        name: "invokeHistoryRecord",
        target: invokeHistoryRepository
    }
]