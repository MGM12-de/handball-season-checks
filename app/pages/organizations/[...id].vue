<script lang="ts" setup>
import type { LeagueResult, TableRow } from '~~/types/league'

const { t } = useI18n()
const route = useRoute()

const combinedRelegationsCache = new WeakMap<LeagueResult, TableRow[]>()
const forcedRelegationSetCache = new WeakMap<LeagueResult, Set<TableRow>>()

const organizationId = computed(() => {
    const idParam = route.params.id
    const rawId = Array.isArray(idParam) ? idParam.join('-') : idParam
    return typeof rawId === 'string' ? rawId : ''
})

const selectedLeagueType = ref<'m' | 'f'>('m')


const {
    leagues,
    organizationName,
    loadingLeagueTitles,
    isLoadingLeagues,
    loadingError,
    totalLeagueCount,
    loadedLeagueCount,
} = useOrganizationLeagues(organizationId, selectedLeagueType)

const leagueTypeButtonLabel = computed(() => selectedLeagueType.value === 'm' ? 'Zu den Damen' : 'Zu den Herren')

function toggleLeagueType() {
    selectedLeagueType.value = selectedLeagueType.value === 'm' ? 'f' : 'm'
}

const loadingProgressPercent = computed(() => {
    if (!totalLeagueCount.value)
        return 0

    return Math.round((loadedLeagueCount.value / totalLeagueCount.value) * 100)
})

function getRowKey(prefix: string, row: TableRow, index: number): string {
    return `${prefix}-${row.team?.name ?? index}`
}

function getCombinedRelegations(league: LeagueResult): TableRow[] {
    const cachedRows = combinedRelegationsCache.get(league)
    if (cachedRows)
        return cachedRows

    const rows = [...league.relegated, ...league.forcedRelegations]
    combinedRelegationsCache.set(league, rows)
    return rows
}

function isForcedRelegation(league: LeagueResult, row: TableRow): boolean {
    let forcedRows = forcedRelegationSetCache.get(league)
    if (!forcedRows) {
        forcedRows = new Set(league.forcedRelegations)
        forcedRelegationSetCache.set(league, forcedRows)
    }

    return forcedRows.has(row)
}
</script>

<template>
    <UPageHeader :title="organizationName" />

    <UPageBody>
        <UButton :label="leagueTypeButtonLabel" class="mb-6" @click="toggleLeagueType" />
        <div v-if="isLoadingLeagues && totalLeagueCount" class="mb-6 space-y-2">
            <UProgress :model-value="loadedLeagueCount" :max="totalLeagueCount" size="sm" color="primary" status />
            <p class="text-sm text-muted">
                {{ loadedLeagueCount }} / {{ totalLeagueCount }} Ligen geladen ({{ loadingProgressPercent }}%)
            </p>
        </div>

        <UAlert v-if="loadingError" color="error" variant="subtle" icon="i-lucide-alert-circle" class="mb-6"
            :title="String(loadingError)" />

        <div v-for="league in leagues" :key="league.title" class="mb-8 space-y-4">
            <h2 v-if="league.promoted.length || league.promotionPlayoff.length || league.relegated.length || league.relegationPlayoff.length"
                class="text-xl font-bold">
                {{ league.title }}
            </h2>

            <div v-if="league.promoted.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    {{ t('promoted') }} ({{ league.promoted.length }} {{ t('teams') }})
                </h3>
                <LazyUPageGrid>
                    <TeamCard v-for="(row, index) in league.promoted" :key="getRowKey('p', row, index)" :row="row"
                        :league-organization="league.organization" highlight-color="success" />
                </LazyUPageGrid>
            </div>

            <div v-if="league.promotionPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    {{ t('promotionPlayoff') }} ({{ league.promotionPlayoffSpots }} <span
                        v-if="league.promotionPlayoffSpots !== 1">{{ t('ranks') }}</span><span v-else>{{ t('rank')
                        }}</span>)
                </h3>
                <LazyUPageGrid>
                    <TeamCard v-for="(row, index) in league.promotionPlayoff" :key="getRowKey('pr', row, index)"
                        :row="row" :league-organization="league.organization" highlight-color="warning" />
                </LazyUPageGrid>
            </div>

            <div v-if="league.relegated.length || league.forcedRelegations.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    {{ t('relegated') }} ({{ league.relegated.length + league.forcedRelegations.length }} {{ t('teams')
                    }})
                </h3>
                <LazyUPageGrid>
                    <TeamCard v-for="(row, index) in getCombinedRelegations(league)" :key="getRowKey('r', row, index)"
                        :row="row" :league-organization="league.organization" highlight-color="error"
                        :forced-relegation="isForcedRelegation(league, row)" />
                </LazyUPageGrid>
            </div>

            <div v-if="league.relegationPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    {{ t('relegationPlayoff') }} ({{ league.relegationPlayoffSpots }} <span
                        v-if="league.relegationPlayoffSpots !== 1">{{ t('ranks') }}</span><span v-else>{{ t('rank')
                        }}</span>)
                </h3>
                <LazyUPageGrid>
                    <TeamCard v-for="(row, index) in league.relegationPlayoff" :key="getRowKey('rr', row, index)"
                        :row="row" :league-organization="league.organization" highlight-color="warning" />
                </LazyUPageGrid>
            </div>
        </div>

        <div v-if="isLoadingLeagues && loadingLeagueTitles.length" class="space-y-8">
            <div v-for="title in loadingLeagueTitles" :key="`loading-${title}`" class="space-y-3">
                <h2 class="text-xl font-bold opacity-80">
                    {{ title }}
                </h2>

                <LazyUPageGrid>
                    <USkeleton class="h-28 w-full" />
                    <USkeleton class="h-28 w-full" />
                    <USkeleton class="h-28 w-full" />
                </LazyUPageGrid>
            </div>
        </div>

        <div v-else-if="isLoadingLeagues" class="space-y-3">
            <USkeleton class="h-8 w-48" />
            <LazyUPageGrid>
                <USkeleton class="h-28 w-full" />
                <USkeleton class="h-28 w-full" />
                <USkeleton class="h-28 w-full" />
            </LazyUPageGrid>
        </div>
    </UPageBody>
</template>

<style></style>
