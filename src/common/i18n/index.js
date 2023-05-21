
// 准备翻译的语言环境信息
let messages = {};
//第一个参数表示相对的文件目录，第二个参数表示是否包括子目录中的文件，第三个参数表示引入的文件匹配的正则表达式。
const files = require.context('./lang/', false, /\.js$/);
files.keys().forEach((key) => {
    let optionKey = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.js')); //截取文件名称
    let message = require(`./lang/${optionKey}.js`).default;
    messages[`${optionKey}`] = message;
})

export default messages;