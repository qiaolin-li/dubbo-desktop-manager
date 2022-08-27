export default {
    code: "zh-CN",
    name: "中文",
    base: {
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
        settings: "设置"
    },
    welcome: {
        productName: "Dubbo 桌面管理工具",
        version : "版本："
    },
    settings: {
        baseSettings: {
            title: "基本设置",
            language: "语言",
        },
        apply: "应用",
        invokerSettings : {
            title:"执行器设置",
            invokerType : "默认执行器类型",
            invokerTypeTips : "使用Java执行器时，请先安装Java环境，Java调用相对Telnet执行器较慢，但是Java调用返回的信息更加完整。",
        }
    },
    tab : {
        close : "关闭",
        closeOther : "关闭其他",
        closeAll : "关闭全部",
    },
    connect: {
        addConnect: "新增连接",
        name: "链接名称",
        address: "链接地址",
        sessionTimeout: "超时时间",
        save: "立即创建",
        namespaceId: "命名空间ID",
        validateMessage: {
            timeOutNotNull: "超时时间不能为空",
            inputNumber: "请输入数字",
            inputNumberRange: "必须大于10ms",
            inputName: "请输入链接名称",
            rangeLimit: "长度在 1 到 32 个字符",
            inputConnectionAddress: "请输入链接地址",
        },
        createSuccess:"新增连接成功!",
        updateSuccess:"修改连接成功!",
        searchContent: "搜一搜",
        refreshSuccess: "刷新服务列表完成",
        refreshError: "刷新服务列表失败！原因：{e}",
        confirmDeleteConnect: "此操作将永久删除改链接, 是否继续?"
    },
    dubbo: {
        serviceTab: {
            providerList: "提供者列表",
            consumerList: "消费者列表",
        },
        providePage: {
            address: "地址",
            application: "所属应用",
            version: "版本号",
            disabled: "禁用",
            methodCount: "方法数量",
            operate: "操作",
            disableTypeMap : {
                service: "服务维度",
                application: "应用维度"
            },
            call: "调用",
            callTitle: "调用 {address}",
            exportExcel:"导出Excel",
            selectExportDirectory : "选择导出目录",
            exportSuccess : "导出成功", 
            exportError : "导出失败, 原因:{}",
            serviceEnable : "服务维度-启用",
            serviceDisable : "服务维度-禁用",
            editConfiguration : "编辑服务动态配置",
        },

        consumerPage: {
            ip : "地址",
            application: "所属应用",
            version: "版本号",
            check: "检查",
            enable: "是否可用",
            timeout: "超时",
            retries: "重试",
            exportExcel:"导出Excel",
            selectExportDirectory : "选择导出目录",
            exportSuccess : "导出成功", 
            exportError : "导出失败, 原因:{}"

        },
        invokePage: {
            serviceName: "接口",
            application: "应用",
            address: "地址",
            generic: "泛化",
            version: "版本",
            dubboVersion: "Dubbo 版本",
            jarVersion: "Jar 版本",
            method: "方法",
            operate: "操作",
            call: "调用",
            calling: "调用中",
            generateParam: "生成参数",
            generateCommand: "生成命令",
            requestParam: "请求参数",
            requestParamStrategyTitle: "参数生成策略",
            paramGenerateStrategyDesc: "首先会使用上次调用成功的历史参数，如果没有，会尝试生成参数",
            format: "格式化",
            responseInfo: "响应参数",
            historyInvokeParamList: "历史调用参数",
            callParamError: "请求参数格式有误",
            callDubboServiceSuccess: "调用dubbo接口成功",
            callDubboServiceFail: "调用dubbo接口失败，原因：{e}",
            generateParamError: "无法生成参数！原因：{error}",
            invokeProgress: "正在调用..",
            cancelInvoke: "取消调用",
            invokeTimeOut: "调用Dubbo接口超时",
            notFoundJDK:"如果需要使用Java调用器，请先安装JDK",
        },
        telnetTerminal: {
            connecting: "正在连接 {ip} {port}",
            connectionTimeout: "连接超时，请检查网络! {ip} {port} ",
            connectionClosed: "连接断开，正在重新连接...",
        },
        configurationPage: {
            title : "配置信息",
            save : "保存配置",
            invalidFormat : "配置格式错误",
            saveSuccess:"保存成功"
        }
    },
    
}