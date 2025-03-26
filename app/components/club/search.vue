<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import { UAvatar } from '#components'
import { h } from 'vue'

interface Club {
  id: number
  name: string
  acronym: string
  logo: string
  organization: {
    id: number
    name: string
    logo: string
  }
}

const state = reactive({
  clubName: undefined,
})
const clubs = ref([])
const loading = ref(false)

const columns: TableColumn<Club>[] = [{
  accessorKey: 'logo',
  header: 'Logo',
  cell: ({ row }) => {
    const alt = row.getValue('acronym') || ''
    const logo = row.getValue('logo') || ''
    return h(UAvatar, { alt: alt as string, src: logo as string })
  },
}, {
  accessorKey: 'name',
  header: 'Name',
}, {
  accessorKey: 'acronym',
  header: 'Acronym',
}, {
  accessorKey: 'organization',
  header: 'Organization',
  cell: ({ row }) => {
    const org = row.getValue('organization') as Club['organization'] || { name: '', logo: '' }
    return h(UAvatar, { src: org.logo, alt: org.name })
  },
}]

async function onSearch() {
  loading.value = true
  const { data } = useAsyncData(`${state.clubName}`, () => $fetch('/api/dhb/searchClub', {
    query: { clubName: state.clubName },
  }))
  clubs.value = data.value
  loading.value = false
}

function onRowSelected(row: TableRow<Club>) {
  navigateTo(`/club/details/${row.id}`)
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <UForm class="space-y-4" :state="state" @submit="onSearch">
      <UFormField label="Club name">
        <UInput v-model="state.clubName" placeholder="THW Kiel" />
      </UFormField>
      <UButton type="submit" icon="i-lucide-search">
        Search
      </UButton>
    </UForm>

    <UTable :data="clubs" :columns="columns" :loading="loading" @select="onRowSelected" />
  </div>
</template>

<style></style>
