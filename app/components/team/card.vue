<script lang="ts" setup>
import type { OrganizationObject, TableRow, TeamOrganization } from '~~/types/league'
import { LeagueSeasonCalculator } from '~/services/LeagueSeasonCalculator'

const props = defineProps<{
  row: TableRow
  leagueOrganization: string
  highlightColor: 'success' | 'warning' | 'error'
  forcedRelegation?: boolean
}>()

const { t } = useI18n()
const { getForeignOrganizations } = LeagueSeasonCalculator

const foreignOrganizations = computed<OrganizationObject[]>(() =>
  getForeignOrganizations(props.row.team?.organizations as TeamOrganization[] | undefined, props.leagueOrganization),
)
</script>

<template>
  <UPageCard :title="row.team?.name || t('unknownTeam')" orientation="horizontal" reverse highlight
    :highlight-color="highlightColor" :spotlight-color="highlightColor" spotlight>
    <NuxtImg :src="row.team?.logo" :alt="t('teamLogo')" class="w-16 h-16 object-contain" loading="lazy" />

    <template #footer>
      <UBadge v-for="n in foreignOrganizations" :key="n.id || n.name" :color="(n.color as any) || 'primary'"
        class="ml-auto" size="md">
        {{ n.name }}
      </UBadge>

      <UBadge v-if="row.promotionBlocked" color="warning" variant="subtle" size="md">
        {{ t('promotionBlocked') }}
      </UBadge>

      <UBadge v-if="forcedRelegation" color="error" variant="subtle" size="md">
        {{ t('forcedRelegation') }}
      </UBadge>

      <UBadge v-if="row.withdrawn" color="neutral" variant="subtle" size="md">
        {{ t('withdrawn') }}
      </UBadge>
    </template>
  </UPageCard>
</template>
