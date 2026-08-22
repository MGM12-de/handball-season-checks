import { z } from 'zod'

const querySchema = z.object({
  name: z.string().min(1, 'Phase name is required'),
})

/**
 * BEST EFFORT: the old API's tournament ids embedded a league-type slug
 * (e.g. "m-bol-1-nf_nf") that these rules pattern-matched directly. The new
 * API's phase ids are opaque integers - the closest equivalent is the
 * phase *name* (e.g. "M-BOL-1-NF"), which follows a similar naming
 * convention per the migration notes. These patterns are ported over
 * case-insensitively but are unverified against real phase names.
 */
export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  const rules = [
    { pattern: /^M-3HBL/i, promoted: 2, relegated: 3, divisions: 1 },
    { pattern: /^M-RL-BW/i, promoted: 2, relegated: 2, divisions: 1 },
    { pattern: /^M-OL-\d-BW/i, promoted: 2, relegated: 4, divisions: 2 },
    { pattern: /^M-VL-\d-BW/i, promoted: 2, relegated: 6, divisions: 4 },
    { pattern: /^M-LL-\d-BW/i, promoted: 2, relegated: 4, divisions: 8 },
    { pattern: /^M-BOL-\d-NF/i, promoted: 2, relegated: 8, divisions: 2 },
    { pattern: /^M-BL-NF/i, promoted: 4, relegated: 4, divisions: 1 },
    { pattern: /^M-BK-\d-NF/i, promoted: 4, relegated: 4, divisions: 2 },
    { pattern: /^M-2BK-\d-NF/i, promoted: 4, relegated: 0, divisions: 2 },
  ]

  const match = rules.find(rule => rule.pattern.test(query.name))
  if (!match)
    return null

  const promoted = Math.floor(match.promoted / match.divisions)
  const playUp = match.promoted % match.divisions > 0 ? 1 : 0
  const relegated = Math.floor(match.relegated / match.divisions)
  const playDown = match.relegated % match.divisions > 0 ? 1 : 0

  return { name: query.name, promoted, playUp, relegated, playDown }
})
