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
  | 'plus'
  | 'search'
  | 'edit'
  | 'trash'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-left'
  | 'sort'
  | 'sort-asc'
  | 'sort-desc'
  | 'inbox'
  | 'user'

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
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
  edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z'],
  trash: ['M3 6h18', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6', 'M14 11v6', 'M9 6V4h6v2'],
  'chevron-left': ['M15 18l-6-6 6-6'],
  'chevron-right': ['M9 18l6-6-6-6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'arrow-left': ['M19 12H5', 'M12 19l-7-7 7-7'],
  sort: ['M8 9l4-4 4 4', 'M16 15l-4 4-4-4'],
  'sort-asc': ['M8 14l4-4 4 4'],
  'sort-desc': ['M8 10l4 4 4-4'],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
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
