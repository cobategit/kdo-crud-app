<script setup lang="ts">
/** Ikon garis sederhana (gaya Lucide) agar tidak perlu dependensi ikon tambahan. */
export type IconName =
  | 'dashboard'
  | 'car'
  | 'users'
  | 'building'
  | 'menu'
  | 'close'
  | 'check'
  | 'alert'
  | 'info'

defineProps<{ name: IconName; class?: string }>()

const paths: Record<IconName, string[]> = {
  dashboard: ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  car: [
    'M5 17H3v-5l2-5h11l3 5h2v5h-2',
    'M7.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    'M16.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    'M9 17h6',
    'M5 12h14',
  ],
  users: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  building: [
    'M3 21h18',
    'M5 21V7l7-4 7 4v14',
    'M9 9h1',
    'M14 9h1',
    'M9 13h1',
    'M14 13h1',
    'M10 21v-4h4v4',
  ],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
  check: ['M20 6 9 17l-5-5'],
  alert: [
    'M12 9v4',
    'M12 17h.01',
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  ],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01'],
}
</script>

<template>
  <svg
    :class="$props.class ?? 'h-5 w-5'"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in paths[name]" :key="d" :d="d" />
  </svg>
</template>
