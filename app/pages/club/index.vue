<script lang="ts" setup>
const { t } = useI18n()
</script>

<template>
  <UPage>
    <UPageHeader :headline="t('handball')" :title="t('searchClub')" :description="t('searchClubDescription')" />
    <UPageBody>
      <ClubSearch />
    </UPageBody>
  </UPage>
</template>

<style></style>
