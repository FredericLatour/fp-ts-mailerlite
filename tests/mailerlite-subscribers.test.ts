/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import '@relmify/jest-fp-ts'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import 'jest'
import { groups, subscribers } from '../src'
import { cfg, CustomFields, logger, makeSubscribers } from './common'

let subsList: ReturnType<typeof makeSubscribers>
let grp: groups.IGroupData

// const init = (env: MlEnv) => ({
//   runner: <A>(e: Effect<A>): TE.TaskEither<Error, A> => e(env)
// })

// const fn = (cfg: MlConfig) => ({
//   runner: <A>(e: (x: MlConfig) => TE.TaskEither<Error, A>): TE.TaskEither<Error, A> => e(cfg)
// })


// const initialize = (env: MlEnv) => ({
//   runner: <A>(e: Effect<A>): Promise<E.Either<Error, A>> => e(env)()
// })

beforeAll(async () => {
  const groupName = 'fltest_' + new Date().toISOString()

  await pipe(
    { name: groupName },
    groups.create(cfg),
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
})

afterAll(async () => {
  await pipe(
    { id: grp.id },
    groups.del(cfg),
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
  const res = await pipe(sub, subscribers.upsert<CustomFields>(cfg))()
  expect(res).toSubsetEqualRight({ data: { email: sub.email } })
})

test('Upsert 01', async () => {
  const sub = subsList[1]!
  const res = await pipe(sub, subscribers.upsert<CustomFields>(cfg))()
  expect(res).toSubsetEqualRight({ data: { email: sub.email } })
})

test('List subscribers', async () => {
  const params: subscribers.IListParams = { filter: { group: grp.id } }
  const res = await pipe(params, subscribers.list<CustomFields>(cfg))()
  expect(res).toBeRight()
})

test('Delete', async () => {
  const delOneUser = (email: string) =>
    pipe(
      { id: email },
      subscribers.fetch(cfg),
      TE.chain((subs) => subscribers.del(cfg)({ id: subs.data.id }))
    )
  const res = await pipe(
    [delOneUser(subsList[0].email), delOneUser(subsList[1]!.email)],
    A.sequence(TE.ApplicativeSeq)
  )()
  expect(res).toBeRight()
})
