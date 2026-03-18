import { z } from 'zod'

const querySchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  const rules = [
    { pattern: /sportradar\.dhbdata\.16059/, promoted: 2, relegated: 3 },
    { pattern: /m-rl-bw_bwhv/, promoted: 2, relegated: 2 },
    { pattern: /m-ol-\d-bw_bwhv/, promoted: 1, relegated: 2 },
    { pattern: /m-vl-\d-bw_bwhv/, promoted: 1, relegated: 3 },
    { pattern: /m-ll-\d-bw_bwhv/, promoted: 1, relegated: 2 },
    { pattern: /m-bol-\d-nf_nf/, promoted: 1, relegated: 4 },
    { pattern: /m-bl-nf_nf/, promoted: 2, relegated: 2 },
    { pattern: /m-bk-\d-nf_nf/, promoted: 2, relegated: 2 },
    { pattern: /m-2bk-\d-nf_nf/, promoted: 2, relegated: 0 },
  ]

  const match = rules.find(rule => rule.pattern.test(query.id))

  return match ? { id: query.id, promoted: match.promoted, relegated: match.relegated } : null
})
