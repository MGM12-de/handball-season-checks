<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'

const props = defineProps({
  games: {
    type: Array,
    required: true,
  },
  gamesPending: {
    type: Boolean,
    required: true,
  },
})

const { t } = useI18n()

const { games, gamesPending } = props

// Helper function to check if a column should be shown
function shouldShowColumn(fieldName: string) {
  return computed(() => {
    if (!games || games.length === 0)
      return false
    return games.some((game) => {
      const value = fieldName.includes('.')
        ? fieldName.split('.').reduce((obj, key) => obj?.[key], game)
        : game[fieldName]
      return value && String(value).trim() !== ''
    })
  })
}

// Define conditional columns with their visibility logic
const conditionalColumns = [
  { key: 'remarks', label: t('remarks'), shouldShow: shouldShowColumn('remarks') },
  {
    key: 'pdfUrl',
    label: 'PDF',
    shouldShow: shouldShowColumn('pdfUrl'),
    cell: ({ row }) => {
      if (!row.original.pdfUrl)
        return ''
      return h(resolveComponent('UButton'), {
        'to': row.original.pdfUrl,
        'target': '_blank',
        'icon': 'i-heroicons-document-text',
        'color': 'neutral',
        'variant': 'ghost',
        'aria-label': 'Open PDF',
      })
    },
  },
]

const columns = computed<TableColumn<any>[]>(() => {
  const baseColumns: TableColumn<any>[] = [
    { accessorKey: 'startsAt', header: t('date') },
    { accessorKey: 'field.name', header: t('location') },
    { accessorKey: 'homeTeam.name', header: t('homeTeam') },
    { accessorKey: 'awayTeam.name', header: t('awayTeam') },
    { accessorKey: 'result', header: t('result') },
  ]

  // Add conditional columns
  conditionalColumns.forEach(({ key, label, shouldShow, cell }) => {
    if (shouldShow.value) {
      const column = {
        accessorKey: key,
        header: label,
      }

      // Add custom cell renderer if provided
      if (cell) {
        column.cell = cell
      }

      baseColumns.push(column)
    }
  })

  return baseColumns
})
</script>

<template>
  <div>
    <!-- Mobile card layout -->
    <div class="block md:hidden space-y-4">
      <div v-if="gamesPending" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-24 w-full" />
      </div>
      <UCard v-for="game in games" v-else :key="game.id" class="p-4">
        <template #header>
          <div class="flex justify-between items-start">
            {{ game.homeTeam?.name }} vs {{ game.awayTeam?.name }}
            <div v-if="game.result" class="text-sm font-medium text-success">
              {{ game.result }}
            </div>
          </div>
        </template>

        <div class="space-y-2">
          <div class="text-sm text-muted">
            {{ game.startsAt }}
          </div>
          <div v-if="game.field?.name" class="text-sm text-muted">
            📍 {{ game.field.name }}
          </div>
        </div>

        <template #footer>
          <div v-if="game.remarks" class="text-sm text-toned">
            <UIcon name="i-heroicons-document" /> {{ game.remarks }}
          </div>
          <div class="grid grid-cols-2 gap-4 items-center">
            <div v-if="game.referee" class="text-sm text-toned">
              <UIcon name="i-heroicons-users" /> {{ game.referee }}
            </div>
            <div v-if="game.pdfUrl" class="pt-2 justify-self-end">
              <UButton :to="game.pdfUrl" target="_blank" size="xs" variant="outline" icon="i-heroicons-document-text">
                View PDF
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Desktop table -->
    <div class="hidden md:block">
      <UTable :data="games" :loading="gamesPending" :columns="columns" sticky />
    </div>
  </div>
</template>

<style></style>
