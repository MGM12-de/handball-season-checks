<script lang="ts" setup>
const { t } = useI18n()
</script>

<template>
  <UPage>
    <UPageHeader :headline="t('handball')" :title="t('siteTitle')"
      description="A website to check the current season" />
    <UPageBody>
      <ClubSearch />
    </UPageBody>
  </UPage>
</template>
