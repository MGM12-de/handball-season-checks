<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const title = 'Handball checks'
const description = 'An application with extra features for a handball season.'
useHead({
  title,
  meta: [
    { name: 'description', content: description }
  ]
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  twitterCard: 'app'
})
</script>
