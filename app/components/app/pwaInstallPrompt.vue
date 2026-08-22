<script setup lang="ts">
const { t } = useI18n()
const nuxtApp = useNuxtApp()
const pwa = nuxtApp.$pwa

async function install() {
  await pwa?.install()
}

function dismiss() {
  pwa?.cancelInstall()
}
</script>

<template>
  <div v-if="pwa?.showInstallPrompt" class="fixed inset-x-0 bottom-16 md:bottom-4 z-40 px-4 md:px-0 md:right-4 md:left-auto md:max-w-sm">
    <UAlert
      :title="t('installAppTitle')" :description="t('installAppDescription')" icon="i-lucide-download"
      color="primary" variant="subtle" orientation="horizontal" close
      :actions="[{ label: t('install'), onClick: install }]"
      @update:open="dismiss"
    />
  </div>
</template>
