import type { Ref } from 'vue'
import type { LeagueConfig, LeagueResult, OrganizationListItem, TableRow } from '~~/types/league'
import organizationsIndex from '~~/content/organizations/index.json'
import { LeagueSeasonCalculator } from '~/services/LeagueSeasonCalculator'

interface RawLeague {
    config: LeagueConfig
    tables: TableRow[][]
}

function matchesLeagueType(config: LeagueConfig, type: 'm' | 'f'): boolean {
    return config.ids.some((id) => {
        const idLower = id.toLowerCase()

        if (idLower.includes('.m-') || idLower.includes('/m-'))
            return type === 'm'

        if (idLower.includes('.f-') || idLower.includes('/f-'))
            return type === 'f'

        // DHB 3. Liga uses numeric Sportradar IDs without m-/f- markers.
        if (idLower.includes('sportradar.dhbdata.16059'))
            return type === 'm'

        if (idLower.includes('sportradar.dhbdata.16060'))
            return type === 'f'

        return false
    })
}

export function useOrganizationLeagues(organizationId: Ref<string>, type: Ref<'m' | 'f'>) {
    const organizationName = computed(() => {
        const found = (organizationsIndex as OrganizationListItem[]).find(item => item.id === organizationId.value)
        return found?.name ?? organizationId.value
    })

    const leagues = ref<LeagueResult[]>([])
    const loadingLeagueTitles = ref<string[]>([])
    const isLoadingLeagues = ref(false)
    const loadingError = ref<unknown>(null)
    const totalLeagueCount = ref(0)
    const loadedLeagueCount = ref(0)
    let requestCounter = 0

    watch([organizationId, type], async () => {
        const requestId = ++requestCounter

        leagues.value = []
        loadingLeagueTitles.value = []
        loadingError.value = null
        totalLeagueCount.value = 0
        loadedLeagueCount.value = 0
        isLoadingLeagues.value = true

        try {
            const calculator = new LeagueSeasonCalculator(organizationId.value)
            const allConfigs = (await queryCollection('leagues').all()) as LeagueConfig[]
            const filteredConfigs = calculator
                .filterConfigs(allConfigs)
                .filter(config => matchesLeagueType(config, type.value))
                .toSorted((a, b) => a.sort - b.sort)

            if (requestId !== requestCounter)
                return

            totalLeagueCount.value = filteredConfigs.length
            loadingLeagueTitles.value = filteredConfigs.map(config => config.title)

            const rawLeagues: RawLeague[] = []

            for (const config of filteredConfigs) {
                const tables = await Promise.all(
                    config.ids.map(id => $fetch<TableRow[]>(`/api/dhb/tournament/table?id=${id}`)),
                )

                if (requestId !== requestCounter)
                    return

                rawLeagues.push({ config, tables })
                leagues.value = calculator.calculate(rawLeagues)
                loadedLeagueCount.value = rawLeagues.length
                loadingLeagueTitles.value = filteredConfigs.slice(rawLeagues.length).map(item => item.title)
            }
        }
        catch (error) {
            if (requestId !== requestCounter)
                return
            loadingError.value = error
        }
        finally {
            if (requestId === requestCounter)
                isLoadingLeagues.value = false
        }
    }, { immediate: true })

    return {
        leagues,
        organizationName,
        loadingLeagueTitles,
        isLoadingLeagues,
        loadingError,
        totalLeagueCount,
        loadedLeagueCount,
    }
}
