<script lang="ts" setup>
const { t } = useI18n()
</script>

<template>
  <UPage>
    <UPageHeader :headline="t('tournament')" :title="t('tournaments')" :description="t('siteDescription')" />
    <UPageBody>
      <TournamentSearch />
    </UPageBody>
  </UPage>
</template>

<style></style>
