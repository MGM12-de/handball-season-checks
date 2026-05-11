<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui'
import { UAvatar, UButton } from '#components'
import { h } from 'vue'
import { useFavorites } from '~/composables/useFavorites'

const { t } = useI18n()
const { isFavoriteClub, toggleFavoriteClub } = useFavorites()

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
  header: t('logo'),
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
  header: t('acronym'),
}, {
  accessorKey: 'organization',
  header: t('organization'),
  cell: ({ row }) => {
    const org = row.getValue('organization') as Club['organization'] || { name: '', logo: '' }
    return h(UAvatar, { src: org.logo, alt: org.name })
  },
}, {
  id: 'favorite',
  header: '',
  cell: ({ row }) => {
    const club = row.original
    const isFav = isFavoriteClub(club.id.toString())
    return h(UButton, {
      icon: isFav ? 'i-heroicons-star-solid' : 'i-heroicons-star',
      color: isFav ? 'primary' : 'gray',
      variant: 'ghost',
      title: isFav ? t('removeFromFavorites') : t('addToFavorites'),
      onClick: (e: Event) => {
        e.stopPropagation()
        toggleFavoriteClub({
          id: club.id.toString(),
          name: club.name,
          logo: club.logo,
          acronym: club.acronym,
          organizationName: club.organization?.name,
        })
      },
    })
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

function onRowSelected(e: Event, row: TableRow<Club>) {
  const clubId = row.getValue('id')
  navigateTo(`/club/details/${clubId}`)
}
</script>

<template>
  <div class="flex flex-col flex-1 w-full gap-6">
    <UForm class="space-y-4" :state="state" @submit="onSearch">
      <div class="flex flex-col sm:flex-row gap-4 items-end">
        <UFormField :label="t('clubName')" class="w-full sm:flex-1">
          <UInput v-model="state.clubName" placeholder="THW Kiel" @keydown.enter="onSearch" />
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
      <UCard v-for="club in clubs" v-else :key="club.id" class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="navigateTo(`/club/details/${club.id}`)">
        <div class="flex items-center gap-4">
          <UAvatar :src="club.logo" :alt="club.acronym" size="lg" class="shrink-0 bg-white" />
          <div class="flex flex-col flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <div class="font-bold text-lg truncate">
                {{ club.name }}
              </div>
              <UButton
                :icon="isFavoriteClub(club.id.toString()) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                :color="isFavoriteClub(club.id.toString()) ? 'primary' : 'gray'"
                variant="ghost"
                class="ml-2"
                :title="isFavoriteClub(club.id.toString()) ? t('removeFromFavorites') : t('addToFavorites')"
                @click.stop="toggleFavoriteClub({ id: club.id.toString(), name: club.name, logo: club.logo, acronym: club.acronym, organizationName: club.organization?.name })"
              />
            </div>
            <div class="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <UBadge v-if="club.acronym" :label="club.acronym" size="xs" variant="subtle" />
              <div v-if="club.organization" class="flex items-center gap-1 ml-auto">
                <UAvatar :src="club.organization.logo" :alt="club.organization.name" size="2xs" class="bg-white" />
                <span class="truncate max-w-[100px]">{{ club.organization.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <div v-if="clubs && clubs.length === 0 && !loading && state.clubName" class="text-center py-8 text-gray-500">
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
