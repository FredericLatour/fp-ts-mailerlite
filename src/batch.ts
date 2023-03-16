/**
 * Batch functions
 *
 * @since 0.0.7
 */
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as qs from 'qs'
import { ExternalError, MlConfig, MlError } from './config'
import { cleanedUpAxiosError, fpAxios, IRequestOpts, makeAxiosRequest, makeExternalError, xhrMeth } from './utils'

/** @since 0.0.7 */
export interface IBatchRequest {
  method: xhrMeth
  path: string
  body?: any
}

/** @since 0.0.7 */
export interface IBatchResponse<T=any> {
  total: number
  successful: number
  failed: number
  responses: Array<{ code: number; body: T }>
}



/** @since 0.0.7 */
export const mlBatch = (opts: IRequestOpts, apiUrl: string): E.Either<ExternalError, IBatchRequest> => {
  const res = pipe(
    E.tryCatch(() => qs.stringify(opts.params, { encode: false }), E.toError),
    E.mapLeft( e => makeExternalError(e, 'Error while stringifying params', {opts})),
    E.chain((p) =>
      E.of({ method: opts.method, path: apiUrl + (p ? '?' + p : ''), body: opts.data })
    )
  )
  return res
}

/** @since 0.0.1 */
export const runBatch = <T=any>(config: MlConfig) => (reqs: Array<IBatchRequest>) => {
  const res = pipe(
    fpAxios<IBatchResponse<T>>(makeAxiosRequest(config, { method: 'post', data: { requests: reqs } }))(
      'api/batch'
    ),
    TE.mapLeft((e) => cleanedUpAxiosError(e)),
    TE.map((resp) => resp.data)
  )
  return res
}

/** @since 0.0.7 */
export const validateBatch = (b: IBatchResponse) => {
  if (b.failed > 0) {
    // const err = new Error(`${b.failed} batch failed out of ${b.total} `)
    const err: MlError = {
      kind: 'BatchError',
      message: `${b.failed} batch failed out of ${b.total}`,
      data: b
    }
    return TE.left(err)
  } else {
    return TE.right(b)
  }
}

/** @since 0.0.7 */
export const batchList =
  <T>(config: MlConfig) =>
  (list: T[], fn: (field: T) => E.Either<MlError, IBatchRequest>) => {
    return pipe(
      list,
      A.traverse(E.Applicative)(fn),
      TE.fromEither,
      TE.chainW(runBatch(config)),
      TE.chainW(validateBatch)
    )
  }

/** @since 0.0.7 */
export const batchListInChunks =
  <T, B=any>(config: MlConfig) =>
  (chunkLength: number, list: T[], fn: (field: T) => E.Either<MlError, IBatchRequest>) => {
    const runAndValidateBatch = (reqs: IBatchRequest[]) =>
      pipe(reqs, runBatch<B>(config), TE.chainW(validateBatch))
    return pipe(
      list,
      A.traverse(E.Applicative)(fn),
      E.map(A.chunksOf(chunkLength)),
      TE.fromEither,
      TE.map(A.map(runAndValidateBatch)),
      TE.map(A.sequence(TE.ApplicativeSeq)),
      TE.flatten
    )
  }

