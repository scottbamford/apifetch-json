import { FetchCache } from './FetchCache';

/**
 *  Implementation of ApiFetchCache that stores cache results in memory for the lifetime of the object.
 *  
 *  This implementation will only cache GET requests, and will raise expire events automatically whenever a POST, PUT, PATCH, or DELETE is made
 *  to clear all URLs that TODO
 *  
 *  For more complicated use cases you can use kirei-ApiFetch-reduxcache or your own cache solution.
 */
export class MemoryFetchCache implements FetchCache {
    private items: Array<CacheItem>;

    constructor() {
        this.items = [];
    }

    /**
     * Generate a cacheId that can be used to uniquely identify this cached item.
     * @param values
     */
    private generateCacheId(...values: Array<any>) {
        let ret = '';
        for (let value of values) {
            let sValue = '';
            if (value) {
                if (typeof value === 'string') {
                    sValue = value;
                } else {
                    sValue = JSON.stringify(value);
                }
            }

            ret += `[${sValue}]`;
        }

        return ret;
    }

    /**
     * Read the entry for id from the cache, returning null if it is not found.
     * @param id
     */
    readFromCache(input: string, init: RequestInit): any {
        const cacheId = this.generateCacheId(input, init && init.body);

        let cachedItems = this.items.filter((item: CacheItem) => item.id == cacheId);
        if (cachedItems.length) {
            let cachedItem = cachedItems[0];
            if (cachedItem) {
                if (cachedItem.expireAt && cachedItem.expireAt > new Date(Date.now())) {
                    return cachedItem.data;
                }
            }
        }

        return null; 
    }

    /**
     * Store data in the cache for id.
     * @param id
     * @param data
     * @param options
     */
    storeInCache(input: string, init: RequestInit, result: any, options: ApiFetchCacheOptions): void {
        const cacheId = this.generateCacheId(input, init && init.body);
        this.items = [
            ...this.items,
            {
                id: cacheId,
                data: result,
                expireAt: options.expireAt,
                expireOnEvents: options.expireOnEvents
            } as CacheItem
        ];
    }

    /**
     * Remove all entries from the cache that are listining to any of the provided events.
     * @param events
     */
    raiseExpireEvents(...events: Array<string>): void {
        this.items = [
            ...this.items.filter(item => {
                if (!item.expireOnEvents) {
                    return true;
                }

                // If any of the events being raised effect this item then exclude it from the results so it gets removed from the cache.
                for (let i = 0; i < events.length; ++i) {
                    var event = events[i];
                    if (item.expireOnEvents.filter(it => it == event).length) {
                        return false;
                    }
                }

                return true;
            })
        ];
    }
}

export interface CacheItem {
    id: string,
    data: any,
    expireAt?: Date,
    expireOnEvents: Array<string>
}

/**
 * Options used when storing in the cache.
 */
export interface ApiFetchCacheOptions {
    expireOnEvents?: Array<string>,
    expireAt?: Date
}