// 更新检查器，来自 pigGo`
import {
  dialog,
  shell
} from 'electron'
import axios from 'axios'
import pkg from '../../../package.json'
import {
  lt
} from 'semver'
import appConfig from "@/main/repository/appConfig.js";
import i18n from '@/i18n'

const currentVersion = pkg.version
const repostoryName = "qiaolin-li/dubbo-desktop-manager"
const releaseUrl = `https://api.github.com/repos/${repostoryName}/releases/latest`
const releaseUrlBackup = `https://cdn.jsdelivr.net/gh/${repostoryName}/package.json`
const downloadUrl = `https://github.com/${repostoryName}/releases/latest`

const checkVersion = async () => {
  // 日后在加入是否跳过当前版本

  let res = null;
  try {
    res = await axios.get(releaseUrl);
    if (res.status === 200) {
      let releaseBody = res.data.body;
      let latest = res.data.name;
      let message = releaseBody ? i18n.t("version.message", {latest, releaseBody}) 
                                : i18n.t("version.simpleMessage", {latest});
      checkUpdate(latest, message);
    }
  } catch (err) {
    backupCheckUpdateUrl();
    console.log(err)
  }

}

async function backupCheckUpdateUrl() {
  let res = null;
  try {
    res = await axios.get(releaseUrlBackup);
    if (res.status === 200) {
      const latest = res.data.version || res.data.name
      checkUpdate(latest, i18n.t("version.simpleMessage", {latest}));
    }
  } catch (err) {
    console.log(err)
  }
}

function checkUpdate(lastVersion, message) {
  const result = compareVersion2Update(currentVersion, lastVersion)
  if (!result) {
    return false;
  }

  let key = `skip-version-${lastVersion.replace(/\./g, '-')}`;
  let skipVersion = appConfig.getProperty(key);

  // 跳过当前版本
  if (skipVersion) {
    return;
  }
  dialog.showMessageBox({
    type: 'info',
    title: i18n.t("version.title"),
    buttons: [i18n.t("version.yes"), i18n.t("version.no")],
    message: message,
    checkboxLabel: i18n.t("version.noRemindCurrnetVersion"),
    checkboxChecked: false
  }).then(res => {
    if (res.response === 0) {
      shell.openExternal(downloadUrl)
    }
    appConfig.setProperty(key, !res.checkboxChecked)
  }).catch(e => {
    console.log(e)
  });

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