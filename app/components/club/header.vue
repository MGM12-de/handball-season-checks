<script lang="ts" setup>
const props = defineProps({
  club: {
    type: Object,
    required: true,
  },
})
const { t } = useI18n()
const memberClubs = ref(useState(() => []))
const { club } = props

if (club.hasMemberClubs) {
  useAsyncData(
    `club/${club.id}/memberClubs`,
    () => $fetch('/api/dhb/club/memberClubs', {
      query: { id: club.id },
    }),
  ).then(
    (response) => {
      memberClubs.value = response.data || []
    },
  )
}
</script>

<template>
  <div>
    <UPageCard :title="club.acronym" :description="club.organization.name" orientation="horizontal">
      <UAvatarGroup size="2xl">
        <UAvatar :src="club.organization.logo" :alt="club.organization.acronym" />
        <UAvatar :src="club.logo" :alt="club.acronym" />
      </UAvatarGroup>
      <div v-if="club.hasMemberClubs">
        <h2>{{ t('memberClubs') }}</h2>
        <div v-for="member in memberClubs" :key="member.id">
          <UBadge :avatar="{ src: member.logo, alt: member.acronym }" size="lg" variant="outline" color="neutral"
            class="m-1">
            {{ member.name }}
          </UBadge>
        </div>
      </div>
      <ClubInfo :club="club" />
    </UPageCard>
  </div>
</template>

<style scoped>
:deep(img) {
  object-fit: contain !important;
  object-position: center !important;
}
</style>
