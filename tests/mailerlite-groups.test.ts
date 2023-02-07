import '@relmify/jest-fp-ts'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { groups } from '../src'
import { cfg } from './common'

test.only('Create, List, Get, Update, Delete groups...', async () => {
  const createParams: groups.ICreateParams = { name: 'testGroup_' + new Date().toISOString() }
  const resCreate = await pipe(
    createParams,
    groups.create(cfg),
    TE.chainFirstIOK(
      (res) => () => expect(res.data).toEqual(expect.objectContaining({ name: createParams.name }))
    ),

    // Get the group to ensure the group was created
    TE.chain((res) => groups.get(cfg)({ id: res.data.id })),
    TE.chainFirstIOK((res) => () => {
      expect(res.data).toEqual(
        expect.objectContaining({ name: createParams.name, id: res.data.id })
      )
    }),

    // Update the group
    TE.chain((res) => groups.update(cfg)({ id: res.data.id, name: createParams.name + '_update' })),
    TE.chainFirstIOK(
      (res) => () =>
        expect(res.data).toEqual(
          expect.objectContaining({ name: createParams.name + '_update', id: res.data.id })
        )
    ),

    // Delete the group
    TE.chain((res) => groups.del(cfg)({ id: res.data.id })),
    TE.chainFirstIOK((res) => () => expect(res).toBe('')),
  )()
  expect(resCreate).toBeRight()
})

test('Create group', async () => {
  const params: groups.ICreateParams = { name: 'fltest_group' }
  const res = await pipe(params, groups.create(cfg))()
  expect(res).toBeRight()
})

test('List group', async () => {
  const params: groups.IListParams = { filter: { name: 'fltest' } }
  const res = await pipe(params, groups.list(cfg))()
  expect(res).toBeRight()
})

test('Get group', async () => {
  const params: groups.IGetParams = { id: '77559589985322233' }
  const res = await pipe(params, groups.get(cfg))()
  expect(res).toBeRight()
})

test('Delete group', async () => {
  const params: groups.IDelParams = { id: '77559589985322233' }
  const res = await pipe(params, groups.del(cfg))()
  expect(res).toBeRight()
})

test('Update group', async () => {
  const params: groups.IUpdateParams = { id: '77588036914775154', name: 'fltest_group_update' }
  const res = await pipe(params, groups.update(cfg))()
  expect(res).toBeRight()
})
