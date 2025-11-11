<script setup lang="ts">
import { de, en } from '@nuxt/ui/locale'

const { locale, t, setLocale } = useI18n()

const links = [
  {
    label: t('searchClub'),
    icon: 'i-lucide-search',
    to: '/club',
  },
  {
    label: t('searchTournament'),
    icon: 'i-lucide-search',
    to: '/tournament',
  },
]
</script>

<template>
  <UHeader>
    <template #title>
      <AppLogo class="w-15 h-auto " />
    </template>

    <UNavigationMenu :items="links" />

    <template #right>
      <UColorModeButton />

      <ULocaleSelect :model-value="locale" :locales="[en, de]" @update:model-value="setLocale($event)" />

      <UButton to="https://github.com/MGM12-de/handball-season-checks" target="_blank" icon="i-simple-icons-github"
        color="neutral" variant="ghost" />
    </template>

    <template #body>
      <UNavigationMenu :items="links" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<style></style>
