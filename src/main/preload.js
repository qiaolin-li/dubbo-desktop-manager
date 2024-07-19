/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { CustomTitlebar, TitlebarColor } = require('custom-electron-titlebar')
// const { contextBridge } = require('electron')
import constant      from '@/main/common/Constant.js'
import appConfig     from "@/main/common/config/appConfig"

window.constant = constant;
window.appConfig = appConfig;

window.addEventListener('DOMContentLoaded', () => {
	// eslint-disable-next-line no-new
	new CustomTitlebar({
		backgroundColor: TitlebarColor.fromHex('#f8f8f8'),
		menuTransparency: 0.2,
		// icon: path.resolve('example/assets', 'logo.svg'),
		// icons: path.resolve('example/assets', 'icons.json'),
	})
})
