import { Effect, ILinks } from './config'
import { mlRequest } from './utils'

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


type SortOrder = '+' | '-'
type SortFields = 'name' | 'total' | 'open_rate' | 'click_rate' | 'created_at'

export interface IListParams {
  limit?: number
  page?: number
  sort?: `${SortOrder}${SortFields}`
  filter?: {
    name: string
  }
}

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
 *    import { groups } from 'fp-ts-mailerlite'
 * 
 *    export const deps: MlEnv = {
 *      config: {
 *        token: process.env['ML_TOKEN'] ?? '',
 *        baseUrl: 'https://connect.mailerlite.com/',
 *      }
 *    }
 *    
 *    const res = await pipe(deps, groups.list({ name: 'test_group' }))()
 * 
 */
export const list = (params: IListParams): Effect<IListResult> => {
  return mlRequest({method: 'GET', params}, 'api/groups')
}

/**
 * Parmameters for creating a group
 */
export interface ICreateParams {
  /** Group name - max 255 chars */
  name: string
}

interface ICreateResult {
  data: IGroupData
}

export const create = (params: ICreateParams): Effect<ICreateResult> => {
  return mlRequest({method:'POST', data: params}, 'api/groups')
}


export interface IUpdateParams {
  /** Group id */
  id: string
  /** new group name */
  name: string
}

interface IUpdateResult {
  data: IGroupData
}

export const update = (params: IUpdateParams): Effect<IUpdateResult> => {
  return mlRequest({method: 'PUT', data: {name: params.name}}, `api/groups/${params.id}`)
}


/**
 * Parmameters for deleting a group
 */
export interface IDelParams {
  /** Group Id */
  id: string
}
interface IDelResult {}

export const del = (params: IDelParams): Effect<IDelResult> => {
  return mlRequest({method:'DELETE'}, `api/groups/${params.id}`)
}


/**
 * Parmameters for getting a group by its id
 */
export interface IGetParams {
  /** Group Id */
  id: string
}
interface IGetResult {data: IGroupData}

export const get = (params: IGetParams): Effect<IGetResult> => {
  return mlRequest({method:'GET'}, `api/groups/${params.id}`)
}


