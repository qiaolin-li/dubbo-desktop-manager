import { clipboard }    from 'electron';

/**
 * 应用剪贴板桥接类，提供了与系统剪贴板交互的方法
 */
class AppClipboardBridge {

    /**
     * 读取剪贴板文本内容
     * @returns {string} 剪贴板中的文本内容
     */
    readText() {
        return clipboard.readText();
    }

    /**
     * 将文本写入剪贴板
     * @param {string} text - 要写入剪贴板的文本
     */
    writeText(text) {
        clipboard.writeText(text);
    }
}

export default new AppClipboardBridge();