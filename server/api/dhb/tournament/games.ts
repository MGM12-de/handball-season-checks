import { getTournamentUrl } from '../../../../server/utils/dhbUtils'

defineRouteMeta({
    openAPI: {
        description: 'Get all tournament games',
        summary: 'Get all games in a tournament by fetching games from each team and deduplicating',
        tags: ['Tournament', 'DHB'],
        parameters: [
            {
                in: 'query',
                name: 'id',
                required: true,
                example: 'handball4all.wuerttemberg.m-bol_hf',
                summary: 'Tournament id',
            },
        ],
    },
})

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)

        if (!query.id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No tournament id received',
            })
        }

        const tournamentId = query.id as string

        // Fetch tournament standing to get all teams
        const standingData: any = await $fetch(`${getTournamentUrl(tournamentId)}/table`)
        const teams = standingData.data.rows.map((row: any) => row.team)

        // Fetch games for each team using own API
        const gamesByTeam = await Promise.all(
            teams.map((team: any) =>
                $fetch(`/api/dhb/team/games?id=${team.id}`)
                    .catch((err) => {
                        return []
                    }),
            ),
        )

        // Collect all games and deduplicate by game id
        const gamesMap = new Map<string, any>()

        gamesByTeam.forEach((games: any) => {
            if (!Array.isArray(games))
                return

            games.forEach((match: any) => {
                if (!gamesMap.has(match.id)) {
                    const date = match.startsAt ? new Date(match.startsAt) : null
                    gamesMap.set(match.id, {
                        id: match.id,
                        startsAt: date
                            ? `${date.toLocaleDateString('de')}, ${date.toLocaleTimeString('de', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}`
                            : undefined,
                        homeTeam: {
                            id: match.homeTeam.id,
                            name: match.homeTeam.name,
                            acronym: match.homeTeam.acronym,
                        },
                        awayTeam: {
                            id: match.awayTeam.id,
                            name: match.awayTeam.name,
                            acronym: match.awayTeam.acronym,
                        },
                        homeGoals: match.homeGoals,
                        awayGoals: match.awayGoals,
                        result: match.homeGoals !== null && match.awayGoals !== null ? `${match.homeGoals}:${match.awayGoals}` : undefined,
                        goalDifference: match.homeGoals !== null && match.awayGoals !== null ? match.homeGoals - match.awayGoals : 0,
                    })
                }
            })
        })

        const allGames = Array.from(gamesMap.values())

        return allGames
    }
    catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Error fetching tournament games: ${error}`,
        })
    }
})
