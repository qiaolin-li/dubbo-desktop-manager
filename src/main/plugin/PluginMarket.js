class PluginMarket {
    getSearchResult(val) {
        // this.$http.get(`https://api.npms.io/v2/search?q=${val}`)
        this.$http.get(`https://registry.npmjs.com/-/v1/search?text=${val}`) // 调用npm的搜索api
            .then(res => {
                this.pluginList = res.data.objects.map(item => {
                    return this.handleSearchResult(item) // 返回格式化的结果
                })
                this.loading = false
            })
            .catch(err => {
                console.log(err)
                this.loading = false
            })
    }

    handleSearchResult(item) {
        const name = item.package.name.replace(/picgo-plugin-/, '')
        let gui = false
        if (item.package.keywords && item.package.keywords.length > 0) {
            if (item.package.keywords.includes('picgo-gui-plugin')) {
                gui = true
            }
        }
        return {
            name: name,
            author: item.package.author.name,
            description: item.package.description,
            logo: `https://cdn.jsdelivr.net/npm/${item.package.name}/logo.png`,
            config: {},
            homepage: item.package.links ? item.package.links.homepage : '',
            hasInstall: this.pluginNameList.some(plugin => plugin === item.package.name.replace(/picgo-plugin-/, '')),
            version: item.package.version,
            gui,
            ing: false // installing or uninstalling
        }
    }
}