import { Elysia, t } from 'elysia'
import { ok, paginated } from '../../lib/response'
import { errorResponses, IdParams, paginatedSuccess, success } from '../../lib/schemas'
import { PegawaiModel as M } from './model'
import { pegawaiService as service } from './service'

export const pegawaiRoutes = new Elysia({ prefix: '/pegawai', tags: ['Pegawai'] })
  .get(
    '',
    async ({ query }) => {
      const { items, meta } = await service.list(query)
      return paginated(items, meta)
    },
    {
      query: M.listQuery,
      response: { 200: paginatedSuccess(M.item), ...errorResponses },
      detail: { summary: 'Daftar pegawai (filter perangkat daerah & golongan)' },
    },
  )
  .get('/:id', async ({ params }) => ok(await service.getById(params.id)), {
    params: IdParams,
    response: { 200: success(M.detail), ...errorResponses },
    detail: { summary: 'Detail pegawai + kendaraan yang menjadi tanggung jawabnya' },
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
      detail: { summary: 'Tambah pegawai' },
    },
  )
  .put('/:id', async ({ params, body }) => ok(await service.update(params.id, body)), {
    params: IdParams,
    body: M.body,
    response: { 200: success(M.detail), ...errorResponses },
    detail: {
      summary:
        'Ubah pegawai (pindah perangkat daerah ditolak bila masih penanggung jawab kendaraan)',
    },
  })
  .delete('/:id', async ({ params }) => ok(await service.remove(params.id)), {
    params: IdParams,
    response: { 200: success(t.Object({ id: t.String() })), ...errorResponses },
    detail: { summary: 'Hapus pegawai (409 bila masih penanggung jawab kendaraan)' },
  })
