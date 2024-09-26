import axios                from 'axios'


const configUrl = "http://127.0.0.1:9876/aaa"

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