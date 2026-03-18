<script lang="ts" setup>
const route = useRoute()

const organizationIdParts = route.params.id as string[]

const { data: organization } = useAsyncData('organization', () => {
  return queryContent('organizations', ...organizationIdParts).findOne()
})

const superOrganisation = organization.value?.parent

const leagueConfigs = [
  { title: '3. Liga', ids: ['sportradar.dhbdata.16059&phase=sportradar.dhbdata.18980'], organization: 'dhb', sort: 3 },
  { title: 'Regionalliga', ids: ['handball4all.baden-wuerttemberg.m-rl-bw_bwhv'], organization: 'bwhv', sort: 4 },
  {
    title: 'Oberliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-ol-1-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-ol-2-bw_bwhv',
    ],
    organization: 'bwhv',
    sort: 5,
  },
  {
    title: 'Verbandsliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-vl-1-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-vl-2-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-vl-3-bw_bwhv',
      'handball4all.baden-wuerttemberg.m-vl-4-bw_bwhv',
    ],
    organization: 'bwhv',
    sort: 6,

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
    organization: 'bwhv',
    sort: 7,
  },
  {
    title: 'Bezirksoberliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-bol-1-nf_nf',
      'handball4all.baden-wuerttemberg.m-bol-2-nf_nf',
    ],
    organization: 'bwhv-nf',
    sort: 8,
  },
  {
    title: 'Bezirksliga',
    ids: [
      'handball4all.baden-wuerttemberg.m-bl-nf_nf',
    ],
    organization: 'bwhv-nf',
    sort: 9,
  },
  {
    title: 'Bezirksklasse',
    ids: [
      'handball4all.baden-wuerttemberg.m-bk-1-nf_nf',
      'handball4all.baden-wuerttemberg.m-bk-2-nf_nf',
    ],
    organization: 'bwhv-nf',
    sort: 10,
  },
  {
    title: '2. Bezirksklasse',
    ids: [
      'handball4all.baden-wuerttemberg.m-2bk-1-nf_nf',
      'handball4all.baden-wuerttemberg.m-2bk-2-nf_nf',
    ],
    organization: 'bwhv-nf',
    sort: 11,
  },
]

const { data: leagues } = useAsyncData('organization-leagues', async () => {
  const rawLeagues = await Promise.all(
    leagueConfigs.map(async (config) => {
      // Lade alle Tabellen einer Liga-Ebene (z.B. alle 8 Landesligen) parallel
      const tables = await Promise.all(
        config.ids.map(id => $fetch<any[]>(`/api/dhb/tournament/table?id=${id}`)),
      )
      return { config, tables, extraRelegations: 0 }
    }),
  )

  // Ligen anhand von `sort` sortieren (damit wir sicher von oben nach unten durchlaufen)
  rawLeagues.sort((a, b) => a.config.sort - b.config.sort)

  const results = []

  for (let i = 0; i < rawLeagues.length; i++) {
    const current = rawLeagues[i]
    const config = current.config

    if (i > 0) {
      const prev = rawLeagues[i - 1]
      // Wenn sich die Organisation ändert (z.B. dhb -> bwhv, oder bwhv -> bwhv-nf)
      if (prev.config.organization !== config.organization) {
        const prevRelegated = results[i - 1].relegated
        // Zähle, wie viele Absteiger der HÖHEREN Liga in die Organisation der AKTUELLEN Liga fallen
        const matchingCount = prevRelegated.filter((row: any) => {
          const orgs = row.team?.organizations || []
          return orgs.some((o: any) =>
            o === config.organization || o.id === config.organization || o.name === config.organization,
          )
        }).length
        current.extraRelegations = matchingCount
      }
      else {
        // Innerhalb derselben Organisation (z.B. Regionalliga -> Oberliga) wird der gleitende Abstieg weitergegeben
        current.extraRelegations = prev.extraRelegations
      }
    }

    const combinedPromoted: any[] = []
    const combinedRelegated: any[] = []

    for (const table of current.tables) {
      // Bisherigen Standard-Absteiger zählen (welche von der API berechnet wurden)
      const standardRelegatedCount = table.filter((r: any) => r.relegated === true).length
      // Standard Absteiger + die zusätzlichen Absteiger von oben
      const totalRelegatedCount = standardRelegatedCount + current.extraRelegations

      table.forEach((row: any, index: number) => {
        const isPromoted = row.promoted === true
        // Berechne den Abstieg neu: Die untersten `totalRelegatedCount` Teams steigen ab
        const isRelegated = index >= table.length - totalRelegatedCount

        if (isPromoted)
          combinedPromoted.push(row)
        if (isRelegated)
          combinedRelegated.push({ ...row, relegated: true })
      })
    }

    results.push({
      title: config.title,
      promoted: combinedPromoted,
      relegated: combinedRelegated,
    })
  }

  return results
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
