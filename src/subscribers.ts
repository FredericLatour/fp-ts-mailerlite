/**
 * Subscribers API
 * For mor information about subscribers, see [Subscriber statuses explained - MailerLite](https://www.mailerlite.com/help/subscriber-statuses-explained)
 *
 * @since 0.0.1
 */
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/function'
import * as A from 'fp-ts/Array'
import { DatetimeStr, ILinks, MlConfig } from './config'
import { IBatchRequest, IBatchResponse, mlBatch, mlRequest, runBatch, validateBatch } from './utils'


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
export const list = <TCustomFields>(config: MlConfig) => (params: IListParams): TE.TaskEither<Error, IListResult<TCustomFields>> => {
  return mlRequest<IListResult<TCustomFields>>(config)({method: 'GET', params}, 'api/subscribers')
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
export const upsert = <TCustomFields>(config: MlConfig) => (params: IUpsertParams<TCustomFields>): TE.TaskEither<Error, IUpsertResult<TCustomFields>> => {
  return mlRequest<IUpsertResult<TCustomFields>>(config)({method:'POST', data: params}, 'api/subscribers')
}

/**
 * @since 0.0.1
 */
export const upsertBatch = <TCustomFields>(params: IUpsertParams<TCustomFields>): E.Either<Error, IBatchRequest> => {
  return mlBatch({method:'POST', data: params}, 'api/subscribers')
}


/**
 * Upsert a list of subscribers
 * *remarks*
 * Mailerlite does not provide any api to upsert a list of subscribers.
 * This function relies on their batching feature (ability to batch multiple api in one call). 
 * However batching is limited to 50 api calls at once which is quite low when you need to update hundreds of
 * subscribers.
 * The function will transparently call multiple batch in order to accomodate more than 50 subscribers.
 * Beware that the batch api is quite slow. Depending on how you are updating your subscribers and how many
 * of them you are updating, you have to ensure to handle a proper timeout.
 * @since 0.0.6
 */
export const upsertList = <TCustomFields>(config: MlConfig) => (subscriberList: IUpsertParams<TCustomFields>[]): TE.TaskEither<Error, IBatchResponse[]> => {

  const runAndValidateBatch = (reqs: IBatchRequest[]) => pipe(reqs,runBatch(config), TE.chain(validateBatch))

  const res = pipe(
    subscriberList,
    A.traverse(E.Applicative)(upsertBatch),
    E.map(A.chunksOf(50)),
    TE.fromEither,
    TE.map(A.map(runAndValidateBatch)),
    TE.map( A.sequence(TE.ApplicativeSeq)),
    TE.flatten
  )
  return res
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
export const fetch = <TCustomFields>(config: MlConfig) => (params: IFetchParams): TE.TaskEither<Error, IFetchResult<TCustomFields>> => {
  return mlRequest<IFetchResult<TCustomFields>>(config)({method:'GET'}, `api/subscribers/${params.id}`)
}

/**
 * @since 0.0.5
 */
export const fetchBatch = (params: IFetchParams): E.Either<Error, IBatchRequest> => {
  return mlBatch({method:'GET', data: params}, `api/subscribers/${params.id}`)
}



/**
 * Parmameters DELETE
 * @since 0.0.1
 */
export interface IDelParams {
  /** Subscriber Id or email */
  id: string
}
interface IDelResult {}


/**
 * @since 0.0.1
 */
export const del = (config: MlConfig) => (params: IDelParams): TE.TaskEither<Error, IDelResult> => {
  return mlRequest<IDelResult>(config)({method:'DELETE'}, `api/subscribers/${params.id}`)
}

/**
 * @since 0.0.5
 */
export const delBatch = (params: IDelParams): E.Either<Error, IBatchRequest> => {
  return mlBatch({method:'DELETE', data: params}, `api/subscribers/${params.id}`)
}
