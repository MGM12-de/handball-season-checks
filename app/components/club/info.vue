<script lang="ts" setup>
const props = defineProps({
  club: {
    type: Object,
    required: true,
  },
})
const { club } = props

const state = reactive({
  ceo: undefined,
  president: undefined,
  contact: undefined,
  email: undefined,
  telephone: undefined,
  fax: undefined,
  address: undefined,
  facebook: undefined,
  instagram: undefined,
  youtube: undefined,
  twitter: undefined,
  tikTok: undefined,
  website: undefined,
  ticketshop: undefined,
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
  state.contact = clubInfoData.contact
  state.email = clubInfoData.email
  state.telephone = clubInfoData.telephone
  state.fax = clubInfoData.fax
  state.address = clubInfoData.address
  state.facebook = clubInfoData.facebook
  state.instagram = clubInfoData.instagram
  state.youtube = clubInfoData.youtube
  state.twitter = clubInfoData.twitter
  state.tikTok = clubInfoData.tikTok
  state.website = clubInfoData.website
  state.ticketshop = clubInfoData.ticketshop
})
</script>

<template>
  <div>
    <UForm :state="state" class="space-y-4">
      <UFormField v-if="state.ceo" label="CEO" name="ceo">
        <UInput v-model="state.ceo" disabled />
      </UFormField>
      <UFormField v-if="state.president" label="President" name="president">
        <UInput v-model="state.president" disabled />
      </UFormField>
      <UFormField label="Contact" name="contact">
        <UInput v-if="state.contact" v-model="state.contact" disabled />
        <UButton v-if="state.email" icon="i-heroicons-envelope" color="primary" variant="link" :label="state.email"
          :to="state.email" />
        <UButton v-if="state.telephone" icon="i-heroicons-phone" color="primary" variant="link" :label="state.telephone"
          :to="state.telephone" />
        <UButton v-if="state.fax" icon="i-heroicons-printer" color="primary" variant="link" :label="state.fax"
          :to="state.fax" />
      </UFormField>
      <UFormField v-if="state.address" label="Address" name="address">
        <UTextarea v-model="state.address" disabled />
      </UFormField>
      <UFormField v-if="state.website" label="Website" name="website">
        <UButton icon="i-heroicons-globe-alt" color="primary" variant="link" :label="state.website"
          :to="state.website" />
      </UFormField>
      <UFormField v-if="state.ticketshop" label="Ticketshop" name="tickets">
        <UButton icon="i-heroicons-ticket" color="primary" variant="link" :label="state.ticketshop"
          :to="state.ticketshop" />
      </UFormField>
      <UFormField label="Socials" name="socials">
        <UButton v-if="state.facebook" icon="i-simple-icons-facebook" color="primary" variant="link" label="Facebook"
          :to="state.facebook" />
        <UButton v-if="state.instagram" icon="i-simple-icons-instagram" color="primary" variant="link" label="Instagram"
          :to="state.instagram" />
        <UButton v-if="state.youtube" icon="i-simple-icons-youtube" color="primary" variant="link" label="YouTube"
          :to="state.youtube" />
        <UButton v-if="state.twitter" icon="i-simple-icons-x" color="primary" variant="link" label="X"
          :to="state.twitter" />
        <UButton v-if="state.tikTok" icon="i-simple-icons-tiktok" color="primary" variant="link" label="TikTok"
          :to="state.tikTok" />
      </UFormField>
    </UForm>
  </div>
</template>

<style></style>
