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

        // Optionally fetch tournament games if tournamentId provided
        let tournamentGames: any[] = []
        if (tournamentId) {
            tournamentGames = await fetchTournamentGames(tournamentId)
        }

        const [gamesResponse, standingResponse] = await Promise.all(requestsToFetch)

        const games = gamesResponse as any[]
        const standing = standingResponse as any[]

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

async function fetchTournamentGames(tournamentId: string): Promise<any[]> {
    try {
        // Fetch tournament standing to get all teams
        const standingData: any = await $fetch(`${getTournamentUrl(tournamentId)}/table`)
        const teams = standingData.data.rows.map((row: any) => row.team)

        // Fetch games for each team using own API via $fetch for server-to-server
        const gamesByTeam = await Promise.all(
            teams.map((team: any) =>
                $fetch(`/api/dhb/team/games?id=${team.id}`)
                    .catch((err) => {
                        console.warn(`[PROGNOSIS] Failed to fetch games for team ${team.id}:`, err.message)
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
                    gamesMap.set(match.id, match)
                }
            })
        })

        const allGames = Array.from(gamesMap.values())
        console.warn(`[PROGNOSIS] Tournament has ${allGames.length} unique games (${allGames.filter(g => !g.result).length} pending)`)

        return allGames
    }
    catch (error) {
        console.error('[PROGNOSIS] Error fetching tournament games:', error)
        return []
    }
}

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

    const teamPendingGames = games.filter(g =>
        !g.result && (g.homeTeam?.id === teamId || g.awayTeam?.id === teamId),
    )

    if (teamPendingGames.length === 0)
        return undefined

    const simulatedStanding = createSimulatedStanding(standing)

    const ourTeamData = simulatedStanding.find(t => t.team.id === teamId)
    if (!ourTeamData)
        return undefined

    // Use tournament games as the source for all games; fall back to team games
    const allGames = tournamentGames.length > 0 ? tournamentGames : games

    // Collect ALL pending games in the tournament (deduplicated by game id)
    const allPendingGamesMap = new Map<string, any>()
    allGames.forEach((g) => {
        if (!g.result && g.homeTeam?.id && g.awayTeam?.id) {
            const key = g.id || `${g.homeTeam.id}-${g.awayTeam.id}`
            if (!allPendingGamesMap.has(key)) {
                allPendingGamesMap.set(key, g)
            }
        }
    })
    const allPendingGames = Array.from(allPendingGamesMap.values())

    // Track which teams have already been updated for each game to avoid double-counting
    const processedGameKeys = new Set<string>()

    // Process each pending game in the tournament exactly once
    allPendingGames.forEach((game) => {
        const homeId = game.homeTeam?.id
        const awayId = game.awayTeam?.id
        if (!homeId || !awayId)
            return

        const gameKey = game.id || `${homeId}-${awayId}`
        if (processedGameKeys.has(gameKey))
            return
        processedGameKeys.add(gameKey)

        const homeTeam = simulatedStanding.find(t => t.team.id === homeId)
        const awayTeam = simulatedStanding.find(t => t.team.id === awayId)

        // Skip games involving teams not in the standing
        if (!homeTeam || !awayTeam)
            return

        const involvesOurTeam = homeId === teamId || awayId === teamId

        if (involvesOurTeam) {
            // Our team always wins in this simulation
            const isHome = homeId === teamId
            const opponentTeam = isHome ? awayTeam : homeTeam

            // Determine goal difference from H2H or average
            const h2hStats = getHeadToHeadStats(teamId, opponentTeam.team.id, allGames)
            let goalDiff: number

            if (h2hStats && h2hStats.winRate > 0.5) {
                goalDiff = Math.max(2, h2hStats.goalDiff)
            }
            else if (h2hStats && h2hStats.winRate <= 0.5) {
                // Even if H2H says we lose, we still assume we win (optimistic for our team)
                goalDiff = Math.max(2, Math.abs(h2hStats.goalDiff))
            }
            else {
                const avgGoalDiff = ourTeamData.wins > 0
                    ? Math.max(3, Math.round(ourTeamData.goalDifference / ourTeamData.wins))
                    : 5
                goalDiff = avgGoalDiff
            }

            const ourGoals = Math.round(25 + goalDiff / 2)
            const oppGoals = Math.round(25 - goalDiff / 2)

            // Update our team
            const ourTeam = isHome ? homeTeam : awayTeam
            ourTeam.points += 2
            ourTeam.goalDifference += goalDiff
            ourTeam.goals += ourGoals
            ourTeam.goalsAgainst += oppGoals

            // Update opponent
            opponentTeam.goalDifference -= goalDiff
            opponentTeam.goals += oppGoals
            opponentTeam.goalsAgainst += ourGoals
        }
        else {
            // Game between two other teams — predict realistically
            const result = predictGameOutcome(homeTeam, awayTeam, homeId, awayId, allGames)

            if (result.homeWins) {
                homeTeam.points += 2
                homeTeam.goalDifference += result.goalDiff
                homeTeam.goals += result.homeGoals
                homeTeam.goalsAgainst += result.awayGoals

                awayTeam.goalDifference -= result.goalDiff
                awayTeam.goals += result.awayGoals
                awayTeam.goalsAgainst += result.homeGoals
            }
            else if (result.draw) {
                homeTeam.points += 1
                awayTeam.points += 1
                homeTeam.goals += result.homeGoals
                homeTeam.goalsAgainst += result.awayGoals
                awayTeam.goals += result.awayGoals
                awayTeam.goalsAgainst += result.homeGoals
            }
            else {
                awayTeam.points += 2
                awayTeam.goalDifference += result.goalDiff
                awayTeam.goals += result.awayGoals
                awayTeam.goalsAgainst += result.homeGoals

                homeTeam.goalDifference -= result.goalDiff
                homeTeam.goals += result.homeGoals
                homeTeam.goalsAgainst += result.awayGoals
            }
        }
    })

    sortStanding(simulatedStanding)
    return simulatedStanding.findIndex(t => t.team.id === teamId) + 1
}

