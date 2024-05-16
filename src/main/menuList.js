import { app, Menu, shell } from 'electron'
import windowHolder         from '@/main/common/holder/WindowHolder.js';
import i18n                 from '@/main/common/i18n'

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: i18n.t("menu.addConnect") ,
        click: async () => {
          let window = windowHolder.getWindow();
          window.webContents.send('openAddConnectDialogEvent')
          
        }
      },
      {
        label: i18n.t("menu.settings") ,
        click: async () => {
          let window = windowHolder.getWindow();
          window.webContents.send('openSettingsTabEvent')
          // windowHolder.createSettingWindow();
        }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'GitHub',
        click: async () => {
          shell.openExternal("https://github.com/qiaolin-li/dubbo-desktop-manager")
        }
      }, 
      {
        label: i18n.t("menu.reportBug"),
        click: async () => {
          shell.openExternal("https://github.com/qiaolin-li/dubbo-desktop-manager/issues/new")
        }
      }, 
      {
        label: 'Gitee',
        click: async () => {
          shell.openExternal("https://gitee.com/qiaolin/dubbo-desktop-manager")
        }
      }
    ]
  }
]




export default template;