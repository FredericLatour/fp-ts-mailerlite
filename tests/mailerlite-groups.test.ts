import '@relmify/jest-fp-ts'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { groups } from '../src'

import { deps, logger } from './common'


test.only('Create, List, Get, Update, Delete groups...', async () => {
  const createParams: groups.ICreateParams = { name: 'fltest_group' }
  const resCreate = await pipe(
    deps,
    // Create a group
    groups.create(createParams),
    TE.chainFirstIOK(
      (res) => () => expect(res.data).toEqual(expect.objectContaining({ name: createParams.name }))
    ),
    
    // Get the group to ensure the group was created
    TE.chain((res) => groups.get({ id: res.data.id })(deps)),
    TE.chainFirstIOK((res) => () => {
      console.log(res)
      expect(res.data).toEqual(
        expect.objectContaining({ name: createParams.name, id: res.data.id })
      )
    }),

    // Update the group
    TE.chain((res) => groups.update({ id: res.data.id, name: createParams.name + '_update' })(deps)),
    TE.chainFirstIOK(
      (res) => () =>
        expect(res.data).toEqual(
          expect.objectContaining({ name: createParams.name + '_update', id: res.data.id })
        )
    ),
    
    // Delete the group
    TE.chain((res) => groups.del({ id: res.data.id })(deps)),
    TE.chainFirstIOK((res) => () => expect(res).toBe('')),
    TE.foldW(
      (e) => async () => {throw e},
      (res) => async () => ({ kind: 'done', data: { res } })
    )
  )()
  console.log('resCreate', resCreate)
})


test('Create group', async () => {
  const params: groups.ICreateParams = { name: 'fltest_group' }
  const res = await pipe(deps, groups.create(params))()
  logger.info(res)
})

test('List group', async () => {
  const params: groups.IListParams = { filter: { name: 'fltest' } }
  const res = await pipe(deps, groups.list(params))()
  logger.info(res)
})

test('Get group', async () => {
  const params: groups.IGetParams = { id: '77559589985322233' }
  const res = await pipe(deps, groups.get(params))()
  logger.info(res)
})

test('Delete group', async () => {
  const params: groups.IDelParams = { id: '77559589985322233' }
  const res = await pipe(deps, groups.del(params))()
  logger.info(res)
})

test('Update group', async () => {
  const params: groups.IUpdateParams = { id: '77588036914775154', name: 'fltest_group_update' }
  const res = await pipe(deps, groups.update(params))()
  logger.info(res)
})
