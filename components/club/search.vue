<script lang="ts" setup>
const state = reactive({
  clubName: undefined,
})
const clubs = ref([])
const loading = ref(false)

const columns = [{
  key: 'logo',
  label: 'Logo',
}, {
  key: 'name',
  label: 'Name',
}, {
  key: 'acronym',
  label: 'Acronym',
}, {
  key: 'organization',
  label: 'Organization',
}]

async function onSearch() {
  loading.value = true
  const { data } = useAsyncData(`${state.clubName}`, () => $fetch('/api/dhb/searchClub', {
    query: { clubName: state.clubName },
  }))
  clubs.value = data
  loading.value = false
}

function onRowSelected(row) {
  navigateTo(`/club/details/${row.id}`)
}
</script>

<template>
  <div>
    <UForm class="space-y-4" @submit="onSearch">
      <UFormGroup label="Club name">
        <UInput v-model="state.clubName" />
      </UFormGroup>
      <UButton type="submit">
        Search
      </UButton>
    </UForm>

    <UTable :rows="clubs" :columns="columns" :loading="loading" @select="onRowSelected">
      <template #logo-data="{ row }">
        <UAvatar :src="row.logo" :alt="row.acronym" />
      </template>

      <template #organization-data="{ row }">
        <UAvatar :src="row.organization.logo" :alt="row.organization.name" />
        <span>{{ row.organization.name }}</span>
      </template>
    </UTable>
  </div>
</template>

<style></style>
