<template>
  <div>
    <ULandingCard :title="club.acronym" :description="club.organization.name">
      <!-- <NuxtImg :src="club.logo" width="200" height="100" /> -->
      <UAvatarGroup size="2xl">
        <UAvatar :src="club.organization.logo" :alt="club.organization.acronym" />
        <UAvatar :src="club.logo" :alt="club.acronym" />
      </UAvatarGroup>
    </ULandingCard>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps({
  club: {
    type: Object,
    required: true
  }
})
const { club } = props;
</script>

<style></style>