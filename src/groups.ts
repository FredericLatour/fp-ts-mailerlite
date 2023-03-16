/**
 * Groups API
 * For mor information about groups, see [How to create and use groups](https://www.mailerlite.com/help/how-to-create-and-use-groups)
 *
 * @since 0.0.7
 */
import * as TE from 'fp-ts/TaskEither'
import { ILinks, MlConfig, MlError } from './config'
import { IMeta, mlRequest } from './utils'

/**
 * @since 0.0.7
 */
export interface IGroupData {
  id: string
  name: string
  active_count: number
  sent_count: number
  opens_count: number
  open_rate: {
    float: number
    string: string
  }
  clicks_count: number
  click_rate: {
    float: number
    string: string
  }
  unsubscribed_count: number
  unconfirmed_count: number
  bounced_count: number
  junk_count: number
  created_at: Date
}


type SortOrder = '+' | '-'
type SortFields = 'name' | 'total' | 'open_rate' | 'click_rate' | 'created_at'

/**
 * list parameters
 * @since 0.0.7
 */
export interface IListParams {
  limit?: number
  page?: number
  sort?: `${SortOrder}${SortFields}`
  filter?: {
    name: string
  }
}

/**
 * list response
 * @since 0.0.7
 */
export interface IListResponse {
  data: Array<IGroupData>
  links: ILinks
  meta: IMeta
}

/**
 * List All groups
 *
 * @since 0.0.7
 * @category groups
 * @example
 * import { groups, MlEnv } from '@frederic-latour/fp-ts-mailerlite'
 * import { pipe } from 'fp-ts/function'
 * 
 * const deps: MlEnv = {
 *   config: {
 *     token: process.env['ML_TOKEN'] ?? '',
 *     baseUrl: 'https://connect.mailerlite.com/'
 *   }
 * }
 * 
 * async function test() {
 *    const res = await pipe(deps, groups.list({ filter: { name: 'fltest' } }))()
 *    return res
 * }   
 * console.log(test())
 * 
 */
export const list = (config: MlConfig) => (params: IListParams): TE.TaskEither<MlError, IListResponse> => {
  return mlRequest<IListResponse>(config)({method: 'GET', params}, 'api/groups')
}





/**
 * Parmameters for creating a group
 * @since 0.0.7
 */
export interface ICreateParams {
  /** Group name - max 255 chars */
  name: string
}

interface ICreateResponse {
  data: IGroupData
}

/**
 * Create a group!
 *
 * @since 0.0.7
 * @category groups
 * @example
 * import { groups, MlEnv } from '@frederic-latour/fp-ts-mailerlite'
 * import { pipe } from 'fp-ts/function'
 * 
 * const deps: MlEnv = {
 *   config: {
 *     token: process.env['ML_TOKEN'] ?? '',
 *     baseUrl: 'https://connect.mailerlite.com/'
 *   }
 * }
 * 
 * async function test() {
 *    const res = await pipe(deps, groups.create({ name: 'test_group' }))()
 *    return res
 * }   
 * console.log(test())
 * 
 */
export const create = (config: MlConfig) => (params: ICreateParams): TE.TaskEither<MlError, ICreateResponse> => {
  return mlRequest<ICreateResponse>(config)({method:'POST', data: params}, 'api/groups')
}


/**
 * @since 0.0.7
 */
export interface IUpdateParams {
  /** Group id */
  id: string
  /** new group name */
  name: string
}

/**
 * @since 0.0.7
 */
interface IUpdateResponse {
  data: IGroupData
}

/**
 * @since 0.0.7
 */
export const update = (config: MlConfig) => (params: IUpdateParams): TE.TaskEither<MlError, IUpdateResponse> => {
  return mlRequest<IUpdateResponse>(config)({method: 'PUT', data: {name: params.name}}, `api/groups/${params.id}`)
}


/**
 * Parmameters for deleting a group
 * @since 0.0.7
 */
export interface IDelParams {
  /** Group Id */
  id: string
}
interface IDelResponse {}

/**
 * @since 0.0.7
 */
export const del = (config: MlConfig) => (params: IDelParams): TE.TaskEither<MlError, IDelResponse> => {
  return mlRequest<IDelResponse>(config)({method:'DELETE'}, `api/groups/${params.id}`)
}


/**
 * Parmameters for getting a group by its id
 * @since 0.0.7
 */
export interface IGetParams {
  /** Group Id */
  id: string
}
interface IGetResponse {data: IGroupData}

/**
 * @since 0.0.7
 */
export const get = (config: MlConfig) => (params: IGetParams): TE.TaskEither<MlError, IGetResponse> => {
  return mlRequest<IGetResponse>(config)({method:'GET'}, `api/groups/${params.id}`)
}
