
class PluginManager {

    constructor () {
        // list就是插件列表。以对象形式呈现。
        this.list = {} // 初始化插件列表为{}
    }
  
    // 插件注册的入口
    register (id, plugin) {
      // 如果插件没有提供id，则不予注册
      if (!id) throw new TypeError('id is required!')
      // 如果插件没有handle的方法，则不予注册
      //if (typeof plugin.handle !== 'function') throw new TypeError('plugin.handle must be a function!')
      // 如果插件的id重复了，则不予注册
      // if (this.list[id]) throw new TypeError(`${this.name} duplicate id: ${id}!`)
      this.list[id] = plugin
    }
  
    // 通过插件ID获取插件
    get (id){
      return this.list[id]
    }

    // 通过插件ID删除插件
    remove (id){
      delete this.list[id]
    }
  
    // 获取插件列表
    getList (){
      return Object.keys(this.list).map((item) => this.list[item])
    }
  
    // 获取插件ID列表
    getIdList () {
      return Object.keys(this.list)
    }

    
  }

export default new PluginManager();