export default {
    code: "en-US",
    name: "English",
    hint: "Hint",
    confirm: "Confirm",
    cancel: "Cancel",
    expand: "expand",
    collapse: "collapse",
    count: "Count",  
    refresh : "refresh",
    version : {
        message: "Discover a new version {latest}\n{releaseBody}",
        simpleMessage : "Find a new version {latest} with many new features. Do you want to download the latest version?",
        title : "Discover a new version",
        noRemindCurrnetVersion : "No longer reminded to update the current version",
        yes : "yes",
        no : "no"
    },
    base: {
        modify: "Modify",
        delete: "Delete",
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
        plugins: "plugins",
        reportBug: "report bug",
        myCollection: "My Collection",
        invokeHistory: "Invoke History",
    },
    welcome: {
        productName: "DUBBO DESKTOP MANAGER",
        version : "version: "
    },
    settings: {
        baseSettings: {
            title: "Base Settings",
            language: "Language",
            jvmArgs: "JVM Args",
            jvmArgsTips: "Enter JVM Args, such as -Xmx512m"
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
    dynamicForm: {
        validateMessage: {
            timeOutNotNull: "The timeout period cannot be empty",
            inputNumber: " Please enter the first group now",
            inputNumberRange: "Must be greater than 10ms",
            inputName: "Please enter a link name",
            rangeLimit: "The value contains 1 to 32 characters",
            inputConnectionAddress: "Please enter the link address",
        },
    },
    telnetTerminal: {
        connecting: "connecting {ip} {port}",
        connectionTimeout: "Connection timed out, please check the network! {ip} {port} ",
        connectionClosed: "Disconnected, reconnecting...",
    },
    connect: {
        addConnect: "New Connection",
        modifyConnect: "Modify Connection",
        name: "name",
        type: "type",
        save: "save",
        validateMessage: {
            inputName: "Please enter a link name",
            rangeLimit: "The value contains 1 to 32 characters",
        },

        createSuccess:"Adding a connection succeeded!",
        updateSuccess:"Succeeded in modifying the connection!",
        open: "Open Datasource",
        searchContent: "search content",
        refreshSuccess: "Refreshing the service list is complete",
        refreshError: "Failed to refresh the service list! The reason: {e}",
        confirmDeleteConnect: "This action will permanently delete the link. Do you want to continue?",
      
        getFromDataError: "Get data source form error! Reason: {e}",
        getServiceListError:"Error getting service list! The reason:{e}",
        getProviderListError:"Error getting provider list! The reason:{e}",
        getConsumerListError:"Error getting list of fetch consumers! The reason:{e}",
        invokeMethodError:"Call interface error! Reason :{e}",
    },
    service: {
        callTitle: "call {address}",
    },
    collect: {
        collect: "collect",
        open: "open",
        copyInterfaceName: "Copy interface name",
        cancel: "cancel collection",
        newGroup: "New Group",
        inputGroupName: "Please enter a new group",
        defaultGroup: "Please select an existing group or enter a new group",
        group: "group",
        name: "name",
        update: "update",
    },
    plugin: {
        addPlugin: "Add Plugin",
        confirmDeleteConnect: "This action will remove the plug-in. Do you want to continue?",
    }
}