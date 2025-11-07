<script lang="ts" setup>
const props = defineProps({
  club: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()

const { club } = props

const state = reactive({
  ceo: undefined,
  president: undefined,
  contact: {
    email: undefined,
    telephone: undefined,
    fax: undefined,
    info: undefined,
  },
  address: undefined,
  socials: {
    facebook: undefined,
    instagram: undefined,
    youtube: undefined,
    twitter: undefined,
    tikTok: undefined,
  },
  website: undefined,
  ticketshop: undefined,
})

const hasSocials = computed(() => {
  return Object.values(state.socials).some(social => social && String(social).trim() !== '')
})
const hasContact = computed(() => {
  return state.contact && (state.contact.info || state.contact.email || state.contact.telephone || state.contact.fax)
})

useAsyncData(
  `club/${club.id}/info`,
  () => $fetch('/api/dhb/club/info', {
    query: { id: club.id },
  }),
).then((data) => {
  const clubInfoData = data.data.value
  state.ceo = clubInfoData.ceo
  state.president = clubInfoData.president
  state.contact = {
    info: clubInfoData.contact,
    email: clubInfoData.email,
    telephone: clubInfoData.telephone,
    fax: clubInfoData.fax,
  }
  state.address = clubInfoData.address
  state.socials = {
    facebook: clubInfoData.facebook,
    instagram: clubInfoData.instagram,
    youtube: clubInfoData.youtube,
    twitter: clubInfoData.twitter,
    tikTok: clubInfoData.tikTok,
  }
  state.website = clubInfoData.website
  state.ticketshop = clubInfoData.ticketshop
})
</script>

<template>
  <div>
    <UForm :state="state" class="space-y-4">
      <UFormField v-if="state.ceo" :label="t('ceo')" name="ceo">
        <UInput v-model="state.ceo" disabled />
      </UFormField>
      <UFormField v-if="state.president" :label="t('president')" name="president">
        <UInput v-model="state.president" disabled />
      </UFormField>
      <UFormField v-if="hasContact" :label="t('contact')" name="contact">
        <UInput v-if="state.contact.info" v-model="state.contact.info" disabled />
        <UButton v-if="state.contact.email" icon="i-heroicons-envelope" color="primary" variant="link"
          :label="state.contact.email" :to="state.contact.email" />
        <UButton v-if="state.contact.telephone" icon="i-heroicons-phone" color="primary" variant="link"
          :label="state.contact.telephone" :to="state.contact.telephone" />
        <UButton v-if="state.contact.fax" icon="i-heroicons-printer" color="primary" variant="link"
          :label="state.contact.fax" :to="state.contact.fax" />
      </UFormField>
      <UFormField v-if="state.address" :label="t('address')" name="address">
        <UTextarea v-model="state.address" disabled />
      </UFormField>
      <UFormField v-if="state.website" :label="t('website')" name="website">
        <UButton icon="i-heroicons-globe-alt" color="primary" variant="link" :label="state.website"
          :to="state.website" />
      </UFormField>
      <UFormField v-if="state.ticketshop" :label="t('ticketshop')" name="tickets">
        <UButton icon="i-heroicons-ticket" color="primary" variant="link" :label="state.ticketshop"
          :to="state.ticketshop" />
      </UFormField>
      <UFormField v-if="hasSocials" :label="t('socials')" name="socials">
        <UButton v-if="state.socials.facebook" icon="i-simple-icons-facebook" color="primary" variant="link"
          label="Facebook" :to="state.socials.facebook" />
        <UButton v-if="state.socials.instagram" icon="i-simple-icons-instagram" color="primary" variant="link"
          label="Instagram" :to="state.socials.instagram" />
        <UButton v-if="state.socials.youtube" icon="i-simple-icons-youtube" color="primary" variant="link"
          label="YouTube" :to="state.socials.youtube" />
        <UButton v-if="state.socials.twitter" icon="i-simple-icons-x" color="primary" variant="link" label="X"
          :to="state.socials.twitter" />
        <UButton v-if="state.socials.tikTok" icon="i-simple-icons-tiktok" color="primary" variant="link" label="TikTok"
          :to="state.socials.tikTok" />
      </UFormField>
    </UForm>
  </div>
</template>

<style></style>
