<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon, { type IconName } from '@/components/ui/AppIcon.vue'

interface NavItem {
  label: string
  to: string
  icon: IconName
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: 'dashboard' },
  { label: 'Kendaraan', to: '/kendaraan', icon: 'car' },
  { label: 'Pegawai', to: '/pegawai', icon: 'users' },
  { label: 'Perangkat Daerah', to: '/perangkat-daerah', icon: 'building' },
]

const route = useRoute()
const drawerOpen = ref(false)

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? 'KDO')

function isActive(item: NavItem): boolean {
  return item.to === '/' ? route.path === '/' : route.path.startsWith(item.to)
}

// Tutup drawer otomatis setelah navigasi di layar kecil
watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false
  },
)
</script>

<template>
  <div class="min-h-screen">
    <!-- Overlay drawer (mobile) -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        aria-hidden="true"
        @click="drawerOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-900 text-white transition-transform duration-200 lg:translate-x-0"
      :class="drawerOpen ? 'translate-x-0' : '-translate-x-full'"
      aria-label="Navigasi utama"
    >
      <div class="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-5">
        <RouterLink to="/" class="flex items-center gap-3">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
            <AppIcon name="car" class="h-5 w-5" />
          </span>
          <span class="leading-tight">
            <span class="block text-sm font-bold tracking-wide">SIM-KDO</span>
            <span class="block text-xs text-brand-100/80">Kendaraan Dinas Operasional</span>
          </span>
        </RouterLink>
        <button
          type="button"
          class="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup menu"
          @click="drawerOpen = false"
        >
          <AppIcon name="close" />
        </button>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          :class="
            isActive(item)
              ? 'bg-white/15 text-white'
              : 'text-brand-100/80 hover:bg-white/10 hover:text-white'
          "
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <AppIcon :name="item.icon" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-white/10 px-5 py-4 text-xs text-brand-100/60">
        Pemerintah Daerah &middot; {{ new Date().getFullYear() }}
      </div>
    </aside>

    <!-- Konten -->
    <div class="lg:pl-64">
      <header
        class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6"
      >
        <button
          type="button"
          class="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Buka menu"
          @click="drawerOpen = true"
        >
          <AppIcon name="menu" />
        </button>
        <p class="truncate text-base font-semibold text-slate-900 lg:hidden">{{ pageTitle }}</p>
        <p class="hidden truncate text-sm text-slate-500 lg:block">
          Pengelolaan Kendaraan Dinas Operasional &middot; Pemerintah Daerah
        </p>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
