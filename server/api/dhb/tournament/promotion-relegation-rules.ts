import { z } from 'zod'

const querySchema = z.object({
  id: z.string().min(1, 'Tournament ID is required'),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  const rules = [
    { pattern: /sportradar\.dhbdata\.16059/, promoted: 2, relegated: 3, divisions: 1 },
    { pattern: /m-rl-bw_bwhv/, promoted: 2, relegated: 2, divisions: 1 },
    { pattern: /m-ol-\d-bw_bwhv/, promoted: 2, relegated: 4, divisions: 2 },
    { pattern: /m-vl-\d-bw_bwhv/, promoted: 2, relegated: 6, divisions: 4 },
    { pattern: /m-ll-\d-bw_bwhv/, promoted: 2, relegated: 4, divisions: 8 },
    { pattern: /m-bol-\d-nf_nf/, promoted: 2, relegated: 8, divisions: 2 },
    { pattern: /m-bl-nf_nf/, promoted: 4, relegated: 4, divisions: 1 },
    { pattern: /m-bk-\d-nf_nf/, promoted: 4, relegated: 4, divisions: 2 },
    { pattern: /m-2bk-\d-nf_nf/, promoted: 4, relegated: 0, divisions: 2 },
  ]

  const match = rules.find(rule => rule.pattern.test(query.id))
  if (!match)
    return null

  const promoted = Math.floor(match.promoted / match.divisions)
  const playUp = match.promoted % match.divisions > 0 ? 1 : 0
  const relegated = Math.floor(match.relegated / match.divisions)
  const playDown = match.relegated % match.divisions > 0 ? 1 : 0

  return { id: query.id, promoted, playUp, relegated, playDown }
})
