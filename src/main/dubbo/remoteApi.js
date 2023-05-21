import dubboInvoke from "./invoker"
import dubboParamGenerator from './generator/param'

export default [
    {
        name: "dubboInvoke",
        target: dubboInvoke,
    },
    {
        name: "dubboParamGenerator",
        target: dubboParamGenerator
    }
]