import lowdb from "lowdb"
import FileSync from "lowdb/adapters/FileSync.js"
import consumer from "@/main/communication/consumer.js";
import constant from "@/utils/Constant.js";

let db = null;

if (process.type != "renderer") {
    const adapter = new FileSync(constant.APPLICATION_CONFIG_FILE)
    db = lowdb(adapter)

    // Read data from JSON file, this will set db.data content
    db.read()
}


/**
 * 设置一个配置
 * @param {配置key} key 
 * @param {配置对象} value 
 * @returns 
 */
function setProperty(key, value) {
    return db.read().set(key, value).write()
}

function hasProperty(key) {
    return db.read().has(key).value();
}

/**
 * 获取一个配置
 * @param {配置key} key 
 * @returns  配置对象
 */
function getProperty(key) {
    return db.read().get(key).value()
}

let data = {
    name: "appConfig",
    setProperty,
    hasProperty,
    getProperty,
    install(communication) {
        communication.registry(data);
    }
}

export default consumer.wrapper(data);