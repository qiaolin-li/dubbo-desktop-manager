
// 准备翻译的语言环境信息
let messages = {};
const files = import.meta.glob('./lang/*.js', { eager: true });
Object.keys(files).forEach((key) => {
    let optionKey = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.js')); //截取文件名称
    let message = files[key].default;
    messages[`${optionKey}`] = message;
})

export default messages;
