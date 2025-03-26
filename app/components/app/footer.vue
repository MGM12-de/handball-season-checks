<script setup lang="ts">
const links = [{
  label: 'MGM12.dev',
  to: 'https://mgm12.dev',
}]
</script>

<template>
  <UFooter>
    <template #left>
      Copyright © 2024 - {{ new Date().getFullYear() }}
    </template>

    <UNavigationMenu :items="links" variant="link" />

    <template #right>
      <UButton icon="i-simple-icons-github" color="neutral" variant="ghost" to="https://github.com/MGM12-de"
        target="_blank" />
    </template>
  </UFooter>
</template>
