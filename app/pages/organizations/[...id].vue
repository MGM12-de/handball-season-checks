<script lang="ts" setup>
const route = useRoute()

const leagueConfigs = [
  { title: '3. Liga', ids: ['sportradar.dhbdata.16059&phase=sportradar.dhbdata.18980'] },
  { title: 'Regionalliga', ids: ['handball4all.baden-wuerttemberg.m-rl-bw_bwhv'] },
  {
    title: 'Oberliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-ol-1-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ol-2-bw_bwhv',
    ],
  },
  {
    title: 'Verbandsliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-vl-1-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-vl-2-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-vl-3-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-vl-4-bw_bwhv',
    ],
  },
  {
    title: 'Landesliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-ll-1-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ll-2-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ll-3-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ll-4-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ll-5-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ll-6-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ll-7-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ll-8-bw_bwhv',
    ],
  },
  {
    title: 'Bezirksoberliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-bol-1-nf_nf',
      'handball4all.baden-wuerttemberg.m-bol-2-nf_nf',
    ],
  },
  {
    title: 'Bezirksliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-bl-nf_nf',
    ],
  },
  {
    title: 'Bezirksklasse',
    ids: [
      'handball4all.baden-wuerttemberg.m-bk-1-nf_nf',
      'handball4all.baden-wuerttemberg.m-bk-2-nf_nf',
    ],
  },
  {
    title: '2. Bezirksklasse',
    ids: [
      'handball4all.baden-wuerttemberg.m-2bk-1-nf_nf',
      'handball4all.baden-wuerttemberg.m-2bk-2-nf_nf',
    ],
  },
]

const { data: leagues } = useAsyncData('organization-leagues', async () => {
  return await Promise.all(
    leagueConfigs.map(async (config) => {
      // Lade alle Tabellen einer Liga-Ebene (z.B. alle 8 Landesligen) parallel
      const tables = await Promise.all(
        config.ids.map(id => $fetch<any[]>(`/api/dhb/tournament/table?id=${id}`)),
      )

      // Füge die Arrays der einzelnen Tabellen zu einem großen Array zusammen
      const combinedData = tables.flat()

      return {
        title: config.title,
        promoted: combinedData.filter(row => row.promoted === true),
        relegated: combinedData.filter(row => row.relegated === true),
      }
    }),
  )
})
</script>

<template>
  <UPageHeader :title="`Organization ${route.params.id}`" />

  <UPageBody>
    <div v-for="league in leagues" :key="league.title" class="mb-8 space-y-4">
      <!-- Zeigt den Namen der Liga an (z.B. "Landesliga"), wenn es darin Auf-/Absteiger gibt -->
      <h2 v-if="league.promoted.length || league.relegated.length" class="text-xl font-bold">
        {{ league.title }}
      </h2>

      <LazyUPageGrid v-if="league.promoted.length">
        <UPageCard v-for="(row, index) in league.promoted" :key="`p-${index}`" :title="row.team.name"
          orientation="horizontal" reverse highlight highlight-color="success">
          <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
          <template #footer>
            <UBadge v-for="n in row.team.organizations" :key="n.id" color="primary" class="ml-auto" size="md">
              {{ n.name }}
            </UBadge>
          </template>
        </UPageCard>
      </LazyUPageGrid>

      <LazyUPageGrid v-if="league.relegated.length">
        <UPageCard v-for="(row, index) in league.relegated" :key="`r-${index}`" :title="row.team.name"
          orientation="horizontal" reverse highlight highlight-color="error">
          <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
          <template #footer>
            <UBadge v-for="n in row.team.organizations" :key="n.id" color="primary" class="ml-auto" size="md">
              {{ n.name }}
            </UBadge>
          </template>
        </UPageCard>
      </LazyUPageGrid>
    </div>
  </UPageBody>
</template>

<style></style>
