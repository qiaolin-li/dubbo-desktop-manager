/* eslint-disable no-unused-vars */
import consumer from './ApiConsumer';

/**
 * @type {import('@/main/repository/DataSourceRepository.js').default }
 */
export default consumer.createProxy("dataSourceRepository");