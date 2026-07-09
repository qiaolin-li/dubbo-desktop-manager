import constant          from '@/main/common/Constant';
import { Logger }        from '@/main/common/logger';
import http              from 'http';

const logger = new Logger("ddm-HttpServer");

/**
 * 主进程和渲染进程通过HTTP协议通信
 */
class HttpServer {
    /**
     * 写入本地 HTTP 调用需要的 CORS 响应头。
     * @param {http.ServerResponse} response 响应对象
     */
    writeCorsHeaders(response) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    }

    /**
     * 启动监听
     * @param {import('@/main/api/ApiExportor.js').default} apiExportor 
     */
    startListener(apiExportor) {
        
        // 创建服务器
        http.createServer(async (request, response) => {
            this.writeCorsHeaders(response);

            if (request.method === 'OPTIONS') {
                response.writeHead(204);
                response.end();
                return;
            }

            if (request.method !== 'POST') {
                response.writeHead(405, {'Content-Type': 'application/json;charset=utf-8'});
                response.write(JSON.stringify({
                    success: false,
                    errorMessage: `unsupported request method: ${request.method}`,
                }));
                response.end();
                return;
            }

            const moduleName = request.url.substring('/api/'.length).split('/')[0];
            const method = request.url.substring('/api/'.length).split('/')[1];
            let data = '';
            request.on('data', chunk => data += chunk);
            request.on('end', async () => {
                response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                let params;
                try {
                    params = JSON.parse(data);
                } catch(e) {
                    response.write(JSON.stringify({
                        success: false,
                        errorMessage: "请求参数错误, " + e
                    }));
                    response.end();
                    return;
                }
                response.write(JSON.stringify(await apiExportor.invokeMethod(moduleName, method, params)));
                response.end();
            });
        }).listen(constant.API_HTTP_PORT);
            
        logger.info(`Server running at http://127.0.0.1:${constant.API_HTTP_PORT}/`);
    }

}

export default HttpServer;
