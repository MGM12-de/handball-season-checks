<script setup lang="ts">
import type { NavItem } from '@nuxt/content/dist/runtime/types'

const navigation = inject<Ref<NavItem[]>>('navigation', ref([]))
const links = []
// const links = [{
//   label: 'Docs',
//   icon: 'i-heroicons-book-open',
//   to: '/getting-started'
// }, {
//   label: 'Pro',
//   icon: 'i-heroicons-square-3-stack-3d',
//   to: '/pro'
// }, {
//   label: 'Releases',
//   icon: 'i-heroicons-rocket-launch',
//   to: '/releases'
// }]
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <AppLogo class="w-auto h-6" />
    </template>

    <template #right>
      <UColorModeButton />

      <UButton
        to="https://github.com/MGM12-de/handball-season-checks" target="_blank" icon="i-simple-icons-github"
        color="gray" variant="ghost"
      />
    </template>

    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" />
    </template>
  </UHeader>
</template>

<style></style>
