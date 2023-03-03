/**
 * Utility functions
 *
 * @since 0.0.1
 */
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as qs from 'qs'
import { MlConfig } from './config'

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
export const mlRequest = <TRes>(config: MlConfig) => (opts: IRequestOpts, apiUrl: string) => {
  const res = pipe(
    fpAxios<TRes>(makeAxiosRequest(config, opts))(apiUrl),
    TE.mapLeft(e => cleanedUpAxiosError(e)),
    TE.map((resp) => resp.data)
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
export const runBatch = (config: MlConfig) => (reqs: Array<IBatchRequest>) => {
  const res = pipe(
    fpAxios<IBatchResponse>(makeAxiosRequest(config, {method: 'post', data: {requests: reqs}}))('api/batch'),
    TE.mapLeft(e => cleanedUpAxiosError(e)),
    TE.map((resp) => resp.data)
  )
  return res
}


/**
 * @since 0.0.6
 */
export const validateBatch = (b: IBatchResponse) => {

  if (b.failed > 0) {
    // const failed = pipe(b.responses, A.filter(e => e.code >= 300))
    const err = new Error(`${b.failed} batch failed out of ${b.total}`)
    return TE.left(err)
  } else {
    return TE.right(b)
  }
}