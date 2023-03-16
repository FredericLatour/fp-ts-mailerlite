/**
 * Subscribers API For mor information about subscribers, see [Subscriber statuses explained -
 * MailerLite](https://www.mailerlite.com/help/subscriber-statuses-explained)
 *
 * @since 0.0.1
 */
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { batchListInChunks, IBatchRequest, IBatchResponse, mlBatch } from './batch'
import { DatetimeStr, ILinks, MlConfig, MlError } from './config'
import { mlRequest } from './utils'

interface IStandardFields {
  city: string | null
  company: string | null
  country: string | null
  last_name: string | null
  name: string | null
  phone: string | null
  state: string | null
  z_i_p: string | null
}

/** @since 0.0.1 */
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

/** @since 0.0.1 */
export interface IMeta {
  path: string
  per_page: number
  next_cursor: string | null
  prev_cursor: string | null
}

type Filters = 'group' | 'automation' | 'status' | 'form' | 'site' | 'page' | 'import' | 'post'
type SortOrder = '+' | '-'
type SortFields = 'created_at' | 'id' | 'subscribed_at' | 'unsubscribed_at' | 'email'

/**
 * Parameters GET (List)
 *
 * @since 0.0.1
 */
export interface IListParams {
  /** Default to 25 */
  limit?: number
  /** Defaults to first page. Cursor value available in response body */
  cursor?: string
  sort?: `${SortOrder}${SortFields}`
  filter?: {
    [k in Filters]?: string
  }
}

/** 
 * Response from @link(List) 
 * @since 0.0.7 */
export interface IListResponse<TCustomFields> {
  data: Array<ISubscriber<TCustomFields>>
  links: ILinks
  meta: IMeta
}

/** 
 * Create a list of fields. _Remarks_ Since Mailerlite does not have an api allowing creating
 * multiple fields at once, we are batching the creation of each field in the list.
 *
 * @since 0.0.7
 * @category Subscribers
 * @example
 *   import { subscribers, MlEnv } from '@frederic-latour/fp-ts-mailerlite'
 *   import { pipe } from 'fp-ts/function'
 *
 *   type CustomFields = {purchases: number}
 *   const cfg = {
 *     token: process.env['ML_TOKEN'],
 *     baseUrl: 'https://connect.mailerlite.com/',
 *   }
 *
 *   async function test() {
 *     const params: subscribers.IListParams = { filter: { group: 5 }, sort: '+email' }
 *
 *     return await pipe(params, subscribers.list<CustomFields>(cfg))()
 *   }
 *   console.log(test())
 * */
export const list =
  <TCustomFields>(config: MlConfig) =>
  (params: IListParams): TE.TaskEither<MlError, IListResponse<TCustomFields>> => {
    return mlRequest<IListResponse<TCustomFields>>(config)(
      { method: 'GET', params },
      'api/subscribers'
    )
  }

/**
 * Parameters UPSERT (POST)
 *
 * @since 0.0.1
 */
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

/** @since 0.0.1 */
export interface IUpsertResponse<TCustomFields> {
  data: ISubscriber<TCustomFields>
}

/** @since 0.0.1 */
export const upsert =
  <TCustomFields>(config: MlConfig) =>
  (params: IUpsertParams<TCustomFields>): TE.TaskEither<MlError, IUpsertResponse<TCustomFields>> => {
    return mlRequest<IUpsertResponse<TCustomFields>>(config)(
      { method: 'POST', data: params },
      'api/subscribers'
    )
  }

/** @since 0.0.1 */
export const upsertBatch = <TCustomFields>(
  params: IUpsertParams<TCustomFields>
): E.Either<MlError, IBatchRequest> => {
  return mlBatch({ method: 'POST', data: params }, 'api/subscribers')
}

/**
 * Upsert a list of subscribers 
 * 
 * _remarks_ Mailerlite does not provide any api to upsert a list of
 * subscribers. This function relies on their batching feature (ability to batch multiple api in one
 * call). However batching is limited to 50 api calls at once which is quite low when you need to
 * update hundreds of subscribers. The function will transparently call multiple batch in order to
 * accomodate more than 50 subscribers. Beware that the batch api is quite slow. Depending on how
 * you are updating your subscribers and how many of them you are updating, you have to ensure to
 * handle a proper timeout.
 *
 * @since 0.0.6
 */
export const upsertList =
  <TCustomFields>(config: MlConfig) =>
  (subscriberList: IUpsertParams<TCustomFields>[]): TE.TaskEither<MlError, IBatchResponse[]> => {
    return batchListInChunks<IUpsertParams<TCustomFields>>(config)(50, subscriberList, upsertBatch)
  }

/**
 * Parmameters FETCH (GET)
 *
 * @since 0.0.1
 */
export interface IFetchParams {
  /** Subscriber Id or Email */
  id: string
}
interface IFetchResponse<TCustomFields> {
  data: ISubscriber<TCustomFields>
}

/** @since 0.0.1 */
export const fetch =
  <TCustomFields>(config: MlConfig) =>
  (params: IFetchParams): TE.TaskEither<MlError, IFetchResponse<TCustomFields>> => {
    return mlRequest<IFetchResponse<TCustomFields>>(config)(
      { method: 'GET' },
      `api/subscribers/${params.id}`
    )
  }

/** @since 0.0.5 */
export const fetchBatch = (params: IFetchParams): E.Either<MlError, IBatchRequest> => {
  return mlBatch({ method: 'GET', data: params }, `api/subscribers/${params.id}`)
}

/**
 * Parmameters DELETE
 *
 * @since 0.0.1
 */
export interface IDelParams {
  /** Subscriber Id or email */
  id: string
}
interface IDelResponse {}

/** @since 0.0.1 */
export const del =
  (config: MlConfig) =>
  (params: IDelParams): TE.TaskEither<MlError, IDelResponse> => {
    return mlRequest<IDelResponse>(config)({ method: 'DELETE' }, `api/subscribers/${params.id}`)
  }

/** @since 0.0.5 */
export const delBatch = (params: IDelParams): E.Either<MlError, IBatchRequest> => {
  return mlBatch({ method: 'DELETE', data: params }, `api/subscribers/${params.id}`)
}

/**
 * delete a list of subscribers
 * _remarks_ Mailerlite does not provide any api to delete a list of
 * subscribers. This function relies on their batching feature (ability to batch multiple api in one
 * call). However batching is limited to 50 api calls at once which is quite low when you need to
 * update hundreds of subscribers. The function will transparently call multiple batch in order to
 * accomodate more than 50 subscribers. Beware that the batch api is quite slow. Depending on 
 * how many of them you are deleting, you have to ensure to
 * handle a proper timeout.
 *
 * @since 0.0.6
 */
export const delList =
  (config: MlConfig) =>
  (subscriberList: IDelParams[]): TE.TaskEither<MlError, IBatchResponse[]> =>
    batchListInChunks<IDelParams>(config)(50, subscriberList, delBatch)
