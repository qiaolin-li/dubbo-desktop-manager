#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TEMPLATE_ROOT = path.join(__dirname, '..', 'templates');

/**
 * 只解析脚手架需要的少量参数，避免引入额外命令行依赖。
 */
function parseArgs(argv) {
    const result = {
        name: null,
        language: null,
        force: false,
    };

    argv.forEach(arg => {
        if (arg === '--force' || arg === '-f') {
            result.force = true;
            return;
        }

        if (arg.startsWith('--language=')) {
            result.language = arg.slice('--language='.length);
            return;
        }

        if (arg === '--js') {
            result.language = 'js';
            return;
        }

        if (arg === '--ts') {
            result.language = 'ts';
            return;
        }

        if (!result.name) {
            result.name = arg;
        }
    });

    return result;
}

/**
 * 没有传插件名时，用交互问题补齐。
 */
function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * DDM 插件默认使用 ddm-plugin- 前缀，scope 包名保留用户输入。
 */
function normalizePluginName(name) {
    const normalized = name.trim().toLowerCase().replace(/[^a-z0-9-_./@]/g, '-').replace(/--+/g, '-');
    if (!normalized) {
        throw new Error('插件名称不能为空');
    }
    return normalized.startsWith('ddm-plugin-') || normalized.startsWith('@') ? normalized : `ddm-plugin-${normalized}`;
}

/**
 * 根据包名生成一个适合展示在插件列表里的默认名称。
 */
function toTitle(name) {
    const rawName = name.includes('/') ? name.split('/').pop() : name;
    return rawName.replace(/^ddm-plugin-/, '').split(/[-_]/).filter(Boolean).map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(' ');
}

/**
 * 模板文件统一用 .tpl 后缀，复制时替换占位符并去掉后缀。
 */
function copyTemplate(sourceDir, targetDir, variables) {
    fs.mkdirSync(targetDir, { recursive: true });

    fs.readdirSync(sourceDir, { withFileTypes: true }).forEach(entry => {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetName = entry.name.replace(/\.tpl$/, '');
        const targetPath = path.join(targetDir, targetName);

        if (entry.isDirectory()) {
            copyTemplate(sourcePath, targetPath, variables);
            return;
        }

        let content = fs.readFileSync(sourcePath, 'utf8');
        Object.keys(variables).forEach(key => {
            content = content.replace(new RegExp(`__${key}__`, 'g'), variables[key]);
        });
        fs.writeFileSync(targetPath, content);
    });
}

/**
 * 创建 mixed 插件工程：主进程、渲染进程和 i18n 入口一起生成。
 */
async function main() {
    const args = parseArgs(process.argv.slice(2));
    const inputName = args.name || await ask('插件名称: ');
    const pluginName = normalizePluginName(inputName);
    const language = (args.language || 'js').toLowerCase();

    if (!['js', 'javascript'].includes(language)) {
        throw new Error('当前脚手架只支持创建 JavaScript 插件工程，暂不支持 TypeScript 模板');
    }

    const templateName = 'mixed-js';
    const targetDir = path.resolve(process.cwd(), pluginName.includes('/') ? pluginName.split('/').pop() : pluginName);

    if (fs.existsSync(targetDir) && !args.force && fs.readdirSync(targetDir).length > 0) {
        throw new Error(`目标目录已存在且不为空: ${targetDir}`);
    }

    copyTemplate(path.join(TEMPLATE_ROOT, templateName), targetDir, {
        PLUGIN_NAME: pluginName,
        PLUGIN_TITLE: toTitle(pluginName),
    });

    console.log(`已创建 ${pluginName}`);
    console.log(`cd ${path.basename(targetDir)}`);
    console.log('npm install');
    console.log('npm run build');
}

main().catch(error => {
    console.error(error.message);
    process.exit(1);
});
