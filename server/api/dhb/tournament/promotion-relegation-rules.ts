import { z } from 'zod'

const querySchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  const data = [{
    id: 'sportradar.dhbdata.16059',
    promoted: 2,
    relegated: 3,
  }]

  return data.find(item => item.id === query.id) || null
})
