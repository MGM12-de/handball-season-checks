<template>
  <div>
    <UForm @submit="onSearch" class="space-y-4">
      <UFormGroup label="Club name">
        <UInput v-model="state.clubName" />
      </UFormGroup>
      <UButton type="submit">
        Search
      </UButton>
    </UForm>

    <UTable :rows="clubs" :columns="columns" :loading="loading" @select="onRowSelected">
      <template #logo-data="{row}">
        <UAvatar :src="row.logo" :alt="row.acronym" /> 
      </template>

      <template #organization-data="{row}">
        <UAvatar :src="row.organization.logo" :alt="row.organization.name" /> 
        <span>{{ row.organization.name }}</span>
      </template>
    </UTable>
  </div>
</template>

<script lang="ts" setup>
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types'
const state = reactive({
  clubName: undefined,
})
var clubs = ref([])
var loading = ref(false)

const columns = [{
  key: "logo",
  label: "Logo"},{
  key: "name",
  label: "Name"
}, {
  key: "acronym",
  label: "Acronym"
},{
  key: "organization",
  label: "Organization"
}]

const onSearch = async (event: FormSubmitEvent<any>) => {
  loading.value = true
  const { data, pending, error, refresh } = useAsyncData(`${state.clubName}`
    , () => $fetch("/api/dhb/searchClub", {
      query: { clubName: state.clubName }
    }))
  clubs = data
  loading.value = false
}

const onRowSelected = (row) => {
  navigateTo(`/club/details/${row.id}`)
}

</script>

<style></style>