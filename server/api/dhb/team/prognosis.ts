import { z } from 'zod'

const querySchema = z.object({
    id: z.string().min(1, 'Team ID is required'),
    tournamentId: z.string().optional(),
})

defineRouteMeta({
    openAPI: {
        description: 'Get team prognosis for remaining games',
        summary: 'Calculate best-case and realistic rank if team wins all remaining games',
        tags: ['Team', 'DHB'],
        parameters: [
            {
                in: 'query',
                name: 'id',
                required: true,
                example: 'handball4all.wuerttemberg.36',
                summary: 'Team id',
            },
            {
                in: 'query',
                name: 'tournamentId',
                required: false,
                example: 'handball4all.wuerttemberg.m-bol_hf',
                summary: 'Tournament id for enhanced prognosis with tournament-wide dependencies',
            },
        ],
    },
})

export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, data => querySchema.parse(data))
    const teamId = query.id as string
    const tournamentId = query.tournamentId as string | undefined

    try {
        // Fetch team games and standing data
        const requestsToFetch = [
            $fetch(`/api/dhb/team/games?id=${teamId}`),
            $fetch(`/api/dhb/team/standing?id=${teamId}`),
        ]

        // Optionally fetch tournament games
        if (tournamentId) {
            requestsToFetch.push(
                $fetch(`/api/dhb/tournament/games?id=${tournamentId}`),
            )
        }

        const [gamesResponse, standingResponse, tournamentGamesResponse] = await Promise.all(requestsToFetch)

        const games = gamesResponse as any[]
        const standing = standingResponse as any[]
        const tournamentGames = (tournamentGamesResponse as any[]) || []

        // Calculate prognosis with optional tournament data
        const prognosis = calculatePrognosis(standing, teamId, games, tournamentGames)

        return prognosis
    }
    catch (error) {
        console.error('Error calculating prognosis:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Error calculating prognosis: ${error}`,
        })
    }
})

function calculatePrognosis(standing: any[], teamId: string, games: any[], tournamentGames: any[] = []) {
    // Find pending games
    const pendingGames = games.filter(g => !g.result && (g.homeTeam?.id === teamId || g.awayTeam?.id === teamId))

    if (pendingGames.length === 0) {
        return {
            bestPossibleRank: undefined,
            realisticRank: undefined,
            pendingGames: 0,
        }
    }

    const bestRank = calculateBestPossibleRank(standing, teamId, games)
    const realisticRank = calculateRealisticRank(standing, teamId, games, tournamentGames)

    return {
        bestPossibleRank: bestRank,
        realisticRank,
        pendingGames: pendingGames.length,
    }
}

function calculateBestPossibleRank(standing: any[], teamId: string, games: any[]): number | undefined {
    if (!standing || standing.length === 0)
        return undefined

    const pendingGames = games.filter(g =>
        !g.result && (g.homeTeam?.id === teamId || g.awayTeam?.id === teamId),
    )

    if (pendingGames.length === 0)
        return undefined

    const simulatedStanding = createSimulatedStanding(standing)

    const ourTeamData = simulatedStanding.find(t => t.team.id === teamId)
    if (!ourTeamData)
        return undefined

    const avgGoalDiff = ourTeamData.wins > 0
        ? Math.max(3, Math.round(ourTeamData.goalDifference / ourTeamData.wins))
        : 5

    // Our team wins all games
    const ourTeam = simulatedStanding.find(t => t.team.id === teamId)
    if (ourTeam) {
        ourTeam.points += pendingGames.length * 2
        ourTeam.goalDifference += pendingGames.length * avgGoalDiff
        ourTeam.goals += pendingGames.length * Math.round(25 + avgGoalDiff / 2)
        ourTeam.goalsAgainst += pendingGames.length * Math.round(25 - avgGoalDiff / 2)
    }

    // Opponents lose all games against us
    pendingGames.forEach((game) => {
        const opponentId = game.homeTeam?.id === teamId ? game.awayTeam?.id : game.homeTeam?.id
        const opponent = simulatedStanding.find(t => t.team.id === opponentId)

        if (opponent) {
            opponent.goalDifference -= avgGoalDiff
            opponent.goals += Math.round(25 - avgGoalDiff / 2)
            opponent.goalsAgainst += Math.round(25 + avgGoalDiff / 2)
        }
    })

    // Teams above us lose all their games
    const currentRank = standing.findIndex(t => t.team.id === teamId) + 1

    simulatedStanding.forEach((team) => {
        if (team.team.id === teamId)
            return

        const playsAgainstUs = pendingGames.some(g =>
            g.homeTeam?.id === team.team.id || g.awayTeam?.id === team.team.id,
        )

        if (playsAgainstUs)
            return

        const teamPendingGames = games.filter(g =>
            !g.result
            && (g.homeTeam?.id === team.team.id || g.awayTeam?.id === team.team.id)
            && g.homeTeam?.id !== teamId
            && g.awayTeam?.id !== teamId,
        )

        const teamCurrentRank = standing.findIndex(t => t.team.id === team.team.id) + 1

        if (teamPendingGames.length > 0) {
            if (teamCurrentRank < currentRank) {
                // Teams above us lose all games
                team.goalDifference -= teamPendingGames.length * 3
                team.goals += teamPendingGames.length * 22
                team.goalsAgainst += teamPendingGames.length * 27
            }
            else {
                // Teams below us win (best case for us)
                team.points += teamPendingGames.length * 2
                team.goalDifference += teamPendingGames.length * 3
                team.goals += teamPendingGames.length * 27
                team.goalsAgainst += teamPendingGames.length * 24
            }
        }
    })

    sortStanding(simulatedStanding)
    return simulatedStanding.findIndex(t => t.team.id === teamId) + 1
}

