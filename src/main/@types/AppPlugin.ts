import type DataSource from './DataSource';
import type { AppConfig, Constant, Logger, MainPlugin } from '../../../packages/plugin-api/main';

export type {
    AppConfig,
    Constant,
    DBUtils,
    I18nRegistrar,
    Logger,
    MainEntry,
    MainPlugin,
    PluginInstallable,
} from '../../../packages/plugin-api/main';

export type AppPlugin = import('../../../packages/plugin-api/main').MainPlugin;

declare module 'appMain' {
    const appMain: AppPlugin;
    export default appMain;
}

declare module 'constant' {
    const constant: Constant;
    export default constant;
}

declare module 'appConfig' {
    const appConfig: AppConfig;
    export default appConfig;
}

declare module 'logger' {
    const logger: Logger;
    export default logger;
}

export type { DataSource };
