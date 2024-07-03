/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class Plugin {

    search(keyword){}
    
    install(plugins) {}

    load(plugins) {}

    uninstall(plugin) {}
}


export default consumer.wrapper(new Plugin(), "pluginManager");