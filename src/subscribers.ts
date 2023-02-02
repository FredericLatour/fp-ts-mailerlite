/**
 * Subscribers API
 * For mor information about subscribers, see [Subscriber statuses explained - MailerLite](https://www.mailerlite.com/help/subscriber-statuses-explained)
 *
 * @since 0.0.1
 */
import * as E from 'fp-ts/Either'
import { DatetimeStr, Effect, ILinks } from './config'
import { IBatchRequest, mlBatch, mlRequest } from './utils'


interface IStandardFields {
    city: string | null
    company: string | null
    country: string | null
    last_name: string | null
    name: string | null
    phone: string | null
    state: string | null
    z_i_p: string | null,
}

/**
 * @since 0.0.1
 */
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
  ip_address: string | null,
  subscribed_at: DatetimeStr
  unsubscribed_at: DatetimeStr | null
  created_at: DatetimeStr
  updated_at: DatetimeStr
  fields: IStandardFields & TCustomFields
  groups: Array<string>
  opted_in_at: DatetimeStr | null
  optin_ip: DatetimeStr | null
}  

/**
 * @since 0.0.1
 */
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
 * @since 0.0.1
 */
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

/**
 * @since 0.0.1
 */
export interface IListResult<TCustomFields> {
  data: Array<ISubscriber<TCustomFields>>
  links: ILinks
  meta: IMeta
}

/**
 * @since 0.0.1
 */
export const list = <TCustomFields>(params: IListParams): Effect<IListResult<TCustomFields>> => {
  return mlRequest({method: 'GET', params}, 'api/subscribers')
}


/**
 * Parameters UPSERT (POST)
 * @since 0.0.1
 */
export interface IUpsertParams<TCustomFields> {
  email: string
  fields?: Partial<IStandardFields & TCustomFields>
  groups?: Array<string>
  status?: 'active' | 'unsubscribed' | 'unconfirmed' | 'bounced' | 'junk'
  subscribed_at?: DatetimeStr
  ip_address?: string | null,
  opted_in_at?: DatetimeStr | null
  optin_ip?: DatetimeStr | null
  unsubscribed_at?: DatetimeStr | null
}

/**
 * @since 0.0.1
 */
export interface IUpsertResult<TCustomFields> {
  data: ISubscriber<TCustomFields>
}

/**
 * @since 0.0.1
 */
export const upsert = <TCustomFields>(params: IUpsertParams<TCustomFields>): Effect<IUpsertResult<TCustomFields>> => {
  return mlRequest({method:'POST', data: params}, 'api/subscribers')
}

/**
 * @since 0.0.1
 */
export const upsertBatch = <TCustomFields>(params: IUpsertParams<TCustomFields>): E.Either<Error, IBatchRequest> => {
  return mlBatch({method:'POST', data: params}, 'api/subscribers')
}


/**
 * Parmameters FETCH (GET)
 * @since 0.0.1
 */
export interface IFetchParams {
  /** Subscriber Id or Email */
  id: string
}
interface IFetchResult<TCustomFields> {
  data: ISubscriber<TCustomFields>
}

/**
 * @since 0.0.1
 */
export const fetch = <TCustomFields>(params: IFetchParams): Effect<IFetchResult<TCustomFields>> => {
  return mlRequest({method:'GET'}, `api/subscribers/${params.id}`)
}


/**
 * Parmameters DELETE
 * @since 0.0.1
 */
export interface IDelParams {
  /** Subscriber Id */
  id: string
}
interface IDelResult {}


/**
 * @since 0.0.1
 */
export const del = (params: IDelParams): Effect<IDelResult> => {
  return mlRequest({method:'DELETE'}, `api/subscribers/${params.id}`)
}
