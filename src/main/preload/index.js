import appIpc                   from "@/main/preload/AppIpc.js";
import appDialog                from "@/main/preload/appDialog.js";
import appShell                 from "@/main/preload/appShell.js";
import appClipboard             from "@/main/preload/appClipboard.js";
import appWindow                from "@/main/preload/appWindow.js";
import appTelnet                from "@/main/preload/appTelnet.js";

import appConfig                from "@/main/common/config/appConfig"


const bindMethods = (obj) => {
    const proto = Object.getPrototypeOf(obj);
    for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== 'constructor' && typeof obj[key] === 'function') {
            obj[key] = obj[key].bind(obj);
        }
    }
    return obj;
}


export default {

    appIpc: bindMethods(appIpc),

    appDialog: bindMethods(appDialog),

    appShell: bindMethods(appShell),

    appClipboard: bindMethods(appClipboard),

    appWindow: bindMethods(appWindow),

    appTelnet: bindMethods(appTelnet),

    appConfig: bindMethods(appConfig),
}

