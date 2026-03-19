import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
    collections: {
        organizations: defineCollection({
            type: 'data',
            source: 'organizations/**/*.json',
            schema: z.object({
                name: z.string(),
                clubs: z.array(z.object({
                    name: z.string(),
                })),
            }),
        }),
        leagues: defineCollection({
            type: 'data',
            source: 'leagues/**/*.json',
            schema: z.object({
                title: z.string(),
                ids: z.array(z.string()),
                organization: z.string(),
                sort: z.number(),
                promoted: z.number(),
                relegated: z.number(),
            }),
        }),
    },
})
