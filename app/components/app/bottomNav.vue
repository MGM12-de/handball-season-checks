<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const items = computed(() => [
  { label: t('startPage'), icon: 'i-lucide-home', to: '/' },
  { label: t('searchClub'), icon: 'i-lucide-search', to: '/club' },
  { label: t('searchTournament'), icon: 'i-lucide-trophy', to: '/tournament' },
  { label: t('favorites'), icon: 'i-lucide-star', to: '/favorites' },
])

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <nav
    class="md:hidden fixed inset-x-0 bottom-0 z-50 bg-default border-t border-default"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
  >
    <div class="grid grid-cols-4">
      <NuxtLink
        v-for="item in items" :key="item.to" :to="item.to"
        class="flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 text-xs"
        :class="isActive(item.to) ? 'text-primary' : 'text-muted'"
      >
        <UIcon :name="item.icon" class="w-5 h-5" />
        <span class="truncate">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
