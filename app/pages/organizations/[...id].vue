<script lang="ts" setup>
import organizationsIndex from '~~/content/organizations/index.json'

const route = useRoute()

const organizationId = computed(() => {
    const idParam = route.params.id
    const rawId = Array.isArray(idParam) ? idParam.join('-') : idParam
    return typeof rawId === 'string' ? rawId : ''
})

interface LeagueConfig {
    title: string
    ids: string[]
    organization: string
    sort: number
    promoted: number
    relegated: number
}

interface OrganizationObject {
    id?: string
    name?: string
}

interface OrganizationListItem {
    id: string
    name: string
    parent?: string
}

type TeamOrganization = OrganizationObject | string

interface TableRow {
    team?: {
        name?: string
        logo?: string
        organizations?: TeamOrganization[]
    }
    promoted?: boolean
    relegated?: boolean
    [key: string]: unknown
}

interface LeagueResult {
    title: string
    promoted: TableRow[]
    promotionPlayoff: TableRow[]
    promotionPlayoffSpots: number
    relegated: TableRow[]
    relegationPlayoff: TableRow[]
    relegationPlayoffSpots: number
    organization: string
}

function isOrganizationObject(organization: TeamOrganization): organization is OrganizationObject {
    return typeof organization !== 'string'
}

function matchesOrganization(organization: TeamOrganization, leagueOrganization: string) {
    if (typeof organization === 'string')
        return organization === leagueOrganization

    return organization.id === leagueOrganization || organization.name === leagueOrganization
}

function getForeignOrganizations(organizations: TeamOrganization[] | undefined, leagueOrganization: string) {
    return (organizations || [])
        .filter(isOrganizationObject)
        .filter(org => org.id !== leagueOrganization)
}

function getOrganizationScope(orgId: string) {
    const scope = new Set<string>(['dhb'])

    if (!orgId)
        return scope

    let current = orgId
    scope.add(current)

    while (current.includes('-')) {
        current = current.slice(0, current.lastIndexOf('-'))
        scope.add(current)
    }

    return scope
}

const organizationName = computed(() => {
    const organization = (organizationsIndex as OrganizationListItem[]).find(item => item.id === organizationId.value)
    return organization?.name || organizationId.value
})

