<template>
  <div>
    <UForm @submit="onSearch" class="space-y-4">
      <UFormGroup label="Club name">
        <UInput v-model="state.clubName" />
      </UFormGroup>
      <UButton type="submit">
        Search
      </UButton>
    </UForm>

    <UTable :rows="clubs" :loading="loading" />
  </div>
</template>

<script lang="ts" setup>
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types'
const state = reactive({
  clubName: undefined,
})
var clubs = ref([])
var loading = ref(false)

const onSearch = async (event: FormSubmitEvent<any>) => {
  loading.value = true
  const { data, pending, error, refresh } = useFetch("/api/dhb/searchClub", {
    query: { clubName: state.clubName }
  })
  clubs = data
  loading.value = false
}

</script>

<style></style>