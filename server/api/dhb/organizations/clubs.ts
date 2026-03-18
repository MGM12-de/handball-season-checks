import { z } from 'zod'

const querySchema = z.object({
  id: z.string().min(1, 'Organization ID is required'),
})

export default defineEventHandler(async (event) => {
  return 'Hello Nitro'
})
