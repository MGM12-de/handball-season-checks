<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')
const title = 'Handball checks'
const description = 'An application with extra features for a handball season.'

useHead({
  title,
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: description },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: '%s - Handball checks',
  description,
  ogDescription: description,
  twitterCard: 'app'
})
</script>
