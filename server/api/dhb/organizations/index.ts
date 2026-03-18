import { z } from 'zod'

const querySchema = z.object({
  id: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, data => querySchema.parse(data))

  const organizations = [{
    id: 'bwhv',
    name: 'Baden-Württembergischer Handball-Verband e.V.',
  }, {
    id: 'bhv',
    name: 'Bayrischer Handball-Verband e.V.',
  }, {
    id: 'bwhv-nf',
    name: 'Bezirk Neckar-Franken',
    parent: 'bwhv',
  }]

  if (query.id) {
    return organizations.find(org => org.id === query.id)
  }
  return organizations
})
