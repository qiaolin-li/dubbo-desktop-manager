{
    "name": "__PLUGIN_NAME__",
    "version": "0.1.0",
    "description": "__PLUGIN_TITLE__ plugin for Dubbo Desktop Manager.",
    "pluginNickName": "__PLUGIN_TITLE__",
    "main": "dist/main.js",
    "rendererMain": "dist/renderer.js",
    "i18nMain": "dist/i18n.js",
    "scripts": {
        "build": "webpack --mode production",
        "dev": "webpack --mode development --watch"
    },
    "dependencies": {},
    "devDependencies": {
        "@ddm-center/plugin-api": "^0.0.1",
        "css-loader": "^6.11.0",
        "vue": "^2.6.14",
        "vue-loader": "^15.11.1",
        "vue-style-loader": "^4.1.3",
        "vue-template-compiler": "^2.6.14",
        "webpack": "^5.92.0",
        "webpack-cli": "^5.1.4"
    },
    "engines": {
        "ddm": ">=1.1.0 <3.0.0"
    },
    "pluginSandbox": {
        "permissions": {
            "require": {
                "allow": []
            }
        }
    }
}
