const fs = require('fs');
const path = require('path');

exports.default = async function (context) {
    // 获取打包后的 locales 文件夹路径
    const localesDir = path.join(context.appOutDir, 'locales');

    // 定义你想【保留】的语言包文件名
    const keepLocales = ['zh-CN.pak', 'en-US.pak', 'de-DE.pak', 'es-ES.pak', 'fr-FR.pak', 'ja-JP.pak', 'ko-KR.pak'];

    if (fs.existsSync(localesDir)) {
        const files = fs.readdirSync(localesDir);

        files.forEach((file) => {
            // 如果不在保留列表中，并且是 .pak 文件，就删掉它
            if (!keepLocales.includes(file) && file.endsWith('.pak')) {
                try {
                    fs.unlinkSync(path.join(localesDir, file));
                } catch (err) {
                    console.error(`删除语言包失败: ${file}`, err);
                }
            }
        });
        console.log(`\n[优化完成] 已成功清理其余语言包，仅保留了: ${keepLocales.join(', ')}\n`);
    }
};