function predictGameOutcome(homeTeam: any, awayTeam: any, homeId: string, awayId: string, allGames: any[]): {
    homeWins: boolean
    draw: boolean
    goalDiff: number
    homeGoals: number
    awayGoals: number
} {
    // 1. Check head-to-head
    const h2hStats = getHeadToHeadStats(homeId, awayId, allGames)

    if (h2hStats) {
        const goalDiff = Math.max(1, Math.abs(h2hStats.goalDiff))
        if (h2hStats.winRate > 0.5) {
            // Home team wins based on H2H
            return {
                homeWins: true,
                draw: false,
                goalDiff,
                homeGoals: Math.round(25 + goalDiff / 2),
                awayGoals: Math.round(25 - goalDiff / 2),
            }
        }
        else if (h2hStats.winRate < 0.5) {
            // Away team wins based on H2H
            return {
                homeWins: false,
                draw: false,
                goalDiff,
                homeGoals: Math.round(25 - goalDiff / 2),
                awayGoals: Math.round(25 + goalDiff / 2),
            }
        }
        // H2H is balanced (0.5), fall through to other heuristics
    }

    // 2. Use home/away performance stats
    const homeStats = getHomeAwayStats(homeTeam, allGames)
    const awayStats = getHomeAwayStats(awayTeam, allGames)

    // Combine home team's home win rate with away team's away loss rate
    const homeStrength = homeStats.homeWinRate
    const awayStrength = awayStats.awayWinRate

    // 3. Factor in standing position (higher rank = stronger)
    const homePoints = homeTeam.points || 0
    const awayPoints = awayTeam.points || 0
    const pointDiff = homePoints - awayPoints
    const standingBonus = pointDiff > 4 ? 0.1 : pointDiff < -4 ? -0.1 : 0

    // Combined probability that the home team wins
    const homeWinProbability = (homeStrength + (1 - awayStrength)) / 2 + standingBonus

    if (homeWinProbability > 0.55) {
        const goalDiff = Math.max(1, Math.round((homeWinProbability - 0.5) * 10))
        return {
            homeWins: true,
            draw: false,
            goalDiff,
            homeGoals: Math.round(25 + goalDiff / 2),
            awayGoals: Math.round(25 - goalDiff / 2),
        }
    }
    else if (homeWinProbability < 0.45) {
        const goalDiff = Math.max(1, Math.round((0.5 - homeWinProbability) * 10))
        return {
            homeWins: false,
            draw: false,
            goalDiff,
            homeGoals: Math.round(25 - goalDiff / 2),
            awayGoals: Math.round(25 + goalDiff / 2),
        }
    }
    else {
        // Essentially a draw scenario
        return {
            homeWins: false,
            draw: true,
            goalDiff: 0,
            homeGoals: 25,
            awayGoals: 25,
        }
    }
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