const { data: leagues } = useAsyncData(() => `organization-leagues-${organizationId.value || 'all'}`, async () => {
    const leagueConfigs = (await queryCollection('leagues').all()) as LeagueConfig[]
    const allowedOrganizations = getOrganizationScope(organizationId.value)
    const filteredLeagueConfigs = leagueConfigs.filter(config => allowedOrganizations.has(config.organization))

    const rawLeagues = await Promise.all(
        filteredLeagueConfigs.map(async (config) => {
            // Load all tables for one league level (e.g. all 8 Landesligen) in parallel.
            const tables = await Promise.all(
                config.ids.map(id => $fetch<TableRow[]>(`/api/dhb/tournament/table?id=${id}`)),
            )

            return { config, tables, extraRelegations: 0 }
        }),
    )

    // Sort by configured order so relegation propagation runs from top to bottom.
    rawLeagues.sort((a, b) => a.config.sort - b.config.sort)

    const results: LeagueResult[] = []

    for (let i = 0; i < rawLeagues.length; i++) {
        const current = rawLeagues[i]!
        const config = current.config

        if (i > 0) {
            const prev = rawLeagues[i - 1]!
            const prevResult = results[i - 1]

            // If organization changes (e.g. dhb -> bwhv), carry down matching relegations.
            if (prev.config.organization !== config.organization) {
                const prevRelegated = results[i - 1]?.relegated || []

                const matchingCount = prevRelegated.filter((row) => {
                    const orgs = row.team?.organizations || []
                    return orgs.some(org => matchesOrganization(org, config.organization))
                }).length

                current.extraRelegations = matchingCount
            }
            else {
                // Within same organization, playoff losers of the higher league are guaranteed relegations.
                const guaranteedPlayoffLosers = prevResult?.relegationPlayoffSpots || 0
                current.extraRelegations = prev.extraRelegations + guaranteedPlayoffLosers
            }
        }

        const tableCount = Math.max(current.tables.length, 1)
        const totalPromotedCount = config.promoted
        const hasConfiguredRelegation = config.relegated > 0
        const totalRelegatedCount = hasConfiguredRelegation ? config.relegated + current.extraRelegations : 0

        const directPromotedPerTable = Math.floor(totalPromotedCount / tableCount)
        const promotionPlayoffSpots = totalPromotedCount % tableCount
        const directRelegatedPerTable = Math.floor(totalRelegatedCount / tableCount)
        const relegationPlayoffSpots = totalRelegatedCount % tableCount

        const combinedPromoted: TableRow[] = []
        const combinedPromotionPlayoff: TableRow[] = []
        const combinedRelegated: TableRow[] = []
        const combinedRelegationPlayoff: TableRow[] = []

        for (const table of current.tables) {
            const promotionPlayoffIndex = directPromotedPerTable
            const relegationPlayoffIndex = table.length - directRelegatedPerTable - 1
            const relegationStartIndex = Math.max(table.length - directRelegatedPerTable, 0)

            table.forEach((row, index) => {
                const isPromoted = index < directPromotedPerTable
                const isPromotionPlayoff = promotionPlayoffSpots > 0 && index === promotionPlayoffIndex
                const isRelegated = index >= relegationStartIndex
                const isRelegationPlayoff = relegationPlayoffSpots > 0 && index === relegationPlayoffIndex && !isRelegated

                if (isPromoted)
                    combinedPromoted.push(row)

                if (isPromotionPlayoff)
                    combinedPromotionPlayoff.push(row)

                if (isRelegated)
                    combinedRelegated.push({ ...row, relegated: true })

                if (isRelegationPlayoff)
                    combinedRelegationPlayoff.push(row)
            })
        }

        results.push({
            title: config.title,
            promoted: combinedPromoted,
            promotionPlayoff: combinedPromotionPlayoff,
            promotionPlayoffSpots,
            relegated: combinedRelegated,
            relegationPlayoff: combinedRelegationPlayoff,
            relegationPlayoffSpots,
            organization: config.organization,
        })
    }

    return results
})
</script>

<template>
    <UPageHeader :title="organizationName" />

    <UPageBody>
        <div v-for="league in leagues" :key="league.title" class="mb-8 space-y-4">
            <h2 v-if="league.promoted.length || league.promotionPlayoff.length || league.relegated.length || league.relegationPlayoff.length"
                class="text-xl font-bold">
                {{ league.title }}
            </h2>

            <LazyUPageGrid v-if="league.promoted.length">
                <h3 class="text-base font-semibold text-warning-600">
                    Aufsteiger
                </h3>
                <UPageCard v-for="(row, index) in league.promoted" :key="`p-${index}`"
                    :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                    highlight-color="success">
                    <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                    <template #footer>
                        <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                            :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                            {{ n.name }}
                        </UBadge>
                    </template>
                </UPageCard>
            </LazyUPageGrid>

            <div v-if="league.promotionPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    Aufstiegsrelegation ({{ league.promotionPlayoffSpots }} Platz<span
                        v-if="league.promotionPlayoffSpots !== 1">e</span>)
                </h3>
                <LazyUPageGrid>
                    <UPageCard v-for="(row, index) in league.promotionPlayoff" :key="`pr-${index}`"
                        :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                        highlight-color="warning">
                        <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>

            <LazyUPageGrid v-if="league.relegated.length">
                <h3 class="text-base font-semibold text-warning-600">
                    Absteiger
                </h3>
                <UPageCard v-for="(row, index) in league.relegated" :key="`r-${index}`"
                    :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                    highlight-color="error">
                    <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                    <template #footer>
                        <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                            :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                            {{ n.name }}
                        </UBadge>
                    </template>
                </UPageCard>
            </LazyUPageGrid>

            <div v-if="league.relegationPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    Abstiegsrelegation ({{ league.relegationPlayoffSpots }} Platz<span
                        v-if="league.relegationPlayoffSpots !== 1">e</span>)
                </h3>
                <LazyUPageGrid>
                    <UPageCard v-for="(row, index) in league.relegationPlayoff" :key="`rr-${index}`"
                        :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                        highlight-color="warning">
                        <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>
        </div>
    </UPageBody>
</template>

<style></style>
