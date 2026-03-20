<script lang="ts" setup>
import { LeagueSeasonCalculator } from '~/services/LeagueSeasonCalculator'

const { getForeignOrganizations } = LeagueSeasonCalculator

const route = useRoute()

const organizationId = computed(() => {
    const idParam = route.params.id
    const rawId = Array.isArray(idParam) ? idParam.join('-') : idParam
    return typeof rawId === 'string' ? rawId : ''
})

const { leagues, organizationName } = useOrganizationLeagues(organizationId)
</script>

<template>
    <UPageHeader :title="organizationName" />

    <UPageBody>
        <div v-for="league in leagues" :key="league.title" class="mb-8 space-y-4">
            <h2 v-if="league.promoted.length || league.promotionPlayoff.length || league.relegated.length || league.relegationPlayoff.length"
                class="text-xl font-bold">
                {{ league.title }}
            </h2>

            <LazyUPageGrid v-if="league.promoted.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    Aufsteiger
                </h3>
                <UPageCard v-for="(row, index) in league.promoted" :key="`p-${index}`"
                    :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                    highlight-color="success">
                    <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                    <template #footer>
                        <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                            :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                            {{ n.name }}
                        </UBadge>
                    </template>
                </UPageCard>
            </LazyUPageGrid>

            <div v-if="league.promotionPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    Aufstiegsrelegation ({{ league.promotionPlayoffSpots }} Platz<span
                        v-if="league.promotionPlayoffSpots !== 1">e</span>)
                </h3>
                <LazyUPageGrid>
                    <UPageCard v-for="(row, index) in league.promotionPlayoff" :key="`pr-${index}`"
                        :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                        highlight-color="warning">
                        <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>

            <LazyUPageGrid v-if="league.relegated.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    Absteiger
                </h3>
                <UPageCard v-for="(row, index) in league.relegated" :key="`r-${index}`"
                    :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                    highlight-color="error">
                    <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                    <template #footer>
                        <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                            :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                            {{ n.name }}
                        </UBadge>
                    </template>
                </UPageCard>
            </LazyUPageGrid>

            <div v-if="league.relegationPlayoff.length" class="space-y-2">
                <h3 class="text-base font-semibold text-warning-600">
                    Abstiegsrelegation ({{ league.relegationPlayoffSpots }} Platz<span
                        v-if="league.relegationPlayoffSpots !== 1">e</span>)
                </h3>
                <LazyUPageGrid>
                    <UPageCard v-for="(row, index) in league.relegationPlayoff" :key="`rr-${index}`"
                        :title="row.team?.name || 'Unknown Team'" orientation="horizontal" reverse highlight
                        highlight-color="warning">
                        <img :src="row.team?.logo" alt="Team Logo" class="w-16 h-16 object-contain">

                        <template #footer>
                            <UBadge v-for="n in getForeignOrganizations(row.team?.organizations, league.organization)"
                                :key="n.id || n.name" color="primary" class="ml-auto" size="md">
                                {{ n.name }}
                            </UBadge>
                        </template>
                    </UPageCard>
                </LazyUPageGrid>
            </div>
        </div>
    </UPageBody>
</template>

<style></style>
