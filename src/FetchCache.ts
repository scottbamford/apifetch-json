import { FetchCacheOptions } from './FetchCacheOptions';

/**
 *  Interface for a cache service that can be used by ApiFetch() to read and store cachable results.
 *  
 *  MemoryFetchCache is the default FetchCache provided by and used by this library.
 *  
 *  You can also create your own provide your own or use one from an appropriate module for your stack, e.g. kirei-ApiFetch-cache-redux.
 */
export interface FetchCache {
    /**
     * Read the entry for id from the cache, returning null if it is not found.
     * @param id
     */
    readFromCache(input: string, init: RequestInit): any,

    /**
     * Store data in the cache for id.
     * @param id
     * @param data
     * @param options
     */
    storeInCache(input: string, init: RequestInit, result: any, options: FetchCacheOptions): void,

    /**
     * Remove all entries from the cache that are listining to any of the provided events.
     * @param events
     */
    raiseExpireEvents(...events: Array<string>): void
}
