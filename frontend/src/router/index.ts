import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: 'Dashboard' },
      },

      {
        path: 'kendaraan',
        name: 'kendaraan-list',
        component: () => import('@/views/kendaraan/KendaraanListView.vue'),
        meta: { title: 'Kendaraan Dinas' },
      },
      {
        path: 'kendaraan/baru',
        name: 'kendaraan-create',
        component: () => import('@/views/kendaraan/KendaraanFormView.vue'),
        meta: { title: 'Tambah Kendaraan' },
      },
      {
        path: 'kendaraan/:id',
        name: 'kendaraan-detail',
        component: () => import('@/views/kendaraan/KendaraanDetailView.vue'),
        props: true,
        meta: { title: 'Detail Kendaraan' },
      },
      {
        path: 'kendaraan/:id/ubah',
        name: 'kendaraan-edit',
        component: () => import('@/views/kendaraan/KendaraanFormView.vue'),
        props: true,
        meta: { title: 'Ubah Kendaraan' },
      },

      {
        path: 'pegawai',
        name: 'pegawai-list',
        component: () => import('@/views/pegawai/PegawaiListView.vue'),
        meta: { title: 'Pegawai' },
      },
      {
        path: 'pegawai/baru',
        name: 'pegawai-create',
        component: () => import('@/views/pegawai/PegawaiFormView.vue'),
        meta: { title: 'Tambah Pegawai' },
      },
      {
        path: 'pegawai/:id',
        name: 'pegawai-detail',
        component: () => import('@/views/pegawai/PegawaiDetailView.vue'),
        props: true,
        meta: { title: 'Detail Pegawai' },
      },
      {
        path: 'pegawai/:id/ubah',
        name: 'pegawai-edit',
        component: () => import('@/views/pegawai/PegawaiFormView.vue'),
        props: true,
        meta: { title: 'Ubah Pegawai' },
      },

      {
        path: 'perangkat-daerah',
        name: 'perangkat-daerah-list',
        component: () => import('@/views/perangkat-daerah/PerangkatDaerahListView.vue'),
        meta: { title: 'Perangkat Daerah' },
      },
      {
        path: 'perangkat-daerah/baru',
        name: 'perangkat-daerah-create',
        component: () => import('@/views/perangkat-daerah/PerangkatDaerahFormView.vue'),
        meta: { title: 'Tambah Perangkat Daerah' },
      },
      {
        path: 'perangkat-daerah/:id',
        name: 'perangkat-daerah-detail',
        component: () => import('@/views/perangkat-daerah/PerangkatDaerahDetailView.vue'),
        props: true,
        meta: { title: 'Detail Perangkat Daerah' },
      },
      {
        path: 'perangkat-daerah/:id/ubah',
        name: 'perangkat-daerah-edit',
        component: () => import('@/views/perangkat-daerah/PerangkatDaerahFormView.vue'),
        props: true,
        meta: { title: 'Ubah Perangkat Daerah' },
      },

      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'Halaman Tidak Ditemukan' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, saved) => {
    if (saved) return saved
    // Perubahan filter/halaman (query) di rute yang sama tidak menggulir ke atas
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — SIM-KDO` : 'SIM-KDO'
})

export default router
