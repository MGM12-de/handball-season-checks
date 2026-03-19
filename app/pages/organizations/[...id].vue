<script lang="ts" setup>
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
    relegated: TableRow[]
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
                // Within same organization, keep carrying the dynamic extra relegations.
                current.extraRelegations = prev.extraRelegations
            }
        }

        const combinedPromoted: TableRow[] = []
        const combinedRelegated: TableRow[] = []

        for (const table of current.tables) {
            const standardRelegatedCount = table.filter(row => row.relegated === true).length
            const totalRelegatedCount = standardRelegatedCount + current.extraRelegations

            table.forEach((row, index) => {
                const isPromoted = row.promoted === true
                const isRelegated = index >= table.length - totalRelegatedCount

                if (isPromoted)
                    combinedPromoted.push(row)

                if (isRelegated)
                    combinedRelegated.push({ ...row, relegated: true })
            })
        }

        results.push({
            title: config.title,
            promoted: combinedPromoted,
            relegated: combinedRelegated,
            organization: config.organization,
        })
    }

    return results
})
</script>

<template>
    <UPageHeader :title="`Organization ${organizationId}`" />

    <UPageBody>
        <div v-for="league in leagues" :key="league.title" class="mb-8 space-y-4">
            <h2 v-if="league.promoted.length || league.relegated.length" class="text-xl font-bold">
                {{ league.title }}
            </h2>

            <LazyUPageGrid v-if="league.promoted.length">
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

            <LazyUPageGrid v-if="league.relegated.length">
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
        </div>
    </UPageBody>
</template>

<style></style>
