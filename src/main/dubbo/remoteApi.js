import dubboInvoke from "./invoker"
import dubboParamGenerator from './generator/param'

export default [
    {
        name: "invoke",
        target: dubboInvoke,
    },
    {
        name: "dubboParamGenerator",
        target: dubboParamGenerator
    }
]