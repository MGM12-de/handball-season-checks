<template>
  <div>
    <UPage>
      <UPageHeader headline="Club details" :title="club.name" />
      <UPageBody>
        <ClubHeader />
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
  `club/${route.params.id}`,
  () => $fetch("/api/dhb/club", {
    query: { id: route.params.id }
  })
)
club = data

</script>

<style></style>