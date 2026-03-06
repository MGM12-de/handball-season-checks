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
const asyncDataKey = computed(() => `team/${props.teamId}/prognosis/${props.tournamentId || 'none'}`)

// Lade die Prognose-Daten von der API
const { data: prognosis, pending: prognosisPending, error: prognosisError } = useLazyAsyncData(
  asyncDataKey,
  () => $fetch('/api/dhb/team/prognosis', {
    query: {
      id: props.teamId,
      ...(props.tournamentId && { tournamentId: props.tournamentId }),
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

const homeStats = computed(() => calculateHomeStats(props.games as any[], props.teamId))
const awayStats = computed(() => calculateAwayStats(props.games as any[], props.teamId))

const totalGames = computed(() => homeStats.value.games + awayStats.value.games)
const totalGoalsShot = computed(() => homeStats.value.goalsShot + awayStats.value.goalsShot)
const totalGoalsGot = computed(() => homeStats.value.goalsGot + awayStats.value.goalsGot)

// Berechne den Spielverlauf (Form) für die letzten Spiele
const recentForm = computed(() => {
  const playedGames = (props.games as any[]).filter((g: any) =>
    g.result && (g.homeTeam.id === props.teamId || g.awayTeam.id === props.teamId),
  )

  const sortedGames = playedGames.sort((a: any, b: any) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
    return 0
  })

  return sortedGames.map((game: any) => {
    const isHome = game.homeTeam.id === props.teamId
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

const noPendingGamesForPrognosis = computed(() => prognosis.value?.pendingGames === 0)

// State für die Anzeige mit reaktiven Werten
const state = reactive({
  rankIfWinning: computed(() => prognosis.value?.bestPossibleRank?.toString() || ''),
  realisticRankIfWinning: computed(() => prognosis.value?.realisticRank?.toString() || ''),
  simulatedRankAllTeams: computed(() => prognosis.value?.simulatedRank?.toString() || ''),
  highestHomeWin: computed(() => homeStats.value.highestWin
    ? `${homeStats.value.highestWin.awayTeam.name} (${homeStats.value.highestWin.result})`
    : undefined),
  highestAwayWin: computed(() => awayStats.value.highestWin
    ? `${awayStats.value.highestWin.homeTeam.name} (${awayStats.value.highestWin.result})`
    : undefined),
  highestHomeLoose: computed(() => homeStats.value.highestLoss
    ? `${homeStats.value.highestLoss.awayTeam.name} (${homeStats.value.highestLoss.result})`
    : undefined),
  highestAwayLoose: computed(() => awayStats.value.highestLoss
    ? `${awayStats.value.highestLoss.homeTeam.name} (${awayStats.value.highestLoss.result})`
    : undefined),
  homeQuota: computed(() => homeStats.value.games > 0 ? ((homeStats.value.wins / homeStats.value.games) * 100).toFixed(2) : '0.00'),
  awayQuota: computed(() => awayStats.value.games > 0 ? ((awayStats.value.wins / awayStats.value.games) * 100).toFixed(2) : '0.00'),
  homeAverageGoalsShot: computed(() => homeStats.value.games > 0 ? (homeStats.value.goalsShot / homeStats.value.games).toFixed(2) : '0.00'),
  homeAverageGoalsGot: computed(() => homeStats.value.games > 0 ? (homeStats.value.goalsGot / homeStats.value.games).toFixed(2) : '0.00'),
  awayAverageGoalsShot: computed(() => awayStats.value.games > 0 ? (awayStats.value.goalsShot / awayStats.value.games).toFixed(2) : '0.00'),
  awayAverageGoalsGot: computed(() => awayStats.value.games > 0 ? (awayStats.value.goalsGot / awayStats.value.games).toFixed(2) : '0.00'),
  averageGoalsShot: computed(() => totalGames.value > 0 ? (totalGoalsShot.value / totalGames.value).toFixed(2) : '0.00'),
  averageGoalsGot: computed(() => totalGames.value > 0 ? (totalGoalsGot.value / totalGames.value).toFixed(2) : '0.00'),
})
</script>

<template>
  <div>
    <UContainer>
      <UForm :state="state" class="space-y-4">
        <UAlert v-if="prognosisError" color="error" variant="soft" :title="t('prognosisLoadFailed')"
          :description="prognosisError.message" />

        <div v-else-if="prognosisPending" class="space-y-2">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>

        <UAlert v-else-if="noPendingGamesForPrognosis" color="info" variant="soft"
          :title="t('noPendingGamesForPrognosis')" />

        <UFormField v-if="state.rankIfWinning" :label="t('possibleRankIfWinning')">
          <UInput v-model="state.rankIfWinning" icon="i-mdi-trophy" disabled />
        </UFormField>

        <UFormField v-if="state.realisticRankIfWinning" :label="t('realisticRankIfWinning')">
          <UInput v-model="state.realisticRankIfWinning" icon="i-mdi-trophy" disabled />
        </UFormField>

        <UFormField v-if="state.simulatedRankAllTeams" :label="t('simulatedRankAllTeams')">
          <UInput v-model="state.simulatedRankAllTeams" icon="i-mdi-chart-line" disabled />
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
