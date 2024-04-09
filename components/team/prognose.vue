<template>
  <div>
    <UContainer>
      <UForm :state="state" class="space-y-4">
        <UFormGroup label="Durchschnittlich geworfene Tore">
          <UInput v-model="state.averageGoalsShot" disabled />
        </UFormGroup>

        <UFormGroup label="Durchschnittlich bekommene Tore">
          <UInput v-model="state.averageGoalsGot" disabled />
        </UFormGroup>
        <br />
        <UTabs :items="items" class="w-full">
          <template #default="{ item, index, selected }">
            <div class="flex items-center gap-2 relative truncate">
              <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />

              <span class="truncate">{{ item.label }}</span>

              <span v-if="selected" class="absolute -right-4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
            </div>
          </template>
          <template #home>
            <UFormGroup label="Höchster Heimsieg">
              <UInput v-model="state.highestHomeWin" disabled />
            </UFormGroup>

            <UFormGroup label="Höchste Heimniederlage">
              <UInput v-model="state.highestHomeLoose" disabled />
            </UFormGroup>

            <UFormGroup label="Heimquote">
              <UInput v-model="state.homeQuota" disabled>
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs">%</span>
                </template>
              </UInput>
            </UFormGroup>

            <UFormGroup label="Durchschnittlich Daheim geworfene Tore">
              <UInput v-model="state.homeAverageGoalsShot" disabled />
            </UFormGroup>

            <UFormGroup label="Durchschnittlich Daheim bekommene Tore">
              <UInput v-model="state.homeAverageGoalsGot" disabled />
            </UFormGroup>

          </template>
          <template #away>
            <UFormGroup label="Höchster Auswärtssieg">
              <UInput v-model="state.highestAwayWin" disabled />
            </UFormGroup>

            <UFormGroup label="Höchste Auswärtsniederlage">
              <UInput v-model="state.highestAwayLoose" disabled />
            </UFormGroup>

            <UFormGroup label="Auswärtsquote">
              <UInput v-model="state.awayQuota" disabled>
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs">%</span>
                </template>
              </UInput>
            </UFormGroup>

            <UFormGroup label="Durchschnittlich Auswärts geworfene Tore">
              <UInput v-model="state.awayAverageGoalsShot" disabled />
            </UFormGroup>

            <UFormGroup label="Durchschnittlich Auswärts bekommene Tore">
              <UInput v-model="state.awayAverageGoalsGot" disabled />
            </UFormGroup>
          </template>
        </UTabs>

        <!-- <UFormGroup label="Möglicher Platz, wenn alle offene Spiele gewonnen werden">
          <UInput v-model="state.rankIfWinning" icon="i-mdi-trophy" disabled />
        </UFormGroup> -->
      </UForm>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
const state = reactive({
  rankIfWinning: undefined,
  highestHomeWin: undefined,
  highestAwayWin: undefined,
  highestHomeLoose: undefined,
  highestAwayLoose: undefined,
  awayQuota: 0,
  homeQuota: 0,
  averageGoalsShot: 0,
  averageGoalsGot: 0,
  homeAverageGoalsShot: 0,
  homeAverageGoalsGot: 0,
  awayAverageGoalsShot: 0,
  awayAverageGoalsGot: 0
})

const items = [{
  slot: 'home',
  label: 'Heim',
  icon: 'i-mdi-home'
}, {
  slot: 'away',
  label: 'Auswärts',
  icon: 'i-mdi-bus'
}]

const props = defineProps({
  teamId: {
    type: String,
    required: true
  },
  games: {
    type: Array,
    required: true
  },
  gamesPending: {
    type: Boolean,
    required: true
  }
})

var stats = ref({
  highestHomeWin: {},
  highestAwayWin: {},
  homeWins: 0,
  homeGames: 0,
  homeGoalsShot: 0,
  homeGoalsGot: 0,
  awayWins: 0,
  awayGames: 0,
  awayGoalsShot: 0,
  awayGoalsGot: 0,
})

const { teamId, games, gamesPending } = props;

games.forEach(element => {
  if (element.homeTeam.id === teamId) {
    stats.value.homeGames++;
    stats.value.homeGoalsShot += element.homeGoals;
    stats.value.homeGoalsGot += element.awayGoals;

    if (element.goalDifference > 0) {
      stats.value.homeWins++;

      if (!stats.highestHomeWin || stats.highestHomeWin.goalDifference < element.goalDifference) {
        stats.highestHomeWin = element;
      }
    } else if (element.goalDifference < 0) {
      if (!stats.highestHomeLoose || stats.highestHomeLoose.goalDifference > element.goalDifference) {
        stats.highestHomeLoose = element;
      }
    }
  }

  if (stats.highestHomeWin) {
    state.highestHomeWin = `${stats.highestHomeWin.awayTeam.name} (${stats.highestHomeWin.result})`;
  }

  if (stats.highestHomeLoose) {
    state.highestHomeLoose = `${stats.highestHomeLoose.awayTeam.name} (${stats.highestHomeLoose.result})`;
  }

  if (element.awayTeam.id === teamId) {
    stats.value.awayGames++;
    stats.value.awayGoalsShot += element.awayGoals;
    stats.value.awayGoalsGot += element.homeGoals;

    if (element.goalDifference < 0) {
      stats.value.awayWins++;

      if (!stats.highestAwayWin || stats.highestAwayWin.goalDifference > element.goalDifference) {
        stats.highestAwayWin = element;
      }
    } else if (element.goalDifference > 0) {
      if (!stats.highestAwayLoose || stats.highestAwayLoose.goalDifference < element.goalDifference) {
        stats.highestAwayLoose = element;
      }
    }
  }

  if (stats.highestAwayWin) {
    state.highestAwayWin = `${stats.highestAwayWin.homeTeam.name} (${stats.highestAwayWin.result})`;
  }

  if (stats.highestAwayLoose) {
    state.highestAwayLoose = `${stats.highestAwayLoose.homeTeam.name} (${stats.highestAwayLoose.result})`;
  }

  // calc quotas
  state.homeQuota = ((stats.value.homeWins / stats.value.homeGames) * 100).toFixed(2)
  state.awayQuota = ((stats.value.awayWins / stats.value.awayGames) * 100).toFixed(2)
  // calc average goals
  state.homeAverageGoalsShot = Math.round(stats.value.homeGoalsShot / stats.value.homeGames).toFixed(2)
  state.homeAverageGoalsGot = Math.round(stats.value.homeGoalsGot / stats.value.homeGames).toFixed(2)
  state.awayAverageGoalsShot = Math.round(stats.value.awayGoalsShot / stats.value.awayGames).toFixed(2)
  state.awayAverageGoalsGot = Math.round(stats.value.awayGoalsGot / stats.value.awayGames).toFixed(2)

  state.averageGoalsShot = Math.round((stats.value.homeGoalsShot + stats.value.awayGoalsShot) / (stats.value.homeGames + stats.value.awayGames)).toFixed(2)
  state.averageGoalsGot = Math.round((stats.value.homeGoalsGot + stats.value.awayGoalsGot) / (stats.value.homeGames + stats.value.awayGames)).toFixed(2)
});



</script>

<style></style>