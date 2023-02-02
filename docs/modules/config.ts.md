---
title: config.ts
nav_order: 1
parent: Modules
---

## config overview

Configuration related

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [DateStr (type alias)](#datestr-type-alias)
  - [DatetimeStr (type alias)](#datetimestr-type-alias)
  - [Effect (type alias)](#effect-type-alias)
  - [ILinks (interface)](#ilinks-interface)
  - [MlConfig (type alias)](#mlconfig-type-alias)
  - [MlEnv (type alias)](#mlenv-type-alias)

---

# utils

## DateStr (type alias)

Date as string: YYYY-MM-DD

**Signature**

```ts
export type DateStr = string
```

Added in v0.0.1

## DatetimeStr (type alias)

Datetime as string: YYYY-MM-DD HH:MM:SS

**Signature**

```ts
export type DatetimeStr = string
```

Added in v0.0.1

## Effect (type alias)

**Signature**

```ts
export type Effect<A> = RTE.ReaderTaskEither<MlEnv, Error, A>
```

Added in v0.0.1

## ILinks (interface)

**Signature**

```ts
export interface ILinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}
```

Added in v0.0.1

## MlConfig (type alias)

**Signature**

```ts
export type MlConfig = { token: string; baseUrl: string; apiVersion?: Date }
```

Added in v0.0.1

## MlEnv (type alias)

**Signature**

```ts
export type MlEnv = {
  config: MlConfig
}
```

Added in v0.0.1
