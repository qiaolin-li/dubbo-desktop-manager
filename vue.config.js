module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      //  externals: ['!art-template'],
      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      nodeModulesPath: ['./node_modules'],
      builderOptions: {
        "productName": 'Dubbo-Desktop-Manager',
        "appId": "indi.qiaolin.dubbo.desktop.manager", 
        "win": {
          "target": "nsis"
        },
        "nsis": {
          "oneClick": false,
          "allowToChangeInstallationDirectory": true
        }
      }
    }
  }

}