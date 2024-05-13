export default {
    code: "en-US",
    name: "English",
    version : {
        message: "Discover a new version {latest}\n{releaseBody}",
        simpleMessage : "Find a new version {latest} with many new features. Do you want to download the latest version?",
        title : "Discover a new version",
        noRemindCurrnetVersion : "No longer reminded to update the current version",
        yes : "yes",
        no : "no"
    },
    base: {
        modify: "修改",
        delete: "删除",
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
        datasource: "datasource",
        settings: "Settings",
        reportBug: "report bug"
    },
    welcome: {
        productName: "DUBBO DESKTOP MANAGER",
        version : "version: "
    },
    settings: {
        baseSettings: {
            title: "Base Settings",
            language: "Language",
        },
        apply: "Apply",
        invokerSettings : {
            title: "Invoker Setting",
            invokerType : "Default Invoker Type",
            invokerTypeTips : "Before using the Java actuator, install the Java environment first. Java invocation is slower than Telnet invocation, but the information returned by the Java invocation is more complete.",
        }
    },
    tab : {
        close : "close",
        closeOther : "close Other",
        closeAll : "Close All",
        refresh: "refresh",
    },
    editor : {
        copy : "copy",
        copySuccess : "Copy success",
        collectSuccess : "Successful collection"
    },
    connect: {
        addConnect: "New Connection",
        name: "name",
        address: "address",
        sessionTimeout: "timeout",
        save: "save",
        namespaceId: "namespaceId",
        username: "username",
        password: "password",
        validateMessage: {
            timeOutNotNull: "The timeout period cannot be empty",
            inputNumber: " Please enter the first group now",
            inputNumberRange: "Must be greater than 10ms",
            inputName: "Please enter a link name",
            rangeLimit: "The value contains 1 to 32 characters",
            inputConnectionAddress: "Please enter the link address",
        },
        createSuccess:"Adding a connection succeeded!",
        updateSuccess:"Succeeded in modifying the connection!",
        searchContent: "search content",
        refreshSuccess: "Refreshing the service list is complete",
        refreshError: "Failed to refresh the service list! The reason: {e}",
        confirmDeleteConnect: "This action will permanently delete the link. Do you want to continue?",
        exportService : {
            zookeeper : {
                getServiceList : {
                    error:"Error getting service list! The reason:{e}"
                },
                getProviderList : {
                    error:"Error getting provider list! The reason:{e}"
                },
                getConsumerList : {
                    error:"Error getting list of fetch consumers! The reason:{e}"
                },
                getMetaData : {
                    error:"Error getting list of fetch consumers! The reason: {e}"
                },
                saveConfiguration : {
                    error:"Error getting dynamic configuration! The reason:{e}"
                },
            },
            nacos : {
                getServiceList : {
                    error:"Error getting service list! The reason:{e}"
                },
                getProviderList : {
                    error:"Error getting provider list! The reason:{e}"
                },
                getConsumerList : {
                    error:"Error getting list of fetch consumers! The reason:{e}"
                },
                getMetaData : {
                    error:"Error getting list of fetch consumers! The reason: {e}"
                },
                saveConfiguration : {
                    error:"Error getting dynamic configuration! The reason:{e}"
                },
            }
        }
    },
    dubbo: {
        serviceTab: {
            providerList: "Provider List",
            consumerList: "Consumer List",
        },
        providePage: {
            protocol: "protocol",
            address: "address",
            application: "application",
            version: "version",
            disabled: "disabled",
            methodCount: "methodCount",
            operate: "operate",
            disableTypeMap : {
                service: "service",
                application: "application"
            },
            call: "call",
            callTitle: "call {address}",
            exportExcel:"Export Excel",
            selectExportDirectory : "Selecting an Export Directory",
            exportSuccess : "Export success", 
            exportError : "The export fails. Possible cause:{}",
            serviceEnable : "Service Dimension - Enabled",
            serviceDisable : "Service Dimension - Disabled",
            editConfiguration : "Edit the service dynamic configuration",
        },

        consumerPage: {
            ip : "ip",
            application: "application",
            version: "version",
            check: "check",
            enable: "enable",
            timeout: "timeout",
            retries: "retries",
            exportExcel:"Export Excel",
            selectExportDirectory : "Selecting an Export Directory",
            exportSuccess : "Export success", 
            exportError : "The export fails. Possible cause:{}"
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
            calling: "calling",
            historyParam: "History Parameter",
            generateParam: "Generation Parameter",
            generateCommand: "Generation Command",
            requestParamType: "Request Parameter Type",
            requestParam: "Request Parameter",
            requestParamStrategyTitle: "Parameter generation strategy",
            paramGenerateStrategyDesc: "The history argument of the last successful call is used first, and if not, an attempt is made to generate the argument",
            format: "format",
            responseInfo: "Response",
            historyInvokeParamList: "History call",
            callParamError: "The request parameter format is incorrect",
            callDubboServiceSuccess: "Calling the Dubbo interface succeeded.",
            callDubboServiceFail: "Failed to invoke the Dubbo interface：{e}",
            generateParamError: "Unable to generate parameters! The reason: {error}",
            invokeProgress: "Call in progress",
            cancelInvoke: "Cancel",
            invokeTimeOut: "The call to the Dubbo interface timed out.",
            connectProviderError: "Connecting to the provider server failed!",
            notFoundJDK:"If you need to use the Java caller, install the JDK first",
            callDubboAdminError: "Failed to call dubco-admin, {info}",
            unselectedHistory:"No history parameter is selected",
            notFoundMatedata:"Metadata not found, method parameter type cannot be obtained, please add",
        },
        telnetTerminal: {
            connecting: "connecting {ip} {port}",
            connectionTimeout: "Connection timed out, please check the network! {ip} {port} ",
            connectionClosed: "Disconnected, reconnecting...",
        },
        configurationPage: {
            title : "configuration information",
            save : "save configuration",
            invalidFormat : "Incorrect configuration format",
            saveSuccess:"save successfully"
        }
    }
}