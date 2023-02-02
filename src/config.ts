/**
 * Configuration related
 *
 * @since 0.0.1
 */
import * as RTE from 'fp-ts/ReaderTaskEither'

/**
 * @since 0.0.1
 */
export type MlConfig = { token: string, baseUrl: string, apiVersion?: Date}

/**
 * @since 0.0.1
 */
export type MlEnv = {
  config: MlConfig
}

/**
 * @since 0.0.1
 */
export type Effect<A> = RTE.ReaderTaskEither<MlEnv, Error, A>


/**
 * Date as string: YYYY-MM-DD
 * @since 0.0.1
 */
export type DateStr = string

/**
 * Datetime as string: YYYY-MM-DD HH:MM:SS
 * @since 0.0.1
 */
export type DatetimeStr = string

/**
 * @since 0.0.1
 */
export interface ILinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}
