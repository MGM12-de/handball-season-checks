import type { Player } from '~~/types'

interface TeamLineupChunkResult {
    teamId: string
    lineup: Player[]
}

async function fetchLineupsForTeamIds(
    teamIds: string[],
    batchSize: number = 5,
): Promise<TeamLineupChunkResult[]> {
    const results: TeamLineupChunkResult[] = []

    for (let i = 0; i < teamIds.length; i += batchSize) {
        const batch = teamIds.slice(i, i + batchSize)
        const lineupPromises = batch.map(async (teamId) => {
            const lineup = await $fetch<Player[]>('/api/dhb/team/lineup', {
                query: { id: teamId },
            }).catch(() => [])

            return {
                teamId,
                lineup,
            }
        })

        const batchResults = await Promise.all(lineupPromises)
        results.push(...batchResults)

        if (i + batchSize < teamIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }

    return results
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const teamIdsParam = query.teamIds

    if (!teamIdsParam) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No teamIds received',
        })
    }

    const teamIds = String(teamIdsParam)
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)

    if (teamIds.length === 0) {
        return []
    }

    return fetchLineupsForTeamIds(teamIds)
})
