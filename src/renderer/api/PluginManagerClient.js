/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class Plugin {

    search(keyword){}
    
    getReadMeFile(plugin) {}

    install(plugin) {}

    load(plugins) {}

    uninstall(plugin) {}
}


export default consumer.wrapper(new Plugin(), "pluginManager");