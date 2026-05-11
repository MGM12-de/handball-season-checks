const fs = require('node:fs')

const file = 'app/layouts/default.vue'
let content = fs.readFileSync(file, 'utf8')

const replacement = `
<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1 w-full flex flex-col pt-4 pb-8">
      <UContainer class="flex-1 w-full flex flex-col">
        <AppOriginInfo />
        <slot />
      </UContainer>
    </main>
    <AppFooter />
  </div>
</template>
`

content = content.replace(/<template>[\s\S]*?<\/template>/, replacement.trim())
fs.writeFileSync(file, content)
