<script lang="ts" setup>
const props = defineProps({
  teamId: {
    type: String,
    required: true,
  },
  games: {
    type: Array,
    required: true,
  },
  gamesPending: {
    type: Boolean,
    required: true,
  },
})

const { t } = useI18n()
const { teamId, games } = props

// Lade die aktuelle Tabelle für die Rangberechnung
const { data: standing } = await useLazyAsyncData(
  `team/${teamId}/standing`,
  () => $fetch('/api/dhb/team/standing', {
    query: { id: teamId },
  }),
  { watch: [() => props.teamId] },
)

const items = [{
  slot: 'home',
  label: t('home'),
  icon: 'i-mdi-home',
}, {
  slot: 'away',
  label: t('away'),
  icon: 'i-mdi-bus',
}]

// Hilfsfunktion für die Berechnung von Home-Spielen
function calculateHomeStats(games: any[], teamId: string) {
  const homeGames = games.filter(g => g.homeTeam.id === teamId && g.result)

  return {
    games: homeGames.length,
    wins: homeGames.filter(g => g.goalDifference > 0).length,
    goalsShot: homeGames.reduce((sum, g) => sum + g.homeGoals, 0),
    goalsGot: homeGames.reduce((sum, g) => sum + g.awayGoals, 0),
    highestWin: homeGames
      .filter(g => g.goalDifference > 0)
      .sort((a, b) => b.goalDifference - a.goalDifference)[0],
    highestLoss: homeGames
      .filter(g => g.goalDifference < 0)
      .sort((a, b) => a.goalDifference - b.goalDifference)[0],
  }
}

// Hilfsfunktion für die Berechnung von Away-Spielen
function calculateAwayStats(games: any[], teamId: string) {
  const awayGames = games.filter(g => g.awayTeam.id === teamId && g.result)

  return {
    games: awayGames.length,
    wins: awayGames.filter(g => g.goalDifference < 0).length,
    goalsShot: awayGames.reduce((sum, g) => sum + g.awayGoals, 0),
    goalsGot: awayGames.reduce((sum, g) => sum + g.homeGoals, 0),
    highestWin: awayGames
      .filter(g => g.goalDifference < 0)
      .sort((a, b) => a.goalDifference - b.goalDifference)[0],
    highestLoss: awayGames
      .filter(g => g.goalDifference > 0)
      .sort((a, b) => b.goalDifference - a.goalDifference)[0],
  }
}

