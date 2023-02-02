/**
 * Utility functions
 *
 * @since 0.0.1
 */
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import qs from 'qs'
import { MlConfig, MlEnv } from './config'

/**
 * @since 0.0.1
 */
export const fpAxios = <T=any, >(options: AxiosRequestConfig) => (url: string) => {
  return TE.tryCatch( () => axios<T>(url, options), (x) => x as AxiosError<T>)
}

const makeAxiosRequest = (cfg: MlConfig, data: Partial<AxiosRequestConfig>): AxiosRequestConfig => {

  return {
    headers: {
      authorization: `Bearer ${cfg.token}`,
      'content-type': 'application/json',
    },
    baseURL: cfg.baseUrl,
    ...data
  }
}

/**
 * @since 0.0.1
 */
export type xhrMeth = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface IRequestOpts {
  method: xhrMeth
  params?: {[key: string]: any}
  data?: {[key: string]: any}
}

/**
 * @since 0.0.1
 */
export const cleanedUpAxiosError = <T>(err: AxiosError<T>) => {
  err.request = null
  err.config = undefined
  if (err.response) {
    err.response.request = null
  }
  return err
}

/**
 * @since 0.0.1
 */
export const mlRequest = <TRes>(opts: IRequestOpts, apiUrl: string) => {
  const res = pipe(
    RTE.ask<MlEnv>(),
    RTE.chainTaskEitherK(({ config }) => fpAxios<TRes>(makeAxiosRequest(config, opts))(apiUrl)),
    RTE.mapLeft(e => cleanedUpAxiosError(e)),
    RTE.map((resp) => resp.data)
  )
  return res
}

/**
 * @since 0.0.1
 */
export interface IBatchRequest {
  method: xhrMeth
  path: string
  body?: any
}

/**
 * @since 0.0.1
 */
export interface IBatchResponse {
  total: number
  successful: number
  failed: number
  responses: Array<{code: number, body: any}>
}

/**
 * @since 0.0.1
 */
export const mlBatch = (opts: IRequestOpts, apiUrl: string): E.Either<Error, IBatchRequest> => {
  const res = pipe(
    E.tryCatch( () => qs.stringify(opts.params, {encode: false}), E.toError),
    E.chain( p => E.of({method: opts.method, path: apiUrl + (p ? '?' + p : ''), body: opts.data}))
  )
  return res
}

/**
 * @since 0.0.1
 */
export const runBatch = (reqs: Array<IBatchRequest>) => {
  const res = pipe(
    RTE.ask<MlEnv>(),
    RTE.chainTaskEitherK(({ config }) => fpAxios<IBatchResponse>(makeAxiosRequest(config, {method: 'post', data: {requests: reqs}}))('api/batch')),
    RTE.mapLeft(e => cleanedUpAxiosError(e)),
    RTE.map((resp) => resp.data)
  )
  return res
}

