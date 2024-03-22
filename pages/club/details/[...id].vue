<template>
  <div>
    <UPage>
      <UPageHeader headline="Club details" :title="club.name" />
      <UPageBody>
        <ULandingCard :title="club.acronym" :description="club.organization.name">
          <!-- <NuxtImg :src="club.logo" width="200" height="100" /> -->
          <UAvatarGroup size="2xl">
            <UAvatar :src="club.organization.logo" :alt="club.organization.acronym" />
            <UAvatar :src="club.logo" :alt="club.acronym" />
          </UAvatarGroup>
        </ULandingCard>
        <br /> <br />

        <TeamTable />
      </UPageBody>
    </UPage>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
let club = ref({
  name: "",
  logo: "",
  acronym: "",
  organization: {
    name: "",
    logo: "",
    acronym: ""
  }
})

const { data, pending, error, refresh } = await useAsyncData(
  `${route.params.id}`,
  () => $fetch("/api/dhb/club", {
    query: { id: route.params.id }
  })
)
club = data

</script>

<style></style>