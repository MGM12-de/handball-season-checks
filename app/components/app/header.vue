<script setup lang="ts">
const links = [
  {
    label: 'Liga suchen',
    icon: 'i-lucide-search',
    to: '/tournament',
  },
]
</script>

<template>
  <UHeader>
    <template #title>
      <AppLogo class="w-auto h-6" />
    </template>

    <UNavigationMenu :items="links" />

    <template #right>
      <UColorModeButton />

      <UButton to="https://github.com/MGM12-de/handball-season-checks" target="_blank" icon="i-simple-icons-github"
        color="neutral" variant="ghost" />
    </template>

    <template #body>
      <UNavigationMenu :items="links" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<style></style>