// Hilfsfunktion für die Berechnung des möglichen Ranges
function calculatePossibleRank(standing: any[], teamId: string, games: any[]) {
  if (!standing || standing.length === 0)
    return undefined

  // Finde ausstehende Spiele für unser Team
  const pendingGames = games.filter(g =>
    !g.result && (g.homeTeam.id === teamId || g.awayTeam.id === teamId),
  )

  console.warn('calculatePossibleRank - Team:', teamId, 'Ausstehende Spiele:', pendingGames.length)
  console.warn('Aktuelle Tabelle:', standing.map((t, idx) => ({
    rang: idx + 1,
    team: t.team.name,
    punkte: t.points,
    spiele: t.games,
  })))

  if (pendingGames.length === 0)
    return undefined

  // Erstelle eine Kopie der aktuellen Tabelle
  const simulatedStanding = standing.map((team) => {
    // Parse points falls es als String "24:0" kommt
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
      goals: team.goals || 0, // Erzielte Tore
      goalsAgainst: team.goalsAgainst || 0, // Gegentore
    }
  })

  // Finde unser Team und berechne durchschnittliche Tordifferenz
  const ourTeamData = simulatedStanding.find(t => t.team.id === teamId)
  if (!ourTeamData)
    return undefined

  // Berechne durchschnittliche Tordifferenz pro Sieg aus bisherigen Spielen
  const avgGoalDiff = ourTeamData.wins > 0
    ? Math.max(3, Math.round(ourTeamData.goalDifference / ourTeamData.wins))
    : 5

  // Simuliere: Unser Team gewinnt alle ausstehenden Spiele
  const ourTeam = simulatedStanding.find(t => t.team.id === teamId)
  if (ourTeam) {
    ourTeam.points += pendingGames.length * 2 // 2 Punkte pro Sieg
    ourTeam.goalDifference += pendingGames.length * avgGoalDiff
    ourTeam.goals += pendingGames.length * Math.round(25 + avgGoalDiff / 2)
    ourTeam.goalsAgainst += pendingGames.length * Math.round(25 - avgGoalDiff / 2)
  }

  // Simuliere Verluste für Teams, die gegen uns spielen werden
  pendingGames.forEach((game) => {
    const opponentId = game.homeTeam.id === teamId ? game.awayTeam.id : game.homeTeam.id
    const opponent = simulatedStanding.find(t => t.team.id === opponentId)

    if (opponent) {
      // Gegner bekommt 0 Punkte (Niederlage gegen uns)
      opponent.goalDifference -= avgGoalDiff
      opponent.goals += Math.round(25 - avgGoalDiff / 2)
      opponent.goalsAgainst += Math.round(25 + avgGoalDiff / 2)
    }
  })

  // Für alle anderen Teams: Best-Case für uns = sie verlieren ihre Spiele (wenn sie über uns stehen)
  const currentRank = standing.findIndex(t => t.team.id === teamId) + 1

  simulatedStanding.forEach((team) => {
    if (team.team.id === teamId)
      return

    // Hat dieses Team gegen uns gespielt? Dann haben wir das schon behandelt
    const playsAgainstUs = pendingGames.some(g =>
      g.homeTeam.id === team.team.id || g.awayTeam.id === team.team.id,
    )

    if (playsAgainstUs)
      return

    // Finde ausstehende Spiele dieses Teams
    const teamPendingGames = games.filter(g =>
      !g.result
      && (g.homeTeam.id === team.team.id || g.awayTeam.id === team.team.id)
      && g.homeTeam.id !== teamId
      && g.awayTeam.id !== teamId,
    )

    // Wenn Team aktuell über uns steht: pessimistisch (sie verlieren)
    // Wenn Team unter uns steht: optimistisch (sie gewinnen)
    const teamCurrentRank = standing.findIndex(t => t.team.id === team.team.id) + 1

    if (teamPendingGames.length > 0) {
      if (teamCurrentRank < currentRank) {
        // Team steht über uns: Annahme sie verlieren alle Spiele (0 Punkte)
        team.goalDifference -= teamPendingGames.length * 3
        team.goals += teamPendingGames.length * 22
        team.goalsAgainst += teamPendingGames.length * 27
      }
      else {
        // Team steht unter uns: Annahme sie gewinnen (würde uns helfen wenn sie andere schlagen)
        team.points += teamPendingGames.length * 2
        team.goalDifference += teamPendingGames.length * 3
        team.goals += teamPendingGames.length * 27
        team.goalsAgainst += teamPendingGames.length * 24
      }
    }
  })

  // Sortiere die simulierte Tabelle nach Handballregeln
  simulatedStanding.sort((a, b) => {
    // 1. Nach Punkten
    if (b.points !== a.points)
      return b.points - a.points
    // 2. Nach Tordifferenz
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference
    // 3. Nach erzielten Toren
    if (b.goals !== a.goals)
      return b.goals - a.goals
    // 4. Nach Gegentoren (weniger ist besser)
    return a.goalsAgainst - b.goalsAgainst
  })

  // Debug: Zeige die simulierte Tabelle
  console.warn('Simulierte Tabelle:', simulatedStanding.map((t, idx) => ({
    rang: idx + 1,
    team: t.team.name,
    punkte: t.points,
    tordiff: t.goalDifference,
  })))

  // Finde den Rang des Teams
  const rank = simulatedStanding.findIndex(t => t.team.id === teamId) + 1
  console.warn('Möglicher Rang für Team:', teamId, '=', rank, 'bei', pendingGames.length, 'ausstehenden Spielen')
  return rank
}

// Berechne alle Statistiken
const homeStats = calculateHomeStats(games, teamId)
const awayStats = calculateAwayStats(games, teamId)

const totalGames = homeStats.games + awayStats.games
const totalGoalsShot = homeStats.goalsShot + awayStats.goalsShot
const totalGoalsGot = homeStats.goalsGot + awayStats.goalsGot

// Berechne den möglichen Rang
const possibleRank = computed(() => calculatePossibleRank(standing.value, teamId, games))

