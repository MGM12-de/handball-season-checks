<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import { UAvatar } from '#components'
import { h } from 'vue'

const { t } = useI18n()

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
  accessorKey: 'id',
  header: 'ID',
}, {
  accessorKey: 'logo',
  header: 'Logo',
  cell: ({ row }) => {
    const alt = row.getValue('acronym') || ''
    const logo = row.getValue('logo') || ''
    return h(UAvatar, { alt: alt as string, src: logo as string })
  },
}, {
  accessorKey: 'name',
  header: `${t('name')}`,
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

const columnVisibility = ref({
  id: false,
})

async function onSearch() {
  loading.value = true
  const { data } = useAsyncData(`${state.clubName}`, () => $fetch('/api/dhb/searchClub', {
    query: { clubName: state.clubName },
  }))
  clubs.value = data.value
  loading.value = false
}

function onRowSelected(row: TableRow<Club>) {
  const clubId = row.getValue('id')
  navigateTo(`/club/details/${clubId}`)
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full">
    <UForm class="space-y-4" :state="state" @submit="onSearch">
      <UFormField :label="t('clubName')">
        <UInput v-model="state.clubName" placeholder="THW Kiel" @keydown.enter="onSearch" />
      </UFormField>
      <UButton type="submit" icon="i-lucide-search">
        {{ t('search') }}
      </UButton>
    </UForm>

    <UTable v-model:column-visibility="columnVisibility" :data="clubs" :columns="columns" :loading="loading"
      @select="onRowSelected" />
  </div>
</template>

<style></style>
