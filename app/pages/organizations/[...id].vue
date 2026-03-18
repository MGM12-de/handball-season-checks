<script lang="ts" setup>
const route = useRoute()

const league = useAsyncData('league-3rd-hbl-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=sportradar.dhbdata.16059&phase=sportradar.dhbdata.18980`)
})

const leagueRL = useAsyncData('league-bwhv-rl-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-rl-bw_bwhv`)
})

const leagueOL1 = useAsyncData('league-bwhv-ol1-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ol-1-bw_bwhv`)
})

const leagueOL2 = useAsyncData('league-bwhv-ol2-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ol-2-bw_bwhv`)
})

const leagueVL1 = useAsyncData('league-bwhv-vl1-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-vl-1-bw_bwhv`)
})

const leagueVL2 = useAsyncData('league-bwhv-vl2-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-vl-2-bw_bwhv`)
})

const leagueVL3 = useAsyncData('league-bwhv-vl3-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-vl-3-bw_bwhv`)
})

const leagueVL4 = useAsyncData('league-bwhv-vl4-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-vl-4-bw_bwhv`)
})

const leagueLL1 = useAsyncData('league-bwhv-ll1-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-1-bw_bwhv`)
})

const leagueLL2 = useAsyncData('league-bwhv-ll2-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-2-bw_bwhv`)
})

const leagueLL3 = useAsyncData('league-bwhv-ll3-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-3-bw_bwhv`)
})

const leagueLL4 = useAsyncData('league-bwhv-ll4-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-4-bw_bwhv`)
})

const leagueLL5 = useAsyncData('league-bwhv-ll5-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-5-bw_bwhv`)
})

const leagueLL6 = useAsyncData('league-bwhv-ll6-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-6-bw_bwhv`)
})

const leagueLL7 = useAsyncData('league-bwhv-ll7-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-7-bw_bwhv`)
})

const leagueLL8 = useAsyncData('league-bwhv-ll8-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-ll-8-bw_bwhv`)
})

const leagueBOL1 = useAsyncData('league-bwhv-bol-1-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-bol-1-nf_nf`)
})

const leagueBOL2 = useAsyncData('league-bwhv-bol-2-m', () => {
  return $fetch(`/api/dhb/tournament/table?id=handball4all.baden-wuerttemberg.m-bol-2-nf_nf`)
})

const thirdHBL = computed(() => {
  const data: any[] = league.data.value || []
  return {
    promoted: data.filter(row => row.promoted === true),
    relegated: data.filter(row => row.relegated === true),
  }
})

const regionalLiga = computed(() => {
  const data: any[] = leagueRL.data.value || []
  return {
    promoted: data.filter(row => row.promoted === true),
    relegated: data.filter(row => row.relegated === true),
  }
})

const oberliga = computed(() => {
  const data1: any[] = leagueOL1.data.value || []
  const data2: any[] = leagueOL2.data.value || []
  const data = [...data1, ...data2]
  return {
    promoted: data.filter(row => row.promoted === true),
    relegated: data.filter(row => row.relegated === true),
  }
})
const verbandsliga = computed(() => {
  const data1: any[] = leagueVL1.data.value || []
  const data2: any[] = leagueVL2.data.value || []
  const data3: any[] = leagueVL3.data.value || []
  const data4: any[] = leagueVL4.data.value || []
  const data = [...data1, ...data2, ...data3, ...data4]
  return {
    promoted: data.filter(row => row.promoted === true),
    relegated: data.filter(row => row.relegated === true),
  }
})

const landesliga = computed(() => {
  const data1: any[] = leagueLL1.data.value || []
  const data2: any[] = leagueLL2.data.value || []
  const data3: any[] = leagueLL3.data.value || []
  const data4: any[] = leagueLL4.data.value || []
  const data5: any[] = leagueLL5.data.value || []
  const data6: any[] = leagueLL6.data.value || []
  const data7: any[] = leagueLL7.data.value || []
  const data8: any[] = leagueLL8.data.value || []
  const data = [...data1, ...data2, ...data3, ...data4, ...data5, ...data6, ...data7, ...data8]
  return {
    promoted: data.filter(row => row.promoted === true),
    relegated: data.filter(row => row.relegated === true),
  }
})

const bezirksoberliga = computed(() => {
  const data1: any[] = leagueBOL1.data.value || []
  const data2: any[] = leagueBOL2.data.value || []
  const data = [...data1, ...data2]
  return {
    promoted: data.filter(row => row.promoted === true),
    relegated: data.filter(row => row.relegated === true),
  }
})
</script>

<template>
  <UPageHeader :title="`Organization ${route.params.id}`" />

  <UPageBody>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in thirdHBL.promoted" :key="index" :title="row.team.name" orientation="horizontal"
        reverse highlight highlight-color="success">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in thirdHBL.relegated" :key="index" :title="row.team.name" orientation="horizontal"
        reverse highlight highlight-color="error">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>

    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in regionalLiga.promoted" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="success">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in regionalLiga.relegated" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="error">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>

    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in oberliga.promoted" :key="index" :title="row.team.name" orientation="horizontal"
        reverse highlight highlight-color="success">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in oberliga.relegated" :key="index" :title="row.team.name" orientation="horizontal"
        reverse highlight highlight-color="error">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in verbandsliga.promoted" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="success">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in verbandsliga.relegated" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="error">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in landesliga.promoted" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="success">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in landesliga.relegated" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="error">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in bezirksoberliga.promoted" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="success">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
    <LazyUPageGrid>
      <UPageCard v-for="(row, index) in bezirksoberliga.relegated" :key="index" :title="row.team.name"
        orientation="horizontal" reverse highlight highlight-color="error">
        <img :src="row.team.logo" alt="Team Logo" class="w-16 h-16 object-contain">
      </UPageCard>
    </LazyUPageGrid>
  </UPageBody>
</template>

<style></style>
