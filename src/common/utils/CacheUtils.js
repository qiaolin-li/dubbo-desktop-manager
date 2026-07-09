/**
 * 缓存工具类，防止浪费
 */
class CacheUtils {

    memoizeWithTTL(fn, ttl) {
        const cache = new Map();

        return function(...args) {
            const key = JSON.stringify(args);
            const now = Date.now();

            if (cache.has(key)) {
                const { value, expire } = cache.get(key);
                // 没过期，直接给
                if (now < expire) {
                    return value;
                } 
                cache.delete(key); // 过期了，删掉
            }

            const result = fn(...args);
            cache.set(key, { value: result, expire: now + ttl });
            return result;
        };
    }   

}


export default new CacheUtils();