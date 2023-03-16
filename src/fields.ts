/**
 * Fields API For mor information about fields, see
 * [Fields](https://developers.mailerlite.com/docs/fields.html#list-all-fields)
 *
 * @since 0.0.7
 */
import * as TE from 'fp-ts/TaskEither'
import { batchList, mlBatch } from './batch'
import { ILinks, MlConfig, MlError } from './config'
import { IMeta, mlRequest } from './utils'

/** @since 0.0.7 */
export interface IField {
  id: string
  name: string
  key: string
  type: 'date' | 'text' | 'number'
  is_default: boolean
  used_in_automations: boolean
}

/**
 * List parameters
 *
 * @since 0.0.7
 */
export interface IListParams {
  limit?: number
  page?: number
  sort?: `${'+' | '-'}${'name' | 'type'}`
  filter?: {
    name: string
  }
}

/**
 * list response
 *
 * @since 0.0.7
 */
export interface IListResponse {
  data: Array<IField>
  links: ILinks
  meta: IMeta
}

/**
 * List All fields
 *
 * @since 0.0.7
 * @category Fields
 * @example
 *   import { fields, MlEnv } from '@frederic-latour/fp-ts-mailerlite'
 *   import { pipe } from 'fp-ts/function'
 *
 *   const cfg = {
 *     token: process.env['ML_TOKEN'],
 *     baseUrl: 'https://connect.mailerlite.com/',
 *   }
 *
 *   async function test() {
 *     const res = await pipe({ filter: { name: 'fltest' } }, groups.list(cfg))()
 *     return res
 *   }
 *   console.log(test())
 */
export const list =
  (config: MlConfig) =>
  (params: IListParams): TE.TaskEither<MlError, IListResponse> => {
    return mlRequest<IListResponse>(config)({ method: 'GET', params }, 'api/fields')
  }

/**
 * Parmameters for creating a field
 *
 * @since 0.0.7
 */
export type ICreateParams = Pick<IField, 'name' | 'type'>

interface ICreateResponse {
  data: IField
}

/**
 * Create a field
 *
 * @since 0.0.7
 * @category Fields
 */
export const create =
  (config: MlConfig) =>
  (params: ICreateParams): TE.TaskEither<MlError, ICreateResponse> => {
    return mlRequest<ICreateResponse>(config)({ method: 'POST', data: params }, 'api/fields')
  }

/**
 * Create a list of fields. _Remarks_ Since Mailerlite does not have an api allowing creating
 * multiple fields at once, we are batching the creation of each field in the list.
 *
 * @since 0.0.7
 * @category Fields
 * @example
 *   import { fields, MlEnv } from '@frederic-latour/fp-ts-mailerlite'
 *   import { pipe } from 'fp-ts/function'
 *
 *   const cfg = {
 *     token: process.env['ML_TOKEN'],
 *     baseUrl: 'https://connect.mailerlite.com/',
 *   }
 *
 *   async function test() {
 *     const fieldList: fields.ICreateParams[] = [
 *       { name: 'birthdate', type: 'date' },
 *       { name: 'purchaseCount', type: 'number' },
 *     ]
 *
 *     return await pipe(fieldList, fields.createFields(cfg))()
 *   }
 *   console.log(test())
 */
export const createList = (config: MlConfig) => (fieldList: ICreateParams[]) => {
  const cbatch = (field: ICreateParams) => mlBatch({ method: 'POST', data: field }, `api/fields`)
  return batchList<ICreateParams>(config)(fieldList, cbatch)
}

/** @since 0.0.7 */
export type IUpdateParams = Pick<IField, 'id' | 'name'>

/** @since 0.0.7 */
interface IUpdateResponse {
  data: IField
}

/** @since 0.0.7 */
export const update =
  (config: MlConfig) =>
  (params: IUpdateParams): TE.TaskEither<MlError, IUpdateResponse> => {
    return mlRequest<IUpdateResponse>(config)(
      { method: 'PUT', data: { name: params.name } },
      `api/fields/${params.id}`
    )
  }

/**
 * Parmameters for deleting a group
 *
 * @since 0.0.7
 */
export interface IDelParams {
  /** Group Id */
  id: string
}
interface IDelResponse {}

/** @since 0.0.7 */
export const del =
  (config: MlConfig) =>
  (params: Pick<IField, 'id'>): TE.TaskEither<MlError, IDelResponse> => {
    return mlRequest<IDelResponse>(config)({ method: 'DELETE' }, `api/fields/${params.id}`)
  }


/**
 * Create multiple fields
 *
 * @since 0.0.7
 * @category Fields
 */
export const delFields = (config: MlConfig) => (fieldList: IDelParams[]) => {
  const cbatch = (field: IDelParams) =>
    mlBatch({ method: 'DELETE', data: field }, `api/fields/${field.id}`)
  
  return batchList<IDelParams>(config)(fieldList, cbatch)
}
