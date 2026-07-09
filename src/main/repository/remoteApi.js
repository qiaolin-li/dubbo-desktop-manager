import dataSourceRepository from "./DataSourceRepository";

/**
 * @param {import('@/main/AppCore').default} app 主进程核心对象
 */
export default (app) => {
	app.exportService("dataSourceRepository", dataSourceRepository);
};
