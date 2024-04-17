<template>
  <div>
    <UForm :state="state" class="space-y-4">
      <UFormGroup label="CEO" name="ceo" v-if="state.ceo">
        <UInput disabled v-model="state.ceo" />
      </UFormGroup>
      <UFormGroup label="President" name="president" v-if="state.president">
        <UInput disabled v-model="state.president" />
      </UFormGroup>
      <UFormGroup label="Contact" name="contact">
        <UInput disabled v-model="state.contact" v-if="state.contact" />
        <UButton icon="i-heroicons-envelope" color="primary" variant="link" :label="state.email" :to="state.email"
          v-if="state.email" />
        <UButton icon="i-heroicons-phone" color="primary" variant="link" :label="state.telephone" :to="state.telephone"
          v-if="state.telephone" />
        <UButton icon="i-heroicons-printer" color="primary" variant="link" :label="state.fax" :to="state.fax"
          v-if="state.fax" />
      </UFormGroup>
      <UFormGroup label="Address" name="address" v-if="state.address">
        <UTextarea disabled v-model="state.address" />
      </UFormGroup>
      <UFormGroup label="Website" name="website" v-if="state.website">
        <UButton icon="i-heroicons-globe-alt" color="primary" variant="link" :label="state.website"
          :to="state.website" />
      </UFormGroup>
      <UFormGroup label="Ticketshop" name="tickets" v-if="state.ticketshop">
        <UButton icon="i-heroicons-ticket" color="primary" variant="link" :label="state.ticketshop"
          :to="state.ticketshop" />
      </UFormGroup>
      <UFormGroup label="Socials" name="socials">
        <UButton icon="i-simple-icons-facebook" color="blue" variant="link" label="Facebook" :to="state.facebook"
          v-if="state.facebook" />
        <UButton icon="i-simple-icons-instagram" color="pink" variant="link" label="Instagram" v-if="state.instagram"
          :to="state.instagram" />
        <UButton icon="i-simple-icons-youtube" color="red" variant="link" label="YouTube" v-if="state.youtube"
          :to="state.youtube" />
        <UButton icon="i-simple-icons-x" color="white" variant="link" label="X" v-if="state.twitter"
          :to="state.twitter" />
        <UButton icon="i-simple-icons-tiktok" color="white" variant="link" label="TikTok" v-if="state.tikTok"
          :to="state.tikTok" />
      </UFormGroup>
    </UForm>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  club: {
    type: Object,
    required: true
  }
})
const { club } = props;

let state = reactive({
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
  ticketshop: undefined
})

useAsyncData(
  `club/${club.id}/info`,
  () => $fetch("/api/dhb/club/info", {
    query: { id: club.id }
  })
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

<style></style>