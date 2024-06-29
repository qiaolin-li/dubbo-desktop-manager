import EventEmitter from "events";
import appConfig from "@/main/common/config/appConfig.js";
import { Notification } from 'electron';

class PluginContext extends EventEmitter {

    constructor() {
        super();
        this.config = appConfig
    }

    notify(title, message) {
        new Notification({
            title: title,
            body: message
        }).show()
    }

}

export default PluginContext;