import * as RTE from 'fp-ts/ReaderTaskEither'

export interface ILogger {
  info: (...args: unknown[]) => any
  error: (...args: unknown[]) => any
  debug: (...args: unknown[]) => any
}

export type MlConfig = { token: string, baseUrl: string, apiVersion?: Date}
export type MlEnv = {
  config: MlConfig
  logger: ILogger
}

export type Effect<A> = RTE.ReaderTaskEither<MlEnv, Error, A>

/** YYYY-MM-DD*/
export type DateStr = string

/** YYYY-MM-DD HH:MM:SS */
export type DatetimeStr = string

export interface ILinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}
