import URI from "urijs";


class UrlUtils {
    parseURL(url) {
        let urlData = URI(url);
        let query = urlData.query();
        let d = query.split("&");
        let params = {};
        for (let i = 0; i < d.length; i++) {
            let dd = d[i].split("=");
            if (dd && dd.length == 2) {
                params[dd[0]] = dd[1]
            }
        }
    
        return {
            protocol: urlData.protocol(),
            host: urlData.hostname(),
            port: urlData.port(),
            query: urlData.query(),
            params: params,
        };
    }
}


export default new UrlUtils();