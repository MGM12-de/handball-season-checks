import { z } from 'zod'

const querySchema = z.object({
  name: z.string().min(1, 'Club name is required'),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  const clubs = [{
    name: 'SV Salamander Kornwestheim 1894',
    organizations: [
      'bwhv',
      'bwhv-nf',
    ],
  }, {
    name: 'HC Erlangen',
    organizations: [
      'bhv',
    ],
  }, {
    name: 'TSB Heilbronn-Horkheim',
    organizations: [
      'bwhv',
      'bwhv-nf',
    ],
  }, {
    name: 'SG Pforzheim-Eutingen',
    organizations: [
      'bwhv',
      'bwhv-sr',
    ],
  }]

  const club = clubs.find(c => c.name.toLowerCase().includes(query.name.toLowerCase()))

  if (club) {
    const organizationsData = await Promise.all(
      club.organizations.map(orgId =>
        $fetch(`/api/dhb/organizations`, { query: { id: orgId } }).catch(() => null),
      ),
    )
    return {
      ...club,
      organizations: organizationsData.filter(Boolean),
    }
  }

  return null
})