function calculateRealisticRank(standing: any[], teamId: string, games: any[], tournamentGames: any[] = []): number | undefined {
    if (!standing || standing.length === 0)
        return undefined

    const pendingGames = games.filter(g =>
        !g.result && (g.homeTeam?.id === teamId || g.awayTeam?.id === teamId),
    )

    if (pendingGames.length === 0)
        return undefined

    const simulatedStanding = createSimulatedStanding(standing)

    const ourTeamData = simulatedStanding.find(t => t.team.id === teamId)
    if (!ourTeamData)
        return undefined

    const avgGoalDiff = ourTeamData.wins > 0
        ? Math.max(3, Math.round(ourTeamData.goalDifference / ourTeamData.wins))
        : 5

    // Our team wins all games
    const ourTeam = simulatedStanding.find(t => t.team.id === teamId)
    if (ourTeam) {
        ourTeam.points += pendingGames.length * 2
        ourTeam.goalDifference += pendingGames.length * avgGoalDiff
        ourTeam.goals += pendingGames.length * Math.round(25 + avgGoalDiff / 2)
        ourTeam.goalsAgainst += pendingGames.length * Math.round(25 - avgGoalDiff / 2)
    }

    // Process games against us based on H2H
    pendingGames.forEach((game) => {
        const opponentId = game.homeTeam?.id === teamId ? game.awayTeam?.id : game.homeTeam?.id
        const opponent = simulatedStanding.find(t => t.team.id === opponentId)

        if (opponent) {
            const h2hStats = getHeadToHeadStats(teamId, opponentId, games)

            if (h2hStats) {
                if (h2hStats.winRate > 0.5) {
                    // We win based on H2H
                    const goalDiff = Math.max(2, h2hStats.goalDiff)
                    opponent.goalDifference -= goalDiff
                    opponent.goals += Math.round(25 - goalDiff / 2)
                    opponent.goalsAgainst += Math.round(25 + goalDiff / 2)
                }
                else {
                    // Opponent wins based on H2H
                    opponent.points += 2
                    const goalDiff = Math.max(2, Math.abs(h2hStats.goalDiff))
                    opponent.goalDifference += goalDiff
                    opponent.goals += Math.round(25 + goalDiff / 2)
                    opponent.goalsAgainst += Math.round(25 - goalDiff / 2)
                }
            }
            else {
                // No H2H, assume we win
                opponent.goalDifference -= avgGoalDiff
                opponent.goals += Math.round(25 - avgGoalDiff / 2)
                opponent.goalsAgainst += Math.round(25 + avgGoalDiff / 2)
            }
        }
    })

    // Process other teams with home/away stats
    simulatedStanding.forEach((team) => {
        if (team.team.id === teamId)
            return

        const playsAgainstUs = pendingGames.some(g =>
            g.homeTeam?.id === team.team.id || g.awayTeam?.id === team.team.id,
        )

        if (playsAgainstUs)
            return

        const teamPendingGames = games.filter(g =>
            !g.result
            && (g.homeTeam?.id === team.team.id || g.awayTeam?.id === team.team.id)
            && g.homeTeam?.id !== teamId
            && g.awayTeam?.id !== teamId,
        )

        if (teamPendingGames.length > 0) {
            // Process each pending game for this team considering dependencies
            let expectedWins = 0
            let expectedLosses = 0

            teamPendingGames.forEach((pendingGame) => {
                const opponentId = pendingGame.homeTeam?.id === team.team.id
                    ? pendingGame.awayTeam?.id
                    : pendingGame.homeTeam?.id

                const opponent = simulatedStanding.find(t => t.team.id === opponentId)

                if (opponent) {
                    // Calculate H2H between this team and opponent using tournament games if available
                    const h2hStats = getHeadToHeadStats(team.team.id, opponentId, tournamentGames.length > 0 ? tournamentGames : games)

                    let teamWins = false

                    if (h2hStats) {
                        // Use H2H to predict outcome
                        teamWins = h2hStats.winRate > 0.5
                    }
                    else {
                        // Fallback: use home/away stats and historical performance
                        const teamStats = getHomeAwayStats(team, games)
                        const isHome = pendingGame.homeTeam?.id === team.team.id
                        const winRate = isHome ? teamStats.homeWinRate : teamStats.awayWinRate
                        teamWins = winRate > 0.5
                    }

                    if (teamWins) {
                        expectedWins++
                    }
                    else {
                        expectedLosses++
                    }
                }
                else {
                    // Fallback: assume average performance
                    const teamStats = getHomeAwayStats(team, games)
                    const isHome = pendingGame.homeTeam?.id === team.team.id
                    const winRate = isHome ? teamStats.homeWinRate : teamStats.awayWinRate
                    if (winRate > 0.5) {
                        expectedWins++
                    }
                    else {
                        expectedLosses++
                    }
                }
            })

            // Add points and goal differences
            team.points += expectedWins * 2

            const teamStats = getHomeAwayStats(team, games)
            const homeGoalDiff = teamStats.homeGoalDiff || 2
            const awayGoalDiff = teamStats.awayGoalDiff || 2

            const homeGames = teamPendingGames.filter(g => g.homeTeam?.id === team.team.id).length
            const awayGames = teamPendingGames.length - homeGames

            // Estimate goal differences
            const homeExpectedWins = Math.round(homeGames * teamStats.homeWinRate)
            const awayExpectedWins = Math.round(awayGames * teamStats.awayWinRate)

            const expectedGoalDiffHome = homeGoalDiff * (2 * homeExpectedWins - homeGames)
            const expectedGoalDiffAway = awayGoalDiff * (2 * awayExpectedWins - awayGames)
            const expectedGoalDiff = expectedGoalDiffHome + expectedGoalDiffAway

            team.goalDifference += expectedGoalDiff
            team.goals += expectedWins * 26 + expectedLosses * 24
            team.goalsAgainst += expectedWins * 24 + expectedLosses * 26
        }
    })

    sortStanding(simulatedStanding)
    return simulatedStanding.findIndex(t => t.team.id === teamId) + 1
}

