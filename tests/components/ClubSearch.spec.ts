import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ClubSearch from '~/components/club/search.vue'

describe('club search component', () => {
  it('shows search results once the API call resolves', async () => {
    registerEndpoint('/api/dhb/searchClub', () => [
      { id: 1, name: 'TSV Willsbach', logo: '', organization: { id: 1, name: 'BWHV', logo: '' } },
    ])

    const component = await mountSuspended(ClubSearch)

    await component.find('input').setValue('Willsbach')
    await component.vm.$nextTick()

    // watchDebounced waits 400ms before firing the search
    await new Promise(resolve => setTimeout(resolve, 500))
    await flushPromises()

    expect(component.text()).toContain('TSV Willsbach')
  })
})
