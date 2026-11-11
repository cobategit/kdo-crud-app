import { Elysia, t } from 'elysia'
import { ok, paginated } from '../../lib/response'
import { errorResponses, IdParams, paginatedSuccess, success } from '../../lib/schemas'
import { PerangkatDaerahModel as M } from './model'
import { perangkatDaerahService as service } from './service'

export const perangkatDaerahRoutes = new Elysia({
  prefix: '/perangkat-daerah',
  tags: ['Perangkat Daerah'],
})
  .get(
    '',
    async ({ query }) => {
      const { items, meta } = await service.list(query)
      return paginated(items, meta)
    },
    {
      query: M.listQuery,
      response: { 200: paginatedSuccess(M.item), ...errorResponses },
      detail: { summary: 'Daftar perangkat daerah beserta jumlah pegawai & kendaraan' },
    },
  )
  .get('/:id', async ({ params }) => ok(await service.getById(params.id)), {
    params: IdParams,
    response: { 200: success(M.detail), ...errorResponses },
    detail: { summary: 'Detail perangkat daerah + rekap kondisi kendaraan' },
  })
  .post(
    '',
    async ({ body, set }) => {
      set.status = 201
      return ok(await service.create(body))
    },
    {
      body: M.body,
      response: { 201: success(M.detail), ...errorResponses },
      detail: { summary: 'Tambah perangkat daerah' },
    },
  )
  .put('/:id', async ({ params, body }) => ok(await service.update(params.id, body)), {
    params: IdParams,
    body: M.body,
    response: { 200: success(M.detail), ...errorResponses },
    detail: { summary: 'Ubah perangkat daerah' },
  })
  .delete('/:id', async ({ params }) => ok(await service.remove(params.id)), {
    params: IdParams,
    response: { 200: success(t.Object({ id: t.String() })), ...errorResponses },
    detail: { summary: 'Hapus perangkat daerah (409 bila masih memiliki pegawai/kendaraan)' },
  })
