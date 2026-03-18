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
  }, {
    id: 'bwhv-sr',
    name: 'Bezirk Schwarzwald-Rhein',
    parent: 'bwhv',
  }, {
    id: 'bwhv-rn',
    name: 'Bezirk Rhein-Neckar',
    parent: 'bwhv',
  }, {
    id: 'bwhv-na',
    name: 'Bezirk Neckar-Alb',
    parent: 'bwhv',
  }, {
    id: 'bwhv-bn',
    name: 'Bezirk Bodensee-Neckar',
    parent: 'bwhv',
  }, {
    id: 'bwhv-srm',
    name: 'Bezirk Stuttgart-Rems-Murr',
    parent: 'bwhv',
  }, {
    id: 'bwhv-sb',
    name: 'Bezirk Süd-Baden',
    parent: 'bwhv',
  }]

  if (query.id) {
    return organizations.find(org => org.id === query.id)
  }
  return organizations
})
