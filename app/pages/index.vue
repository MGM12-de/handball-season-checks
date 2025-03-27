<script lang="ts" setup>
</script>

<template>
  <UPage>
    <UPageHeader :headline="$t('handball')" :title="$t('siteTitle')"
      description="A website to check the current season" />
    <UPageBody>
      <ClubSearch />
    </UPageBody>
  </UPage>
</template>
