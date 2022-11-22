import apiExporter from './ApiExportor';

//第一个参数表示相对的文件目录，第二个参数表示是否包括子目录中的文件，第三个参数表示引入的文件匹配的正则表达式。
const context = require.context('@/main/', true, /remoteApi\.js$/);
context.keys().forEach((key) => {
    let modules = context(key).default;
    modules.forEach(module => {
        apiExporter.registry(module.target, module.name);
        console.log(`API Exportor module: ${module.name}`);
    });
})


export default apiExporter;