export default {
    code: "en-US",
    name: "English",
    base: {
        confirm: "confirm",
        cancel: "cancel",
        close: "close",
        save: "save",
        saveSuccess: "save successfully",
        saveError: "fail to save",
        deleteSuccess: "successfully delete",
        saveErrorMessage: "save failed, cause:{e}",
        hintTitle: "hint",
        yes: "yes",
        no: "no",
        refresh : "refresh",
        connectTimeOut : "connect timeout",
    },
    menu: {
        addConnect: "New Connection",
        settings: "Settings"
    },
    welcome: {
        productName: "DUBBO DESKTOP MANAGER",
        version : "version: "
    },
    settings: {
        baseSettings: "Base Settings",
        language: "Language",
        apply: "Apply",
    },
    main: {
        addConnect: "New Connect",
        settings: "Settings"
    },
    connect: {
        addConnect: "New Connection",
        name: "name",
        address: "address",
        sessionTimeout: "timeout",
        save: "save",
        namespaceId: "namespaceId",
        validateMessage: {
            timeOutNotNull: "The timeout period cannot be empty",
            inputNumber: " Please enter the first group now",
            inputNumberRange: "Must be greater than 10ms",
            inputName: "Please enter a link name",
            rangeLimit: "The value contains 1 to 32 characters",
            inputConnectionAddress: "Please enter the link address",
        },
        searchContent: "search content",
        refreshSuccess: "Refreshing the service list is complete",
        refreshError: "Failed to refresh the service list! The reason: {e}",
        confirmDeleteConnect: "This operation will permanently delete the changed link. Do you want to continue?"
    },
    dubbo: {
        serviceTab: {
            providerList: "Provider List",
            consumerList: "Consumer List",
        },
        providePage: {
            address: "address",
            application: "application",
            version: "version",
            methodCount: "methodCount",
            operate: "operate",
            call: "call",
            callTitle: "call {address}",
        },

        consumerPage: {
            application: "application",
            version: "version",
            check: "check",
            enable: "enable",
            timeout: "timeout",
            retries: "retries",
        },

        invokePage: {
            serviceName: "serviceName",
            application: "application",
            address: "address",
            generic: "generic",
            version: "version",
            dubboVersion: "Dubbo version",
            jarVersion: "Jar version",
            method: "method",
            operate: "operate",
            call: "call",
            generateParam: "Generation Parameter",
            generateCommand: "Generation Command",
            requestParam: "Request Parameter",
            requestParamStrategyTitle: "Parameter generation strategy",
            paramGenerateStrategyDesc: "The history argument of the last successful call is used first, and if not, an attempt is made to generate the argument",
            format: "format",
            responseInfo: "Response Info",
            historyInvokeParamList: "History call",
            callDubboServiceSuccess: "Calling the Dubbo interface succeeded.",
            callDubboServiceFail: "Failed to invoke the Dubbo interface：{e}",
            generateParamError: "Unable to generate parameters! The reason: {error}",
            invokeProgress: "Call in progress",
            cancelInvoke: "Cancel",
            invokeTimeOut: "The call to the Dubbo interface timed out.",
        },
        telnetTerminal: {
            connecting: "connecting {ip} {port}",
            connectionTimeout: "Connection timed out, please check the network! {ip} {port} ",
            connectionClosed: "Disconnected, reconnecting...",
        }
    }
}