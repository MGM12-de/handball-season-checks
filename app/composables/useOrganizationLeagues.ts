import type { Ref } from 'vue'
import organizationsIndex from '~~/content/organizations/index.json'
import { LeagueSeasonCalculator } from '~/services/LeagueSeasonCalculator'
import type { LeagueConfig, OrganizationListItem, TableRow } from '~~/types/league'

export function useOrganizationLeagues(organizationId: Ref<string>) {
    const organizationName = computed(() => {
        const found = (organizationsIndex as OrganizationListItem[]).find(item => item.id === organizationId.value)
        return found?.name ?? organizationId.value
    })

    const { data: leagues } = useAsyncData(
        () => `organization-leagues-${organizationId.value || 'all'}`,
        async () => {
            const calculator = new LeagueSeasonCalculator(organizationId.value)
            const allConfigs = (await queryCollection('leagues').all()) as LeagueConfig[]
            const filteredConfigs = calculator.filterConfigs(allConfigs)

            const rawLeagues = await Promise.all(
                filteredConfigs.map(async (config) => {
                    const tables = await Promise.all(
                        config.ids.map(id => $fetch<TableRow[]>(`/api/dhb/tournament/table?id=${id}`)),
                    )
                    return { config, tables }
                }),
            )

            return calculator.calculate(rawLeagues)
        },
    )

    return { leagues, organizationName }
}
