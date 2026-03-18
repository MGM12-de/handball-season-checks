import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
    collections: {
        organizations: defineCollection({
            type: 'data',
            source: 'organizations/**.json',
            schema: z.object({
                name: z.string(),
                clubs: z.array(z.object({
                    name: z.string(),
                })),
            }),
        }),
    },
})
