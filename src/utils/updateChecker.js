// 更新检查器，来自 pigGo`
import {
  dialog,
  shell
} from 'electron'
import axios from 'axios'
import pkg from '../../package.json'
import {
  lt
} from 'semver'

const version = pkg.version
const repostoryName = "qiaolin-li/dubbo-desktop-manager"
const releaseUrl = `https://api.github.com/repos/${repostoryName}/releases/latest`
const releaseUrlBackup = `https://cdn.jsdelivr.net/gh/${repostoryName}/@latest/package.json`
const downloadUrl = `https://github.com/${repostoryName}/releases/latest`

const checkVersion = async () => {
  // 日后在加入是否跳过当前版本
  let showTip = true
  if (showTip) {
    let res = null;
    try {
      res = await axios.get(releaseUrl).catch(async () => {
        const result = await axios.get(releaseUrlBackup)
        return result
      })
    } catch (err) {
      console.log(err)
    }
    if (res.status === 200) {
      const latest = res.data.version || res.data.name
      const result = compareVersion2Update(version, latest)
      if (result) {
        dialog.showMessageBox({
          type: 'info',
          title: '发现新版本',
          buttons: ['Yes', 'No'],
          message: `发现新版本${latest}，更新了很多功能，是否去下载最新的版本？`,
          checkboxLabel: '以后不再提醒',
          checkboxChecked: false
        }).then(res => {
          if (res.response === 0) { // if selected yes
            shell.openExternal(downloadUrl)
          }
        })
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

// if true -> update else return false
const compareVersion2Update = (current, latest) => {
  try {
    // if (latest.includes('beta')) {
    //   const isCheckBetaUpdate = db.get('settings.checkBetaUpdate') !== false
    //   if (!isCheckBetaUpdate) {
    //     return false
    //   }
    // }
    return lt(current, latest)
  } catch (e) {
    return false
  }
}

export default checkVersion