<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import { watchDebounced } from '@vueuse/core'
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
  if (!state.tournament || state.tournament.trim().length < 2) {
    return
  }

  loading.value = true
  const { data } = useAsyncData(`${state.tournament}`, () => $fetch('/api/dhb/tournament/search', {
    query: { tournamentName: state.tournament },
  }))
  clubs.value = data.value
  loading.value = false
}

watchDebounced(() => state.tournament, () => {
  if (!state.tournament || state.tournament.trim().length < 2) {
    clubs.value = []
    return
  }

  onSearch()
}, { debounce: 400 })

function onRowSelected(e: Event, row: TableRow<any>) {
  const tournamentId = row.getValue('id')
  navigateTo(`/tournament/${tournamentId}`)
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full gap-6">
    <UForm class="space-y-4" :state="state" @submit="onSearch">
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <UFormField :label="t('tournament')" class="w-full sm:flex-1">
          <UInput v-model="state.tournament" placeholder="HBL" @keydown.enter="onSearch" />
        </UFormField>
        <UButton type="submit" icon="i-lucide-search" class="w-full sm:w-auto flex justify-center">
          {{ t('search') }}
        </UButton>
      </div>
    </UForm>

    <div class="block md:hidden space-y-4">
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
      </div>
      <UCard v-for="tournament in clubs" v-else :key="tournament.id" class="p-4 cursor-pointer hover:bg-elevated transition-colors" @click="navigateTo(`/tournament/${tournament.id}`)">
        <div class="flex items-center gap-4">
          <UAvatar :src="tournament.logo" :alt="tournament.acronym" size="lg" class="shrink-0 bg-white" />
          <div class="flex flex-col flex-1 min-w-0">
            <div class="font-bold text-lg truncate">
              {{ tournament.name }}
            </div>
            <div class="text-sm text-muted flex items-center gap-2 mt-1">
              <UBadge v-if="tournament.acronym" :label="tournament.acronym" size="xs" variant="subtle" />
              <div v-if="tournament.organization" class="flex items-center gap-1 ml-auto">
                <UAvatar :src="tournament.organization.logo" :alt="tournament.organization.name" size="2xs" class="bg-white" />
                <span class="truncate max-w-[100px]">{{ tournament.organization.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div v-if="clubs && clubs.length === 0 && !loading && state.tournament" class="text-center py-8 text-muted">
        {{ t('noData') }}
      </div>
    </div>

    <div class="hidden md:block">
      <UTable
        v-model:column-visibility="columnVisibility" :data="clubs" :columns="columns" :loading="loading"
        @select="onRowSelected"
      />
    </div>
  </div>
</template>

<style></style>
