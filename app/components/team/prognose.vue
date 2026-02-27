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
  tournamentId: {
    type: String,
    default: undefined,
  },
})

const { t } = useI18n()
const { teamId, games, tournamentId } = props

// Lade die Prognose-Daten von der API
const { data: prognosis } = useLazyAsyncData(
  `team/${teamId}/prognosis`,
  () => $fetch('/api/dhb/team/prognosis', {
    query: {
      id: teamId,
      ...(tournamentId && { tournamentId }),
    },
  }),
  { watch: [() => props.teamId, () => props.tournamentId] },
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

// Berechne Statistiken für Home-Spiele
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

// Berechne Statistiken für Away-Spiele
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

const homeStats = calculateHomeStats(games, teamId)
const awayStats = calculateAwayStats(games, teamId)

const totalGames = homeStats.games + awayStats.games
const totalGoalsShot = homeStats.goalsShot + awayStats.goalsShot
const totalGoalsGot = homeStats.goalsGot + awayStats.goalsGot

// Berechne den Spielverlauf (Form) für die letzten Spiele
const recentForm = computed(() => {
  const playedGames = (games as any[]).filter((g: any) =>
    g.result && (g.homeTeam.id === teamId || g.awayTeam.id === teamId),
  )

  const sortedGames = playedGames.sort((a: any, b: any) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
    return 0
  })

  return sortedGames.map((game: any) => {
    const isHome = game.homeTeam.id === teamId
    const goalDiff = isHome ? game.goalDifference : -game.goalDifference

    if (goalDiff > 0) {
      return { type: 'win', color: 'success' as const, label: t('win') }
    }
    else if (goalDiff < 0) {
      return { type: 'loss', color: 'error' as const, label: t('loss') }
    }
    else {
      return { type: 'draw', color: 'primary' as const, label: t('draw') }
    }
  })
})

// State für die Anzeige mit reaktiven Werten
const state = reactive({
  rankIfWinning: computed(() => prognosis.value?.bestPossibleRank?.toString() || ''),
  realisticRankIfWinning: computed(() => prognosis.value?.realisticRank?.toString() || ''),
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
</script>

<template>
  <div>
    <UContainer>
      <UForm :state="state" class="space-y-4">
        <UFormField v-if="state.rankIfWinning" :label="t('possibleRankIfWinning')">
          <UInput v-model="state.rankIfWinning" icon="i-mdi-trophy" disabled />
        </UFormField>

        <UFormField v-if="state.realisticRankIfWinning" :label="t('realisticRankIfWinning')">
          <UInput v-model="state.realisticRankIfWinning" icon="i-mdi-trophy" disabled />
        </UFormField>

        <UFormField v-if="recentForm.length > 0" :label="t('recentForm')">
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="(result, index) in recentForm" :key="index" :color="result.color" variant="solid" size="lg">
              {{ result.label }}
            </UBadge>
          </div>
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
