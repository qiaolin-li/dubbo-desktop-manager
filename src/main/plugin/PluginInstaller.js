import spawn from 'cross-spawn'
const { Notification } = require('electron')
import constant from "@/main/common/Constant.js";


class PluginInstaller {

    execCommand(cmd, modules, where) {
        return new Promise((resolve, reject) => {

            try {

                // spawn的命令行参数是以数组形式传入
                // 此处将命令和要安装的插件以数组的形式拼接起来
                // 此处的cmd指的是执行的命令，比如install\uninstall\update
                let args = [cmd].concat(modules).concat('--color=always').concat('--save')
                
                // 执行npm，并通过 cwd指定执行的路径——配置文件所在文件夹
                const npm = spawn('npm', args, {
                    cwd: where
                }) 

                let output = ''
                npm.stdout.on('data', (data) => {
                    output += data // 获取输出日志
                }).pipe(process.stdout)

                npm.stderr.on('data', (data) => {
                    output += data // 获取报错日志
                }).pipe(process.stderr)

                npm.on('close', (code) => {
                    if (!code) {
                        // 如果没有报错就输出正常日志
                        resolve({
                            code: 0,
                            data: output
                        }) 
                    } else {
                        reject({
                            code: code,
                            data: output
                        }) // 如果报错就输出报错日志
                    }
                })

                // for users who haven't installed node.js
                npm.on('error', (err) => {
                    resolve({
                        code: 0,
                        data: err
                    }) 
                })
                
            } catch (error) {
                console.log('出错了', error)
            }
        })
    }

    async install(plugins) {
        const result = await this.execCommand('install', plugins, constant.APPLICATION_PLUGINS_DIR)

        const title = !result.code ? '插件安装成功' : '插件安装失败'
        const body = !result.code ? plugins : `插件安装失败，失败码为${result.code}，错误日志为${result.data}`;
        new Notification({
            title: title,
            body: body
          }).show()

          return result;
    }
}

export default PluginInstaller;