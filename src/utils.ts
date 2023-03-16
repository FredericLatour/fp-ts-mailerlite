/**
 * Utility functions
 *
 * @since 0.0.1
 */
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { ExternalError, MlConfig, MlError, UnprocessableError } from './config'

/** @since 0.0.1 */
export const fpAxios =
  <T = any>(options: AxiosRequestConfig) =>
  (url: string) => {
    return TE.tryCatch(
      () => axios<T>(url, options),
      (x) => x as AxiosError<T>
    )
  }

export const makeAxiosRequest = (
  cfg: MlConfig,
  data: Partial<AxiosRequestConfig>
): AxiosRequestConfig => {
  return {
    headers: {
      authorization: `Bearer ${cfg.token}`,
      'content-type': 'application/json',
    },
    baseURL: cfg.baseUrl,
    ...data,
  }
}

/** @since 0.0.1 */
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

/** @since 0.0.1 */
export type xhrMeth = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface IRequestOpts {
  method: xhrMeth
  params?: { [key: string]: any }
  data?: { [key: string]: any }
}

/** @since 0.0.7 */
export const cleanedUpAxiosError = <T>(err: AxiosError<T>) => {
  let nErr: MlError

  const cleanAx = (err: AxiosError<T>) => {
    const res = {
      ...err,
      request: null,
      config: null,
      Headers: null,
      response: { ...err.response, headers: null, /*config: null,*/ request: null },
    }
    return res
  }

  switch (err.response?.status) {
    case 400:
    case 404:
    case 422:
      nErr = {
        kind: 'UnprocessableError',
        code: err.response.status,
        message: err.response.statusText,
        data: err.response?.data,
        initialError: cleanAx(err),
      } as UnprocessableError
      break

    default:
      nErr = {
        kind: 'ExternalError',
        code: err.code ?? 0,
        message: err.message,
        initialError: cleanAx(err),
      } as ExternalError
      break
  }
  return nErr
}

/** @since 0.0.7 */
export const mlRequest =
  <TRes>(config: MlConfig) =>
  (opts: IRequestOpts, apiUrl: string) => {
    const res = pipe(
      fpAxios<TRes>(makeAxiosRequest(config, opts))(apiUrl),
      TE.mapLeft((e) => cleanedUpAxiosError(e)),
      TE.map((resp) => resp.data)
    )
    return res
  }

/** @since 0.0.7 */
export const makeExternalError = (
  err: Error,
  message: string,
  data: any = undefined,
  code = 0
): ExternalError => {
  return {
    kind: 'ExternalError',
    code,
    message,
    data,
    initialError: err,
  }
}
