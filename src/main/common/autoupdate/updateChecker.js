// 更新检查器，来自 pigGo`
import { dialog, shell }    from 'electron'
import axios                from 'axios'
import { lt }               from 'semver'
import appConfig            from "@/main/common/config/appConfig.js";
import i18n                 from '@/main/common/i18n'
import logger               from '@/main/common/logger';
import Constant             from '@/main/common/Constant.js'


const repostoryName = "qiaolin-li/dubbo-desktop-manager"
const releaseUrl = `https://api.github.com/repos/${repostoryName}/releases/latest`
const releaseUrlBackup = `https://cdn.jsdelivr.net/gh/${repostoryName}/package.json`
const downloadUrl = `https://github.com/${repostoryName}/releases/latest`

class UpdateChecker {
  
  async checkVersion() {
    try {
      const res = await axios.get(releaseUrl);
      if (res.status === 200) {
        const releaseBody = res.data.body;
        const latest = res.data.name;
        const message = releaseBody ? i18n.t("version.message", {latest, releaseBody}) : i18n.t("version.simpleMessage", {latest});
        this.checkUpdate(latest, message);
      }
    } catch (err) {
      this.backupCheckUpdateUrl();
      logger.error(err)
    }
  }

  async backupCheckUpdateUrl() {
    try {
      const res = await axios.get(releaseUrlBackup);
      if (res.status === 200) {
        const latest = res.data.version || res.data.name
        this.checkUpdate(latest, i18n.t("version.simpleMessage", {latest}));
      }
    } catch (err) {
      logger.error(err)
    }
  }

  /**
   * 检查更新&&弹框告知用户新版本信息
   * @param {*} lastVersion 最后的版本
   * @param {*} message 更新信息
   */
  checkUpdate(lastVersion, message) {
    if (!this.compareVersion2Update(Constant.VERSION, lastVersion)) {
      return false;
    }

    // 跳过当前版本
    const key = `skip-version-${lastVersion.replace(/\./g, '-')}`;
    if (appConfig.getProperty(key)) {
      return;
    }

    dialog.showMessageBox({
      type: 'info',
      title: i18n.t("version.title"),
      buttons: [i18n.t("version.yes"), i18n.t("version.no")],
      message: message,
      checkboxLabel: i18n.t("version.noRemindCurrnetVersion"),
      checkboxChecked: false,
      cancelId: 1
    }).then(res => {
      if (res.response === 0) {
        shell.openExternal(downloadUrl)
      }
      appConfig.setProperty(key, res.checkboxChecked)
    }).catch(e => {
      logger.error(e)
    });
  }

  /**
   * 判断当前版本是否需要更新
   * @param {*} current 当前版本
   * @param {*} latest 最新版本
   * @returns 是否需要更新
   */
  compareVersion2Update(current, latest) {
    try {
      return lt(current, latest)
    } catch (e) {
      return false
    }
  }
}


export default new UpdateChecker();