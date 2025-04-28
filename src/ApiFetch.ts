/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { FetchCache } from "./FetchCache";
import { MemoryFetchCache } from './MemoryFetchCache';
import { FetchCacheOptions } from './FetchCacheOptions';
import { RequestInitFunction } from './RequestInitFunction';

/**
 * Class that wraps fetch() to provide an easy to read API for reading and writing JSON objects over HTTP(S).
 * 
 * Constructor accepts:
 *      Default init used for all requests that can be passed to the constructor (e.g. for authetnication by passing 'Authorization': `Bearer ${jwtToken}` in the headers.)
 *      Cache used to look up the value before a request, and to store the value following the requests.  Default is to use a MemoryFetchCache instance only valid for the life of
 *      this object.
 *      
 * Returned values have aready had json() called on them.  If we get an error making the request we throw an exception so the return value can awlways be
 * expected to be the decoded json if an exception wasn't thrown.
 */
export class ApiFetch {
    private defaultInit: RequestInit;
    private cache: FetchCache | undefined;

    /**
     * Constructor.
     * @param init Init applied to all requests before applying any passed in init for the request.
     * @param cache Cache used to look up the value before a request, and to store the value following the requests.
     */
    constructor(init?: RequestInit | RequestInitFunction | undefined, cache?: FetchCache) {
        // Set defaultInit to our built in defaults combined with the passed in init.
        this.defaultInit = this.combineRequestInit({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }, init);

        // Set the cache.
        this.cache = cache || new MemoryFetchCache();
    }

    /**
     * Combine RequestInit objects together to form a final RequestInit object for a request.
     * @param oldInit
     * @param newInit
     */
    private combineRequestInit(...inits: Array<RequestInit | RequestInitFunction | undefined>): RequestInit {
        let ret: RequestInit = {};

        for (const init of inits) {
            if (!init) {
                continue;
            }

            if (typeof init === 'function') {
                ret = init(ret);
            } else {
                const { headers, ...rest } = init;

                ret = {
                    ...ret,
                    ...rest,
                    headers: !headers ? ret.headers : {
                        ...ret.headers,
                        ...headers
                    }
                }
            }
        }

        return ret;
    }

    /**
     * Fetch json from an API using HTTP GET.
     * @param input
     * @param init
     */
    public async get<T = any>(input: string, init?: RequestInit | RequestInitFunction, cacheOptions?: FetchCacheOptions): Promise<T> {
        return this.fetch(
            input,
            {
                method: 'GET',
                ...(init ? init : {})
            },
            cacheOptions
        );
    }

    /**
     * Fetch json from an API using HTTP POST passing body as json encoded body.
     * @param input
     * @param body
     * @param init
     */
    public async post<T = any, Body = any>(input: string, body?: Body, init?: RequestInit | RequestInitFunction, cacheOptions?: FetchCacheOptions): Promise<T> {
        return this.fetch(
            input,
            {
                method: 'POST',
                body: body ? JSON.stringify(body) : undefined,
                ...(init ? init : {})
            },
            cacheOptions
        );
    }

    /**
     * Fetch json from an API using HTTP PUT passing body as json encoded body.
     * @param input
     * @param body
     * @param init
     */
    public async put<T = any, Body = any>(input: string, body?: Body, init?: RequestInit | RequestInitFunction, cacheOptions?: FetchCacheOptions): Promise<T> {
        return this.fetch(
            input,
            {
                method: 'PUT',
                body: body ? JSON.stringify(body) : undefined,
                ...(init ? init : {})
            },
            cacheOptions
        );
    }

    /**
     * Fetch json from an API using HTTP PATCH passing body as json encoded body.
     * @param input
     * @param body
     * @param init
     */
    public async patch<T = any, Body = any>(input: string, body?: Body, init?: RequestInit | RequestInitFunction, cacheOptions?: FetchCacheOptions): Promise<T> {
        return this.fetch(
            input,
            {
                method: 'PATCH',
                body: body ? JSON.stringify(body) : undefined,
                ...(init ? init : {})
            },
            cacheOptions
        );
    }

    /**
     * Fetch json from an API using HTTP DELETE passing body as json encoded body.
     * @param input
     * @param body
     * @param init
     */
    public async delete<T = any, Body = any>(input: string, body?: Body, init?: RequestInit | RequestInitFunction, cacheOptions?: FetchCacheOptions): Promise<T> {
        return this.fetch(
            input,
            {
                method: 'DELETE',
                body: body ? JSON.stringify(body) : undefined,
                ...(init ? init : {})
            },
            cacheOptions
        );
    }

    /**
    * Wrapper around fetch() that supports jwt tokens, caching, and default urls as configured by setApiFetchDefaultOptions() and the passed in apiOptions.
    *
    * Instead of returning the response as fetch() would, response.json() is called and the result of that returned (cast as a T via Promise<T>).
    *
    * If there is an error or the response as not OK we will throw an exception.
    * @param input
    * @param init
    * @param apiOptions
    */
    public async fetch<T = any>(input: string /*RequestInfo*/, init?: RequestInit | RequestInitFunction, cacheOptions?: FetchCacheOptions): Promise<T> {
        // Prepare the final init data.
        const finalInit = this.combineRequestInit(this.defaultInit, init);

        // Check the cache for an existing entry.
        // NOTE we only use the cache if cacheOptions is passed, otherwise we never check or store a request in the cache.
        if (cacheOptions && this.cache) {
            const cachedResult = this.cache.readFromCache(input, finalInit);
            if (cachedResult) {
                return cachedResult;
            }
        }

        // If we get here we are going to make an actual call to the api as we didn't find it in the cache.
        //


        // Make the fetch() request.
        const response = await fetch(input, finalInit);
        if (!response.ok) {
            let result: any;

            // If we have content and a json body, try to decode it.
            // NOTE ASP.NET Core now doesn't set Content-Length when returning 400 errors, so we've had to go to reading
            // the body content without checking the content length moving forward.
            try {
                result = await response.json();
            } catch (error) {
                // If we can't decode the body, just throw the error.
                throw `Server indicated an error by returning a status of ${response.status}`;
            }

            // If we have an error message, throw that.
            if (result.error) {
                if (result.error.description) {
                    throw new Error(result.error.description);
                }

                throw new Error(result.error);
            } else if (result.errorMessage) {
                throw new Error(result.errorMessage);
            } else {
                throw `Server indicated an error by returning a status of ${response.status}`;
            }
        }

        // Special case for those parts of rest apis that return no body content (.e.g. saving successfully with a POST).
        if (response.headers.get('Content-Length') === '0') {
            return null as any;
        }

        const result = await response.json();

        // Store the result in the cache if we can.
        if (cacheOptions && this.cache) {
            this.cache.storeInCache(input, finalInit, result, cacheOptions);
        }

        return result;
    }

    /**
     * Raise expire events in the cache.
     * @param defaults
     */
    raiseExpireEvents(...events: Array<string>) {
        if (!this.cache) {
            return;
        }

        this.cache.raiseExpireEvents(...events);
    }
}
