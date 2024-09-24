export default {
    code: "zh-CN",
    name: "中文",
    hint: "提示",
    confirm: "确认",
    cancel: "取消",
    expand: "展开",
    collapse: "收起",
    count: "总数",  
    refresh : "刷新",
    version : {
        message: "发现新版本{latest}\n{releaseBody}",
        simpleMessage : "发现新版本{latest}，更新了很多功能，是否去下载最新的版本？",
        title : "发现新版本",
        noRemindCurrnetVersion : "不再提醒更新当前版本",
        yes : "是",
        no : "否"
    },
    base: {
        modify: "修改",
        delete: "删除",
        confirm: "确认",
        cancel: "取消",
        close: "关闭",
        save: "保存",
        saveSuccess: "保存成功",
        saveError: "保存失败",
        deleteSuccess: "删除成功",
        saveErrorMessage: "保存失败，原因：{e}",
        hintTitle: "提示",
        yes: "是",
        no: "否",
        refresh : "刷新",
        connectTimeOut : "连接超时",
    },
    menu: {
        addConnect: "新增连接",
        datasource: "数据源",
        settings: "设置",
        plugins: "插件",
        reportBug: "上报问题",
        myCollection: "我的收藏",
        invokeHistory: "调用历史",
    },
    welcome: {
        productName: "Dubbo 桌面管理工具",
        version : "版本："
    },
    settings: {
        baseSettings: {
            title: "基本设置",
            language: "语言",
            jvmArgs: "JVM参数",
            jvmArgsTips: "请输入JVM参数，如:-Xmx512m"
        },
        apply: "应用",
        invokerSettings : {
            title:"执行器设置",
            invokerType : "默认执行器类型",
            invokerTypeTips : "使用Java执行器时，请先安装Java环境，Java调用相对Telnet执行器较慢，但是Java调用返回的信息更加完整。",
        }
    },
    tab: {
        close : "关闭",
        closeOther : "关闭其他",
        closeAll : "关闭全部",
        refresh: "刷新",
    },
    editor : {
        copy : "复制",
        copySuccess : "复制成功",
        collectSuccess : "收藏成功"
    },
    dynamicForm: {
        validateMessage: {
            timeOutNotNull: "超时时间不能为空",
            inputNumber: "请输入数字",
            inputNumberRange: "必须大于10ms",
            inputName: "请输入链接名称",
            rangeLimit: "长度在 1 到 32 个字符",
            inputConnectionAddress: "请输入链接地址",
        },
    },
    telnetTerminal: {
        connecting: "正在连接 {ip} {port}",
        connectionTimeout: "连接超时，请检查网络! {ip} {port} ",
        connectionClosed: "连接断开，正在重新连接...",
    },
    connect: {
        addConnect: "新建链接",
        modifyConnect: "修改链接",
        name: "链接名称",
        type: "类型",
        save: "立即创建",

        validateMessage: {
            inputName: "请输入链接名称",
            rangeLimit: "长度在 1 到 32 个字符",
        },
        
        createSuccess:"新增连接成功!",
        updateSuccess:"修改连接成功!",
        open: "打开数据源",
        searchContent: "搜一搜",
        refreshSuccess: "刷新服务列表完成",
        refreshError: "刷新服务列表失败！原因：{e}",
        confirmDeleteConnect: "此操作将永久删除链接, 是否继续?",

        getFromDataError: "获取数据源表单错误! 原因: {e}",
        getServiceListError:"获取服务列表错误! 原因: {e}",
        getProviderListError:"获取提供者列表错误! 原因: {e}",
        getConsumerListError:"获取提消费者列表错误! 原因: {e}",
        invokeMethodError:"调用接口错误! 原因:{e}",
    },
    service: {
        callTitle: "调用 {address}",
    },
    collect: {
        collect: "收藏接口",
        open: "打开",
        copyInterfaceName: "复制接口名",
        cancel: "取消收藏",
        newGroup: "新分组",
        inputGroupName: "请输入新分组",
        defaultGroup: "请选择已存在的分组，或者输入新分组",
        group: "分组",
        name: "名称",
        update: "修改",
    },
    plugin: {
        addPlugin: "新增插件",
        confirmDeleteConnect: "此操作将移除插件, 是否继续?",
    }
}