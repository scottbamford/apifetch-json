/**
 * Options used when storing in the cache.
 */
export interface FetchCacheOptions {
    expireOnEvents?: Array<string>,
    expireAt?: Date
}