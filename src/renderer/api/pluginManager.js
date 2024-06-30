/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class Plugin {
    async install(plugins) {}

    async load(plugins) {}
}


export default consumer.wrapper(new Plugin(), "pluginManager");