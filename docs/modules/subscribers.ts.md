---
title: subscribers.ts
nav_order: 4
parent: Modules
---

## subscribers overview

Subscribers API
For mor information about subscribers, see [Subscriber statuses explained - MailerLite](https://www.mailerlite.com/help/subscriber-statuses-explained)

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [IDelParams (interface)](#idelparams-interface)
  - [IFetchParams (interface)](#ifetchparams-interface)
  - [IListParams (interface)](#ilistparams-interface)
  - [IListResult (interface)](#ilistresult-interface)
  - [IMeta (interface)](#imeta-interface)
  - [ISubscriber (interface)](#isubscriber-interface)
  - [IUpsertParams (interface)](#iupsertparams-interface)
  - [IUpsertResult (interface)](#iupsertresult-interface)
  - [del](#del)
  - [fetch](#fetch)
  - [list](#list)
  - [upsert](#upsert)
  - [upsertBatch](#upsertbatch)

---

# utils

## IDelParams (interface)

Parmameters DELETE

**Signature**

```ts
export interface IDelParams {
  /** Subscriber Id */
  id: string
}
```

Added in v0.0.1

## IFetchParams (interface)

Parmameters FETCH (GET)

**Signature**

```ts
export interface IFetchParams {
  /** Subscriber Id or Email */
  id: string
}
```

Added in v0.0.1

## IListParams (interface)

Parameters GET (List)

**Signature**

```ts
export interface IListParams {
  /** default to 25 */
  limit?: number
  /** Defaults to first page. Cursor value available in response body */
  cursor?: string
  sort?: `${SortOrder}${SortFields}`
  filter?: {
    [k in Filters]?: string
  }
}
```

Added in v0.0.1

## IListResult (interface)

**Signature**

```ts
export interface IListResult<TCustomFields> {
  data: Array<ISubscriber<TCustomFields>>
  links: ILinks
  meta: IMeta
}
```

Added in v0.0.1

## IMeta (interface)

**Signature**

```ts
export interface IMeta {
  path: string
  per_page: number
  next_cursor: string | null
  prev_cursor: string | null
}
```

Added in v0.0.1

## ISubscriber (interface)

**Signature**

```ts
export interface ISubscriber<TCustomFields> {
  id: string
  email: string
  status: string
  source: string
  sent: number
  opens_count: number
  clicks_count: number
  open_rate: number
  click_rate: number
  ip_address: string | null
  subscribed_at: DatetimeStr
  unsubscribed_at: DatetimeStr | null
  created_at: DatetimeStr
  updated_at: DatetimeStr
  fields: IStandardFields & TCustomFields
  groups: Array<string>
  opted_in_at: DatetimeStr | null
  optin_ip: DatetimeStr | null
}
```

Added in v0.0.1

## IUpsertParams (interface)

Parameters UPSERT (POST)

**Signature**

```ts
export interface IUpsertParams<TCustomFields> {
  email: string
  fields?: Partial<IStandardFields & TCustomFields>
  groups?: Array<string>
  status?: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'junk'
  subscribed_at?: DatetimeStr
  ip_address?: string | null
  opted_in_at?: DatetimeStr | null
  optin_ip?: DatetimeStr | null
  unsubscribed_at?: DatetimeStr | null
}
```

Added in v0.0.1

## IUpsertResult (interface)

**Signature**

```ts
export interface IUpsertResult<TCustomFields> {
  data: ISubscriber<TCustomFields>
}
```

Added in v0.0.1

## del

**Signature**

```ts
export declare const del: (params: IDelParams) => Effect<IDelResult>
```

Added in v0.0.1

## fetch

**Signature**

```ts
export declare const fetch: <TCustomFields>(params: IFetchParams) => Effect<IFetchResult<TCustomFields>>
```

Added in v0.0.1

## list

**Signature**

```ts
export declare const list: <TCustomFields>(params: IListParams) => Effect<IListResult<TCustomFields>>
```

Added in v0.0.1

## upsert

**Signature**

```ts
export declare const upsert: <TCustomFields>(
  params: IUpsertParams<TCustomFields>
) => Effect<IUpsertResult<TCustomFields>>
```

Added in v0.0.1

## upsertBatch

**Signature**

```ts
export declare const upsertBatch: <TCustomFields>(
  params: IUpsertParams<TCustomFields>
) => E.Either<Error, IBatchRequest>
```

Added in v0.0.1