function createSimulatedStanding(standing: any[]) {
    return standing.map((team) => {
        let pointsValue = team.points
        if (typeof pointsValue === 'string') {
            if (pointsValue.includes(':')) {
                const parts = pointsValue.split(':')
                pointsValue = Number.parseInt(parts[0] || '0', 10)
            }
            else {
                pointsValue = Number.parseInt(pointsValue, 10)
            }
        }

        return {
            ...team,
            points: pointsValue || 0,
            goalDifference: team.goalDifference || 0,
            goals: team.goals || 0,
            goalsAgainst: team.goalsAgainst || 0,
        }
    })
}

function sortStanding(standing: any[]) {
    standing.sort((a, b) => {
        if (b.points !== a.points)
            return b.points - a.points
        if (b.goalDifference !== a.goalDifference)
            return b.goalDifference - a.goalDifference
        if (b.goals !== a.goals)
            return b.goals - a.goals
        return a.goalsAgainst - b.goalsAgainst
    })
}

function getHeadToHeadStats(ourId: string, opponentId: string, allGames: any[]): { winRate: number, goalDiff: number } | null {
    const h2hGames = allGames.filter(g =>
        g.result
        && ((g.homeTeam?.id === ourId && g.awayTeam?.id === opponentId)
            || (g.homeTeam?.id === opponentId && g.awayTeam?.id === ourId)),
    )

    if (h2hGames.length === 0)
        return null

    const ourWins = h2hGames.filter((g) => {
        const isHome = g.homeTeam?.id === ourId
        return isHome ? g.goalDifference > 0 : g.goalDifference < 0
    }).length

    const totalGoalDiff = h2hGames.reduce((sum, g) => {
        const isHome = g.homeTeam?.id === ourId
        return sum + (isHome ? g.goalDifference : -g.goalDifference)
    }, 0)

    return {
        winRate: ourWins / h2hGames.length,
        goalDiff: h2hGames.length > 0 ? Math.round(totalGoalDiff / h2hGames.length) : 0,
    }
}

function getHomeAwayStats(team: any, allGames: any[]) {
    const homeGames = allGames.filter(g => g.homeTeam?.id === team.team.id && g.result)
    const awayGames = allGames.filter(g => g.awayTeam?.id === team.team.id && g.result)

    const homeWins = homeGames.filter(g => g.goalDifference > 0).length
    const awayWins = awayGames.filter(g => g.goalDifference < 0).length

    const homeGoalDiff = homeGames.reduce((sum, g) => sum + g.goalDifference, 0)
    const awayGoalDiff = awayGames.reduce((sum, g) => sum + (-g.goalDifference), 0)

    return {
        homeWinRate: homeGames.length > 0 ? homeWins / homeGames.length : 0.5,
        awayWinRate: awayGames.length > 0 ? awayWins / awayGames.length : 0.5,
        homeGoalDiff: homeGames.length > 0 ? Math.round(homeGoalDiff / homeGames.length) : 2,
        awayGoalDiff: awayGames.length > 0 ? Math.round(awayGoalDiff / awayGames.length) : 2,
    }
}
