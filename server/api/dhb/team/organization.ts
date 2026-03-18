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
    name: 'Wölfe Würzburg',
    organizations: [
      'bhv',
    ],
  }, {
    name: 'TuS Fürstenfeldbruck',
    organizations: [
      'bhv',
    ],
  }, {
    name: 'TV Erlangen-Bruck',
    organizations: [
      'bhv',
    ],
  }, {
    name: 'Rhein-Neckar Löwen',
    organizations: [
      'bwhv',
      'bwhv-rn',
    ],
  }, {
    name: 'TSV Neuhausen/Filder 1898',
    organizations: [
      'bwhv',
      'bwhv-na',
    ],
  }, {
    name: 'VfL Pfullingen',
    organizations: [
      'bwhv',
      'bwhv-na',
    ],
  }, {
    name: 'HSG Konstanz',
    organizations: [
      'bwhv',
      'bwhv-bn',
    ],
  }, {
    name: 'Saase3 Leutershausen',
    organizations: [
      'bwhv',
      'bwhv-rn',
    ],
  }, {
    name: 'TV Bittenfeld 1898',
    organizations: [
      'bwhv',
      'bwhv-srm',
    ],
  }, {
    name: 'HBW Balingen-Weilstetten',
    organizations: [
      'bwhv',
      'bwhv-bn',
    ],
  }, {
    name: 'TSB Heilbronn-Horkheim',
    organizations: [
      'bwhv',
      'bwhv-nf',
    ],
  }, {
    name: 'HG Oftersheim/Schwetzingen',
    organizations: [
      'bwhv',
      'bwhv-rn',
    ],
  }, {
    name: 'TSV Asperg',
    organizations: [
      'bwhv',
      'bwhv-nf',
    ],
  }, {
    name: 'SG Köndringen/Teningen',
    organizations: [
      'bwhv',
      'bwhv-sb',
    ],
  }, {
    name: 'SG Pforzheim-Eutingen',
    organizations: [
      'bwhv',
      'bwhv-sr',
    ],
  }, {
    name: 'HSG Albstadt',
    organizations: [
      'bwhv',
      'bwhv-bn',
    ],
  }, {
    name: 'TSV Heiningen 1892',
    organizations: [
      'bwhv',
      'bwhv-na',
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
