import pluginManager from './index'


export default  (app) => {
    app.registry("pluginManager", pluginManager);
}