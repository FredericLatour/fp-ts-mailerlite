---
title: groups.ts
nav_order: 2
parent: Modules
---

## groups overview

Groups API
For mor information about groups, see [How to create and use groups](https://www.mailerlite.com/help/how-to-create-and-use-groups)

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [groups](#groups)
  - [create](#create)
  - [list](#list)
- [utils](#utils)
  - [ICreateParams (interface)](#icreateparams-interface)
  - [IDelParams (interface)](#idelparams-interface)
  - [IGetParams (interface)](#igetparams-interface)
  - [IGroupData (interface)](#igroupdata-interface)
  - [IListParams (interface)](#ilistparams-interface)
  - [IListResult (interface)](#ilistresult-interface)
  - [IMeta (interface)](#imeta-interface)
  - [IUpdateParams (interface)](#iupdateparams-interface)
  - [del](#del)
  - [get](#get)
  - [update](#update)

---

# groups

## create

Create a group!

**Signature**

```ts
export declare const create: (params: ICreateParams) => Effect<ICreateResult>
```

**Example**

```ts
import { groups, MlEnv } from '@frederic-latour/fp-ts-mailerlite'
import { pipe } from 'fp-ts/function'

const deps: MlEnv = {
  config: {
    token: process.env['ML_TOKEN'] ?? '',
    baseUrl: 'https://connect.mailerlite.com/',
  },
}

async function test() {
  const res = await pipe(deps, groups.create({ name: 'test_group' }))()
  return res
}
console.log(test())
```

Added in v0.0.1

## list

List All groups

**Signature**

```ts
export declare const list: (params: IListParams) => Effect<IListResult>
```

**Example**

```ts
import { groups, MlEnv } from '@frederic-latour/fp-ts-mailerlite'
import { pipe } from 'fp-ts/function'

const deps: MlEnv = {
  config: {
    token: process.env['ML_TOKEN'] ?? '',
    baseUrl: 'https://connect.mailerlite.com/',
  },
}

async function test() {
  const res = await pipe(deps, groups.list({ filter: { name: 'fltest' } }))()
  return res
}
console.log(test())
```

Added in v0.0.1

# utils

## ICreateParams (interface)

Parmameters for creating a group

**Signature**

```ts
export interface ICreateParams {
  /** Group name - max 255 chars */
  name: string
}
```

Added in v0.0.1

## IDelParams (interface)

Parmameters for deleting a group

**Signature**

```ts
export interface IDelParams {
  /** Group Id */
  id: string
}
```

Added in v0.0.1

## IGetParams (interface)

Parmameters for getting a group by its id

**Signature**

```ts
export interface IGetParams {
  /** Group Id */
  id: string
}
```

Added in v0.0.1

## IGroupData (interface)

**Signature**

```ts
export interface IGroupData {
  id: string
  name: string
  active_count: number
  sent_count: number
  opens_count: number
  open_rate: {
    float: number
    string: string
  }
  clicks_count: number
  click_rate: {
    float: number
    string: string
  }
  unsubscribed_count: number
  unconfirmed_count: number
  bounced_count: number
  junk_count: number
  created_at: Date
}
```

Added in v0.0.1

## IListParams (interface)

list parameters

**Signature**

```ts
export interface IListParams {
  limit?: number
  page?: number
  sort?: `${SortOrder}${SortFields}`
  filter?: {
    name: string
  }
}
```

Added in v0.0.1

## IListResult (interface)

Result returned by list

**Signature**

```ts
export interface IListResult {
  data: Array<IGroupData>
  links: ILinks
  meta: IMeta
}
```

Added in v0.0.1

## IMeta (interface)

**Signature**

```ts
export interface IMeta {
  current_page: number
  from: number
  last_page: number
  links: Array<{ url: string | null; label: string; active: boolean }>
  path: string
  per_page: number
  to: number
  total: number
}
```

Added in v0.0.1

## IUpdateParams (interface)

**Signature**

```ts
export interface IUpdateParams {
  /** Group id */
  id: string
  /** new group name */
  name: string
}
```

Added in v0.0.1

## del

**Signature**

```ts
export declare const del: (params: IDelParams) => Effect<IDelResult>
```

Added in v0.0.1

## get

**Signature**

```ts
export declare const get: (params: IGetParams) => Effect<IGetResult>
```

Added in v0.0.1

## update

**Signature**

```ts
export declare const update: (params: IUpdateParams) => Effect<IUpdateResult>
```

Added in v0.0.1
