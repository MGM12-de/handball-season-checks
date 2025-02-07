<script setup lang="ts">
const route = useRoute()

useHead({
  meta: [{ property: 'og:title', content: `MGM12 Handball checks - ${route.meta.title}` }],
})
</script>

<template>
  <div>
    <AppHeader />

    <UContainer>
      <AppOriginInfo />
      <slot />
    </UContainer>
    <AppFooter />
  </div>
</template>
