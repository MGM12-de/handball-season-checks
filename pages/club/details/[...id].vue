<template>
  <div>
    <UPage>
      <UPageHeader headline="Club details" :title="club.name" />
      <UPageBody>
        <ClubHeader :club="club" />
        <br /> <br />

        <TeamTable :clubId="club.id" />
      </UPageBody>
    </UPage>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
let club = ref({
  id: "",
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
  `club/${route.params.id}`,
  () => $fetch("/api/dhb/club", {
    query: { id: route.params.id }
  })
)
club = data

useSeoMeta({
  title: club.value.name,
  ogImageUrl: club.value.logo
})

</script>

<style></style>