import pkg from '../../../../package.json'
import http from 'http';

/**
 * 主进程和渲染进程通过HTTP协议通信
 */
class HttpServer {
    startListener(apiExportor) {
        // 创建服务器
        http.createServer(async (request, response) => {  
            const moduleName = request.url.substring('/api/'.length).split('/')[0];
            const method = request.url.substring('/api/'.length).split('/')[1];
            let data = '';
            request.on('data', chunk => data += chunk);
            request.on('end', async () => {
                response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});    
                response.write(JSON.stringify(await apiExportor.invokeMethod(moduleName, method,JSON.parse(data))));        
                response.end();
            })
        }).listen(pkg.port);
            
        console.log(`Server running at http://127.0.0.1:${pkg.port}/`);
    }

}

export default HttpServer;