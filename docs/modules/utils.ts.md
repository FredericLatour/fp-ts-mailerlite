---
title: utils.ts
nav_order: 5
parent: Modules
---

## utils overview

Utility functions

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [IBatchRequest (interface)](#ibatchrequest-interface)
  - [IBatchResponse (interface)](#ibatchresponse-interface)
  - [cleanedUpAxiosError](#cleanedupaxioserror)
  - [fpAxios](#fpaxios)
  - [mlBatch](#mlbatch)
  - [mlRequest](#mlrequest)
  - [runBatch](#runbatch)
  - [xhrMeth (type alias)](#xhrmeth-type-alias)

---

# utils

## IBatchRequest (interface)

**Signature**

```ts
export interface IBatchRequest {
  method: xhrMeth
  path: string
  body?: any
}
```

Added in v0.0.1

## IBatchResponse (interface)

**Signature**

```ts
export interface IBatchResponse {
  total: number
  successful: number
  failed: number
  responses: Array<{ code: number; body: any }>
}
```

Added in v0.0.1

## cleanedUpAxiosError

**Signature**

```ts
export declare const cleanedUpAxiosError: <T>(err: AxiosError<T, any>) => AxiosError<T, any>
```

Added in v0.0.1

## fpAxios

**Signature**

```ts
export declare const fpAxios: <T = any>(
  options: AxiosRequestConfig
) => (url: string) => TE.TaskEither<AxiosError<T, any>, AxiosResponse<T, any>>
```

Added in v0.0.1

## mlBatch

**Signature**

```ts
export declare const mlBatch: (opts: IRequestOpts, apiUrl: string) => E.Either<Error, IBatchRequest>
```

Added in v0.0.1

## mlRequest

**Signature**

```ts
export declare const mlRequest: <TRes>(
  opts: IRequestOpts,
  apiUrl: string
) => RTE.ReaderTaskEither<MlEnv, AxiosError<TRes, any>, TRes>
```

Added in v0.0.1

## runBatch

**Signature**

```ts
export declare const runBatch: (
  reqs: Array<IBatchRequest>
) => RTE.ReaderTaskEither<MlEnv, AxiosError<IBatchResponse, any>, IBatchResponse>
```

Added in v0.0.1

## xhrMeth (type alias)

**Signature**

```ts
export type xhrMeth = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
```

Added in v0.0.1
