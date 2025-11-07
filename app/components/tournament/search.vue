<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'

const { t } = useI18n()

const UAvatar = resolveComponent('UAvatar')

const state = reactive({
  tournament: undefined,
})
const clubs = ref([])
const loading = ref(false)

const columns: TableColumn<any>[] = [{
  accessorKey: 'id',
  header: t('id'),
}, {
  accessorKey: 'logo',
  header: t('logo'),
  cell: ({ row }) => {
    const logo = row.getValue('logo')
    const acronym = row.getValue('acronym')

    return h(UAvatar, { alt: acronym, src: logo })
  },
}, {
  accessorKey: 'name',
  header: t('name'),
}, {
  accessorKey: 'acronym',
  header: t('acronym'),
}, {
  accessorKey: 'organization',
  header: t('organization'),
  cell: ({ row }) => {
    const organization = row.getValue('organization')
    if (organization && typeof organization === 'object' && 'name' in organization && 'logo' in organization) {
      return h(UAvatar, { alt: organization.name, src: organization.logo })
    }
    return null
  },
}]

const columnVisibility = ref({
  id: false,
})

async function onSearch() {
  loading.value = true
  const { data } = useAsyncData(`${state.tournament}`, () => $fetch('/api/dhb/tournament/search', {
    query: { tournamentName: state.tournament },
  }))
  clubs.value = data.value
  loading.value = false
}

function onRowSelected(e: Event, row: TableRow<any>) {
  const tournamentId = row.getValue('id')
  navigateTo(`/tournament/${tournamentId}`)
}
</script>

<template>
  <div>
    <UForm class="space-y-4" :state="state" @submit="onSearch">
      <UFormField label="Tournament">
        <UInput v-model="state.tournament" placeholder="HBL" />
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
