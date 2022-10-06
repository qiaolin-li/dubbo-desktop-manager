/**
 * 路由表
 */
import defaultRoutes from './modules/default.js';
import settings from './modules/setting.js';

// 获取业务模块下的路由
export function getModulesRouter() {
  //  收集模块下router.js数据
  const context = require.context('@/renderer/views/', true, /router\.js$/);
  let modulesRouter = [];
  context.keys().forEach((key) => {
    // 解析module
    const router = context(key).default;
    // 动态添加router
    modulesRouter = modulesRouter.concat(router);
  });
  return modulesRouter;
}

// 路由导出
export default [...defaultRoutes, ...getModulesRouter(), ...settings];
