<template>
  <div>
    <UContainer>
      <UForm :state="state" class="space-y-4">
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
              <UInput v-model="state.homeQuota" disabled />
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
              <UInput v-model="state.awayQuota" disabled />
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
  homeQuota: 0
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
  awayWins: 0,
  awayGames: 0
})

const { teamId, games, gamesPending } = props;

games.forEach(element => {
  if (element.homeTeam.id === teamId && element.goalDifference > 0) {
    stats.value.homeGames++
    stats.value.homeWins++
    if (stats.highestHomeWin) {
      if (stats.highestHomeWin.goalDifference < element.goalDifference)
        stats.highestHomeWin = element
    } else {
      stats.highestHomeWin = element
    }
  }
  if (stats.highestHomeWin)
    state.highestHomeWin = `${stats.highestHomeWin.awayTeam.name} (${stats.highestHomeWin.result})`

  if (element.homeTeam.id === teamId && element.goalDifference < 0) {
    stats.value.homeGames++
    if (stats.highestHomeLoose) {
      if (stats.highestHomeLoose.goalDifference > element.goalDifference)
        stats.highestHomeLoose = element
    } else {
      stats.highestHomeLoose = element
    }
  }
  if (stats.highestHomeLoose)
    state.highestHomeLoose = `${stats.highestHomeLoose.awayTeam.name} (${stats.highestHomeLoose.result})`

  if (element.awayTeam.id === teamId && element.goalDifference < 0) {
    stats.value.awayGames++
    stats.value.awayWins++
    if (stats.highestAwayWin) {
      if (stats.highestAwayWin.goalDifference > element.goalDifference)
        stats.highestAwayWin = element
    } else {
      stats.highestAwayWin = element
    }
  }

  if (stats.highestAwayWin)
    state.highestAwayWin = `${stats.highestAwayWin.homeTeam.name} (${stats.highestAwayWin.result})`

  if (element.awayTeam.id === teamId && element.goalDifference > 0) {
    stats.value.awayGames++
    if (stats.highestAwayLoose) {
      if (stats.highestAwayLoose.goalDifference < element.goalDifference)
        stats.highestAwayLoose = element
    } else {
      stats.highestAwayLoose = element
    }
  }
  if (stats.highestAwayLoose)
    state.highestAwayLoose = `${stats.highestAwayLoose.homeTeam.name} (${stats.highestAwayLoose.result})`

  // calc quotas
  state.homeQuota = Math.round((stats.value.homeWins / stats.value.homeGames) * 100).toFixed(2)
  state.awayQuota = Math.round((stats.value.awayWins / stats.value.awayGames) * 100).toFixed(2)
});

</script>

<style></style>