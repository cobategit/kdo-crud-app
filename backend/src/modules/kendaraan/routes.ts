import { Elysia, t } from 'elysia'
import { ok, paginated } from '../../lib/response'
import { errorResponses, IdParams, paginatedSuccess, success } from '../../lib/schemas'
import { KendaraanModel as M } from './model'
import { kendaraanService as service } from './service'

export const kendaraanRoutes = new Elysia({ prefix: '/kendaraan', tags: ['Kendaraan Dinas'] })
  .get(
    '',
    async ({ query }) => {
      const { items, meta } = await service.list(query)
      return paginated(items, meta)
    },
    {
      query: M.listQuery,
      response: { 200: paginatedSuccess(M.item), ...errorResponses },
      detail: {
        summary:
          'Daftar kendaraan (filter kondisi, perangkat daerah, tahun produksi, tanpa penanggung jawab)',
      },
    },
  )
  .get('/:id', async ({ params }) => ok(await service.getById(params.id)), {
    params: IdParams,
    response: { 200: success(M.item), ...errorResponses },
    detail: { summary: 'Detail kendaraan + perangkat daerah + penanggung jawab' },
  })
  .post(
    '',
    async ({ body, set }) => {
      set.status = 201
      return ok(await service.create(body))
    },
    {
      body: M.body,
      response: { 201: success(M.item), ...errorResponses },
      detail: {
        summary: 'Tambah kendaraan',
        description:
          'Nomor polisi dinormalisasi (mis. "b1234abc" → "B 1234 ABC"). Penanggung jawab harus pegawai dari perangkat daerah yang sama.',
      },
    },
  )
  .put('/:id', async ({ params, body }) => ok(await service.update(params.id, body)), {
    params: IdParams,
    body: M.body,
    response: { 200: success(M.item), ...errorResponses },
    detail: { summary: 'Ubah kendaraan' },
  })
  .patch(
    '/:id/kondisi',
    async ({ params, body }) => ok(await service.updateKondisi(params.id, body.kondisi)),
    {
      params: IdParams,
      body: M.kondisiBody,
      response: { 200: success(M.item), ...errorResponses },
      detail: { summary: 'Ubah kondisi kendaraan saja' },
    },
  )
  .delete('/:id', async ({ params }) => ok(await service.remove(params.id)), {
    params: IdParams,
    response: { 200: success(t.Object({ id: t.String() })), ...errorResponses },
    detail: { summary: 'Hapus kendaraan' },
  })
