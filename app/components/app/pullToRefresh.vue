<script setup lang="ts">
const { pullDistance, isRefreshing, pullProgress } = usePullToRefresh(() => refreshNuxtData())
</script>

<template>
  <div>
    <div
      class="flex items-center justify-center overflow-hidden transition-[height] ease-out"
      :class="isRefreshing ? 'duration-200' : 'duration-0'"
      :style="{ height: `${pullDistance}px` }"
    >
      <UIcon
        :name="isRefreshing ? 'i-lucide-loader-circle' : 'i-lucide-arrow-down'"
        class="w-5 h-5 text-muted transition-transform"
        :class="{
          'animate-spin': isRefreshing,
          'rotate-180': !isRefreshing && pullProgress >= 1,
        }"
      />
    </div>
    <slot />
  </div>
</template>
