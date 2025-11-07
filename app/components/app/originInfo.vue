<script lang="ts" setup>
const { t } = useI18n()
</script>

<template>
  <div>
    <br>
    <UAlert icon="i-heroicons-command-line" color="primary" variant="solid" :title="t('originInfoTitle')"
      :description="t('originInfoDescription')" />
    <br>
    <ULink to="https://handball.net" active-class="text-primary"
      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
      https://handball.net
    </ULink>
    <br>
  </div>
</template>

<style></style>
