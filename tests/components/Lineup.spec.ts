import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import Lineup from '~/components/team/lineup.vue'

describe('lineup Component', () => {
    it('renders correctly', async () => {
        const component = await mountSuspended(Lineup, {
            props: {
                teamId: '12345',
            },
        })
        expect(component.text()).toBeDefined()
    })
})
