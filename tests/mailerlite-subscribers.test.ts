/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import '@relmify/jest-fp-ts'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { groups, subscribers } from '../src'
import { CustomFields, deps, logger, makeSubscribers } from './common'

let subsList: ReturnType<typeof makeSubscribers>
let grp: groups.IGroupData

beforeAll(async () => {
  const groupName = 'fltest_' + new Date().toISOString()
  await pipe(
    deps,
    groups.create({ name: groupName }),
    TE.fold(
      (e) => () => {
        throw e
      },
      (res) =>
        T.fromIO(() => {
          grp = res.data
        })
    )
  )()

  subsList = makeSubscribers(1, 2, [grp.id])

  logger.info({ grp, subsList })
})

afterAll(async () => {
  await pipe(
    deps,
    groups.del({ id: grp.id }),
    TE.fold(
      (e) => () => {
        throw e
      },
      (res) => T.fromIO(() => logger.info(res))
    )
  )()
})

// test.only('create group, add subscriber...', async () => {
//   const groupName = 'fltest_'+ (new Date()).toISOString()
//   const resCreate = await pipe(
//     TE.Do,
//     // Create a temporary group
//     TE.bind( 'grp', () => groups.create({ name: groupName })(deps)),
//     TE.chainFirstIOK(
//       ({grp}) => () => expect(grp.data).toEqual(expect.objectContaining({ name: groupName }))
//     ),

//     // Add subscribers to the newly created group
//     TE.bind( 'subs', ({grp}) => subscribers.Upsert({...subsList[0], groups:[grp.data.id]}) (deps)),
//     TE.chainFirstIOK(({subs}) => () => {
//       console.log(subs)
//       expect(subs.data).toEqual(
//         expect.objectContaining({ email: subsList[0].email })
//       )
//     }),
//     TE.foldW(
//       (e) => async () => {throw e},
//       (res) => async () => ({ kind: 'done', data: { res } })
//     )
//   )()
//   logger.info('resCreate', resCreate)
// })

test('Upsert 00', async () => {
  const sub = subsList[0]
  const res = await pipe(deps, subscribers.upsert<CustomFields>(sub))()
  expect(res).toSubsetEqualRight({ data: { email: sub.email } })
  logger.info('Upsert 00', res)
})

test('Upsert 01', async () => {
  const sub = subsList[1]!
  const res = await pipe(deps, subscribers.upsert<CustomFields>(sub))()
  expect(res).toSubsetEqualRight({ data: { email: sub.email } })
  logger.info('Upsert 01', res)
})

test('List subscribers', async () => {
  const params: subscribers.IListParams = { filter: { group: grp.id } }
  const res = await pipe(deps, subscribers.list<CustomFields>(params))()
  logger.info('list subscribers', res)
})

test('Delete', async () => {
  const delOneUser = (email: string) =>
    pipe(
      deps,
      subscribers.fetch({ id: email }),
      TE.chain((subs) => subscribers.del({ id: subs.data.id })(deps))
    )
  const res = await pipe(
    [delOneUser(subsList[0].email), delOneUser(subsList[1]!.email)],
    A.sequence(TE.ApplicativeSeq)
  )()
  expect(res).toBeRight()
  logger.info(res)
})
