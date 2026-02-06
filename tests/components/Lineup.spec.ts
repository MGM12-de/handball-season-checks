import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import Lineup from '~/components/team/lineup.vue'

describe('lineup Component', () => {
    it('renders correctly', async () => {
        const component = await mountSuspended(Lineup, {
            props: {
                teamId: 'sr.competitor.3980-132716',
            },
        })
        expect(component.text()).toBeDefined()
    })
})
