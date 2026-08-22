<script setup lang="ts">
const route = useRoute()

useHead({
  meta: [{ property: 'og:title', content: `MGM12 Handball checks - ${route.meta.title}` }],
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1 w-full flex flex-col pt-4 pb-20 md:pb-8">
      <AppPullToRefresh>
        <UContainer class="flex-1 w-full flex flex-col">
          <AppOriginInfo />
          <slot />
        </UContainer>
      </AppPullToRefresh>
    </main>
    <AppFooter class="hidden md:block" />
    <AppPwaInstallPrompt />
    <AppBottomNav />
  </div>
</template>
