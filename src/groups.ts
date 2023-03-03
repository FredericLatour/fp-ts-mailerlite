/**
 * Groups API
 * For mor information about groups, see [How to create and use groups](https://www.mailerlite.com/help/how-to-create-and-use-groups)
 *
 * @since 0.0.1
 */
import * as TE from 'fp-ts/TaskEither'
import { ILinks, MlConfig } from './config'
import { IMeta, mlRequest } from './utils'

/**
 * @since 0.0.1
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
 * @since 0.0.1
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
 * Result returned by list
 * @since 0.0.1
 */
export interface IListResult {
  data: Array<IGroupData>
  links: ILinks
  meta: IMeta
}

/**
 * List All groups
 *
 * @since 0.0.1
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
export const list = (config: MlConfig) => (params: IListParams): TE.TaskEither<Error, IListResult> => {
  return mlRequest<IListResult>(config)({method: 'GET', params}, 'api/groups')
}





/**
 * Parmameters for creating a group
 * @since 0.0.1
 */
export interface ICreateParams {
  /** Group name - max 255 chars */
  name: string
}

interface ICreateResult {
  data: IGroupData
}

/**
 * Create a group!
 *
 * @since 0.0.1
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
export const create = (config: MlConfig) => (params: ICreateParams): TE.TaskEither<Error, ICreateResult> => {
  return mlRequest<ICreateResult>(config)({method:'POST', data: params}, 'api/groups')
}


/**
 * @since 0.0.1
 */
export interface IUpdateParams {
  /** Group id */
  id: string
  /** new group name */
  name: string
}

/**
 * @since 0.0.1
 */
interface IUpdateResult {
  data: IGroupData
}

/**
 * @since 0.0.1
 */
export const update = (config: MlConfig) => (params: IUpdateParams): TE.TaskEither<Error, IUpdateResult> => {
  return mlRequest<IUpdateResult>(config)({method: 'PUT', data: {name: params.name}}, `api/groups/${params.id}`)
}


/**
 * Parmameters for deleting a group
 * @since 0.0.1
 */
export interface IDelParams {
  /** Group Id */
  id: string
}
interface IDelResult {}

/**
 * @since 0.0.1
 */
export const del = (config: MlConfig) => (params: IDelParams): TE.TaskEither<Error, IDelResult> => {
  return mlRequest<IDelResult>(config)({method:'DELETE'}, `api/groups/${params.id}`)
}


/**
 * Parmameters for getting a group by its id
 * @since 0.0.1
 */
export interface IGetParams {
  /** Group Id */
  id: string
}
interface IGetResult {data: IGroupData}

/**
 * @since 0.0.1
 */
export const get = (config: MlConfig) => (params: IGetParams): TE.TaskEither<Error, IGetResult> => {
  return mlRequest<IGetResult>(config)({method:'GET'}, `api/groups/${params.id}`)
}
