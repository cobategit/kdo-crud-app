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
        component: () => import('@/views/ModulBelumTersediaView.vue'),
        meta: { title: 'Kendaraan Dinas' },
      },
      {
        path: 'pegawai',
        name: 'pegawai-list',
        component: () => import('@/views/ModulBelumTersediaView.vue'),
        meta: { title: 'Pegawai' },
      },
      {
        path: 'perangkat-daerah',
        name: 'perangkat-daerah-list',
        component: () => import('@/views/ModulBelumTersediaView.vue'),
        meta: { title: 'Perangkat Daerah' },
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
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — SIM-KDO` : 'SIM-KDO'
})

export default router
