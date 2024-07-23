
class DubboConfigrationUtils {

    addOrUpdateConfigration(doc, address) {
        let find = false;
        for (let i = 0; i < doc.configs.length; i++) {
            let config = doc.configs[i];
            let { side, addresses } = config;

            if (side != "provider") continue;

            if (addresses && addresses.length == 1 && addresses[0] == address) {
                config.enabled = true;
                if (!config.parameters)  config.parameters = [];

                config.parameters.disabled = true;
                find = true;
                break;
            }
        }

        if (!find) {
            doc.configs.push({
                addresses: [ address ],
                enabled: true,
                parameters: {
                    disabled: true
                },
                side: "provider"
            });
        }

        return doc;
    }



    deleteConfigration(doc, address) {
        for (let i = 0; i < doc.configs.length; i++) {
            let config = doc.configs[i];
            let {
                side,
                addresses
            } = config;

            if (side != "provider") {
                continue;
            }

            // 不是禁用的规则，忽略
            if (!config.parameters || !config.parameters.disabled) {
                continue;
            }

            for (let i = 0; i < addresses.length; i++) {
                if (addresses[i] === address) {
                    addresses.splice(i, 1);
                }
            }

            if (addresses.length == 0) {
                doc.configs.splice(i, 1);
            }

        }

        if (doc.configs.length == 0) {
            return {};
        }

        return doc;
    }

}

export default new DubboConfigrationUtils();