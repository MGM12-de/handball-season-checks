<template>
  <div>
    <UPage>
      <UPageHeader headline="Handball" title="Club Details" />
      <UPageBody>
        <p> {{ club }}</p>
      </UPageBody>
    </UPage>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
let club = ref()

const { data, pending, error, refresh } = await useAsyncData(
  `${route.params.id}`,
  () => $fetch("/api/dhb/club", {
    query: { id: route.params.id }
  })
)
club = data

</script>

<style></style>