// State für die Anzeige
const state = reactive({
  rankIfWinning: possibleRank.value,
  highestHomeWin: homeStats.highestWin
    ? `${homeStats.highestWin.awayTeam.name} (${homeStats.highestWin.result})`
    : undefined,
  highestAwayWin: awayStats.highestWin
    ? `${awayStats.highestWin.homeTeam.name} (${awayStats.highestWin.result})`
    : undefined,
  highestHomeLoose: homeStats.highestLoss
    ? `${homeStats.highestLoss.awayTeam.name} (${homeStats.highestLoss.result})`
    : undefined,
  highestAwayLoose: awayStats.highestLoss
    ? `${awayStats.highestLoss.homeTeam.name} (${awayStats.highestLoss.result})`
    : undefined,
  homeQuota: homeStats.games > 0 ? ((homeStats.wins / homeStats.games) * 100).toFixed(2) : '0.00',
  awayQuota: awayStats.games > 0 ? ((awayStats.wins / awayStats.games) * 100).toFixed(2) : '0.00',
  homeAverageGoalsShot: homeStats.games > 0 ? (homeStats.goalsShot / homeStats.games).toFixed(2) : '0.00',
  homeAverageGoalsGot: homeStats.games > 0 ? (homeStats.goalsGot / homeStats.games).toFixed(2) : '0.00',
  awayAverageGoalsShot: awayStats.games > 0 ? (awayStats.goalsShot / awayStats.games).toFixed(2) : '0.00',
  awayAverageGoalsGot: awayStats.games > 0 ? (awayStats.goalsGot / awayStats.games).toFixed(2) : '0.00',
  averageGoalsShot: totalGames > 0 ? (totalGoalsShot / totalGames).toFixed(2) : '0.00',
  averageGoalsGot: totalGames > 0 ? (totalGoalsGot / totalGames).toFixed(2) : '0.00',
})

// Watch für Änderungen am möglichen Rang
watch(possibleRank, (newRank) => {
  state.rankIfWinning = newRank
})
</script>

<template>
  <div>
    <UContainer>
      <UForm :state="state" class="space-y-4">
        <UFormField v-if="state.rankIfWinning" :label="t('possibleRankIfWinning')">
          <UInput v-model="state.rankIfWinning" icon="i-mdi-trophy" disabled />
        </UFormField>

        <UFormField :label="t('averageGoalsShot')">
          <UInput v-model="state.averageGoalsShot" disabled />
        </UFormField>

        <UFormField :label="t('averageGoalsGot')">
          <UInput v-model="state.averageGoalsGot" disabled />
        </UFormField>
        <br>
        <UTabs :items="items" class="w-full">
          <template #default="{ item }">
            <div class="flex items-center gap-2 relative truncate">
              <!-- <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" /> -->

              <span class="truncate">{{ item.label }}</span>

              <span class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
            </div>
          </template>
          <template #home>
            <UFormField :label="t('highestHomeWin')">
              <UInput v-model="state.highestHomeWin" disabled class="w-full" />
            </UFormField>

            <UFormField :label="t('highestHomeLoose')">
              <UInput v-model="state.highestHomeLoose" disabled class="w-full" />
            </UFormField>

            <UFormField :label="t('homeQuota')">
              <UInput v-model="state.homeQuota" disabled>
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs">%</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField :label="t('averageGoalsShot')">
              <UInput v-model="state.homeAverageGoalsShot" disabled />
            </UFormField>

            <UFormField :label="t('averageGoalsGot')">
              <UInput v-model="state.homeAverageGoalsGot" disabled />
            </UFormField>
          </template>
          <template #away>
            <UFormField :label="t('highestAwayWin')">
              <UInput v-model="state.highestAwayWin" disabled class="w-full" />
            </UFormField>

            <UFormField :label="t('highestAwayLoose')">
              <UInput v-model="state.highestAwayLoose" disabled class="w-full" />
            </UFormField>

            <UFormField :label="t('awayQuota')">
              <UInput v-model="state.awayQuota" disabled>
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs">%</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField :label="t('averageGoalsShot')">
              <UInput v-model="state.awayAverageGoalsShot" disabled />
            </UFormField>

            <UFormField :label="t('averageGoalsGot')">
              <UInput v-model="state.awayAverageGoalsGot" disabled />
            </UFormField>
          </template>
        </UTabs>
      </UForm>
    </UContainer>
  </div>
</template>

<style></style>
