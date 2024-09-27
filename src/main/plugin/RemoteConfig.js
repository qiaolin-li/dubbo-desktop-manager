import axios                from 'axios'


const configUrl = "https://cdn.jsdelivr.net/npm/ddm-plugin-config/config.json"

class RemoteConfig {
    constructor() {
        axios.get(configUrl).then(res => {
            this.config = res.data;
        })
    }

    async getConfig() {
        return this.config;
    }

}

export default new RemoteConfig()