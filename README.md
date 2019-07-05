# ApiFetch
ApiFetch is a fetch() wrapper that provides an easy to read API for reading and writing JSON objects over HTTP(S) and REST apis.

ApiFetch provides methods for the HTTP commands:
* get()
* post()
* put()
* patch()
And a generic
* fetch()

Each method can have its return type set (in Typescript) which will be deserialized from the 
servers result:
```ts
let myModel = apiFetch.get<MyModel>('https://.../');
```

You can pass an object in that will be seralized as the body of the request:
```ts
let animal = { name: 'frog', color: 'blue' };
let myModel = apiFetch.post<MyModel>('https://.../', animal);
```

The API will be familiar for anyone who is has used fetch() before, but with a lot of the boiler plate removed.

## Installation

Install with npm:

```shell
npm install guid-string
```

Or with yarn:

```shell
yarn add guid-string
```

## Basic Usage

### Import
```ts
import { ApiFetch } from 'apifetch';
```

### Get

get() will fetch() the passed in URL with the HTTP GET method and return the deserilized json object from the result.

```ts
let api = new ApiFetch();
let myModel = api.get<MyModel>('https://.../');
```

### Post

post() will fetch() the passed in URL with the HTTP POST method, passing a JSON serizlied version of the
passed in body object as the requests body and return the deserilized json object from the result.
```ts
let animal = { name: 'frog', color: 'blue' };
let api = new ApiFetch();
let myModel = api.post<MyModel>('https://.../', animal);
```

### Put

put() will fetch() the passed in URL with the HTTP PUT method, passing a JSON serizlied version of the
passed in body object as the requests body and return the deserilized json object from the result.
```ts
let animal = { name: 'frog', color: 'blue' };
let api = new ApiFetch();
let myModel = api.put<MyModel>('https://.../', animal);
```

### Patch

patch() will fetch() the passed in URL with the HTTP PATCH method, passing a JSON serizlied version of the
passed in body object as the requests body and return the deserilized json object from the result.
```ts
let animal = { name: 'frog', color: 'blue' };
let api = new ApiFetch();
let myModel = api.patch<MyModel>('https://.../', animal);
```

### Delete

delete() will fetch() the passed in URL with the HTTP DELETE method, passing a JSON serizlied version of the
passed in body object as the requests body and return the deserilized json object from the result.
```ts
let animal = { name: 'frog', color: 'blue' };
let api = new ApiFetch();
let myModel = api.delete<MyModel>('https://.../', animal);
```

### Fetch

fetch() gives you full access to pass your own parameters to fetch including setting up your own RequestInit for init,
and will return the deserilized json object from the result.
```ts
let api = new ApiFetch();
let myModel = apiFetch.fetch<MyModel>('https://.../', { method: 'POST', headers: {/*...*/}, body: '...'});
```

## Authorization and Other Defaults

ApiFetch's constructor accepts an optional RequestInit that will be applied to all requests made
by the class.  This is very useful to use to default headers for authorization or other information that
should be passed to each call.

Example for authorization:

```ts
let api = new ApiFetch({
        headers: {
            'Authorization': `Bearer ${userState.token}`
        }
    });

// Later in the code...


api.get('https://...'); // Will pass the previously configured Authorization header.
```

## Caching

ApiFetch's constructor also accepts optional FetchCatch object that will can be used to
store the results of cachable requests for the life of the ApiFetch object.

ApiFetch comes with MemoryFetchCache an implementation of FetchCache that stored cached values in memory.

```ts
let cache = new MemoryFetchCache();

let api = new ApiFetch(init, cache);
```

You can then specify which items should be cached and for how long when you make calls:

```ts
api.get('https://...', { expireAt: new Date('2020-01-01')}); // If we call the same URL again it will use the cached results until they expire.
```

It is often more expire cached responses when events happen (e.g. when you post changes to the server) rather than
at a time, this can be acheived by passing an array of string event names to expireOnEvents:

```ts
api.get('https://...', { expireOnEvents: ['model-changed', 'game-over']}); // Will be cached until 'model-changed' or 'game-over' events are triggered.
```

You can raise an event using the raiseExpireEvents() method:
```ts
api.raiseExpireEvents('game-over', 'user-changed'); // Will remove all cached items that expire on either the event 'game-over' or 'user-changed'.
```

## Custom Caches

While the MemoryFetchCache class is useful for basic caching, you sometimes want to provide your own cache
object that provides your own storage or logic (e.g. using Redux for cached values or persisting values to localStorage).

To do this you can simply implement the FetchCache interface and pass your custom class as the FetchCache to the ApiFetch constructor:

```ts
class CustomFetchCache {
    /**
     * Read the entry for id from the cache, returning null if it is not found.
     * @param id
     */
    readFromCache(input: string, init: RequestInit): any {
		// Custom code here.
	}

    /**
     * Store data in the cache for id.
     * @param id
     * @param data
     * @param options
     */
    storeInCache(input: string, init: RequestInit, result: any, options: FetchCacheOptions): void {
		// Custom code here.
	}

    /**
     * Remove all entries from the cache that are listining to any of the provided events.
     * @param events
     */
    raiseExpireEvents(...events: Array<string>): void {
		// Custom code here.
	}
}

let cache = new CustomFetchCache();
let api = new ApiFetch(init, cache);
```

## Javascript Usage

ApiFetch works just as well with Javascript as Typescript.  All you need to do is
remove the type information from the above examples.

Here are the basic usage examples in plain Javascript:

### Import
```ts
import { ApiFetch } from 'apifetch';
```


### Get

```js
var api = new ApiFetch();
var myModel = api.get('https://.../');
```

### Post

```js
var animal = { name: 'frog', color: 'blue' };
var api = new ApiFetch();
var myModel = api.post('https://.../', animal);
```

### Put

```js
var animal = { name: 'frog', color: 'blue' };
var api = new ApiFetch();
var myModel = api.put('https://.../', animal);
```

### Patch

```js
var animal = { name: 'frog', color: 'blue' };
var api = new ApiFetch();
var myModel = api.patch('https://.../', animal);
```

### Delete

```js
var animal = { name: 'frog', color: 'blue' };
var api = new ApiFetch();
var myModel = api.delete('https://.../', animal);
```

### Fetch

```js
var api = new ApiFetch();
var myModel = apiFetch.fetch<MyModel>('https://.../', { method: 'POST', headers: {/*...*/}, body: '...'});
```

## Typescript

This project is written in typescript and comes with its own bindings.

## License

Licensed under the MIT license.