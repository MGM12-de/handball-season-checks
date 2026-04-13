<script lang="ts" setup>
import type { LeagueResult, OrganizationObject, TableRow, TeamOrganization } from '~~/types/league'
import { LeagueSeasonCalculator } from '~/services/LeagueSeasonCalculator'

const { getForeignOrganizations } = LeagueSeasonCalculator
const { t } = useI18n()
const route = useRoute()

const foreignOrganizationsCache = new WeakMap<TeamOrganization[], Map<string, OrganizationObject[]>>()
const combinedRelegationsCache = new WeakMap<LeagueResult, TableRow[]>()
const forcedRelegationSetCache = new WeakMap<LeagueResult, Set<TableRow>>()

const organizationId = computed(() => {
    const idParam = route.params.id
    const rawId = Array.isArray(idParam) ? idParam.join('-') : idParam
    return typeof rawId === 'string' ? rawId : ''
})

const { leagues, organizationName } = useOrganizationLeagues(organizationId)

function getRowKey(prefix: string, row: TableRow, index: number): string {
    return `${prefix}-${row.team?.name ?? index}`
}

function getForeignOrganizationsCached(orgs: TeamOrganization[] | undefined, leagueOrganization: string): OrganizationObject[] {
    if (!orgs?.length)
        return []

    let byLeagueOrganization = foreignOrganizationsCache.get(orgs)
    if (!byLeagueOrganization) {
        byLeagueOrganization = new Map<string, OrganizationObject[]>()
        foreignOrganizationsCache.set(orgs, byLeagueOrganization)
    }

    const cachedOrganizations = byLeagueOrganization.get(leagueOrganization)
    if (cachedOrganizations)
        return cachedOrganizations

    const organizations = getForeignOrganizations(orgs, leagueOrganization)
    byLeagueOrganization.set(leagueOrganization, organizations)
    return organizations
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
                    <UPageCard v-for="(row, index) in league.promoted" :key="getRowKey('p', row, index)"
                        :title="row.team?.name || t('unknownTeam')" orientation="horizontal" reverse highlight
                        highlight-color="success" spotlight-color="success" spotlight>
                        <img :src="row.team?.logo" :alt="t('teamLogo')" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizationsCached(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>
                            <UBadge v-if="row.promotionBlocked" color="warning" variant="subtle" size="md">
                                {{ t('promotionBlocked') }}
                            </UBadge>
                            <UBadge v-if="row.withdrawn" color="neutral" variant="subtle" size="md">
                                {{ t('withdrawn') }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>

            <div v-if="league.promotionPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    {{ t('promotionPlayoff') }} ({{ league.promotionPlayoffSpots }} <span
                        v-if="league.promotionPlayoffSpots !== 1">{{ t('ranks') }}</span><span v-else>{{ t('rank')
                        }}</span>)
                </h3>
                <LazyUPageGrid>
                    <UPageCard v-for="(row, index) in league.promotionPlayoff" :key="getRowKey('pr', row, index)"
                        :title="row.team?.name || t('unknownTeam')" orientation="horizontal" reverse highlight
                        highlight-color="warning" spotlight-color="warning" spotlight>
                        <img :src="row.team?.logo" :alt="t('teamLogo')" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizationsCached(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>
                            <UBadge v-if="row.promotionBlocked" color="warning" variant="subtle" size="md">
                                {{ t('promotionBlocked') }}
                            </UBadge>
                            <UBadge v-if="row.withdrawn" color="neutral" variant="subtle" size="md">
                                {{ t('withdrawn') }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>

            <div v-if="league.relegated.length || league.forcedRelegations.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    {{ t('relegated') }} ({{ league.relegated.length + league.forcedRelegations.length }} {{ t('teams')
                    }})
                </h3>
                <LazyUPageGrid>
                    <UPageCard v-for="(row, index) in getCombinedRelegations(league)"
                        :key="getRowKey('r', row, index)" :title="row.team?.name || t('unknownTeam')" orientation="horizontal"
                        reverse highlight highlight-color="error" spotlight-color="error" spotlight>
                        <img :src="row.team?.logo" :alt="t('teamLogo')" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizationsCached(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>
                            <UBadge v-if="isForcedRelegation(league, row)" color="error" variant="subtle"
                                size="md">
                                {{ t('forcedRelegation') }}
                            </UBadge>
                            <UBadge v-if="row.withdrawn" color="neutral" variant="subtle" size="md">
                                {{ t('withdrawn') }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>

            <div v-if="league.relegationPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    {{ t('relegationPlayoff') }} ({{ league.relegationPlayoffSpots }} <span
                        v-if="league.relegationPlayoffSpots !== 1">{{ t('ranks') }}</span><span v-else>{{ t('rank')
                        }}</span>)
                </h3>
                <LazyUPageGrid>
                    <UPageCard v-for="(row, index) in league.relegationPlayoff" :key="getRowKey('rr', row, index)"
                        :title="row.team?.name || t('unknownTeam')" orientation="horizontal" reverse highlight
                        highlight-color="warning" spotlight-color="warning" spotlight>
                        <img :src="row.team?.logo" :alt="t('teamLogo')" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizationsCached(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>

                            <UBadge v-if="row.withdrawn" color="neutral" variant="subtle" size="md">
                                {{ t('withdrawn') }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>
        </div>
    </UPageBody>
</template>

<style></style>
