import type { OrganizationListItem } from '~~/types/league'
import organizationsIndex from '~~/content/organizations/index.json'
import { getTeamUrl } from '../../../../server/utils/dhbUtils'

interface OrganizationContentEntry {
  name?: string
  parent?: string
  clubs?: Array<{ name?: string }>
}

defineRouteMeta({
  openAPI: {
    description: 'Get team data',
    summary: 'Get team data',
    tags: ['Team', 'DHB'],
    parameters: [
      {
        in: 'query',
        name: 'id',
        required: true,
        example: 'handball4all.wuerttemberg.36',
        summary: 'Team id',
      },
    ],
  },
})

export default defineEventHandler(async (event) => {
  // https://www.handball.net/a/sportdata/1/clubs/handball4all.wuerttemberg.36/teams

  const query = getQuery(event)

  if (!query.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No id received',
    })
  }
  const teamId = query.id as string
  const teamApi: any = await $fetch(getTeamUrl(teamId))

  const clubName = teamApi.data?.club.name
  let teamOrganizationsData: OrganizationListItem[] = []

  if (clubName) {
    try {
      const organizationsList = organizationsIndex as OrganizationListItem[]
      const organizationDocuments = (await queryCollection(event, 'organizations').all()) as OrganizationContentEntry[]
      const normalizedClubName = clubName.toLowerCase()

      const foundOrganizations = new Map<string, OrganizationListItem>()

      const addOrganizationById = (organizationId: string) => {
        const orgInfo = organizationsList.find(o => o.id === organizationId)
        if (orgInfo) {
          foundOrganizations.set(orgInfo.id, orgInfo)
        }
      }

      const bhvDistrictDocuments = organizationDocuments.filter(doc => doc.parent === 'bhv')
      for (const districtDocument of bhvDistrictDocuments) {
        if (!districtDocument.clubs?.some(c => c.name?.toLowerCase() === normalizedClubName)) {
          continue
        }

        const districtOrgInfo = organizationsList.find(
          org => org.parent === 'bhv' && org.name === districtDocument.name,
        )

        if (districtOrgInfo) {
          foundOrganizations.set(districtOrgInfo.id, districtOrgInfo)
          addOrganizationById('bhv')
        }
      }

      const bwhvDistrictDocuments = organizationDocuments.filter(doc => doc.parent === 'bwhv')
      for (const districtDocument of bwhvDistrictDocuments) {
        if (!districtDocument.clubs?.some(c => c.name?.toLowerCase() === normalizedClubName)) {
          continue
        }

        const districtOrgInfo = organizationsList.find(
          org => org.parent === 'bwhv' && org.name === districtDocument.name,
        )

        if (districtOrgInfo) {
          foundOrganizations.set(districtOrgInfo.id, districtOrgInfo)
          addOrganizationById('bwhv')
        }
      }

      teamOrganizationsData = Array.from(foundOrganizations.values())
    }
    catch (e) {
      console.warn('Could not query organizations from Nuxt Content', e)
    }
  }

  if (teamApi.data?.club) {
    teamApi.data.club.organizations = teamOrganizationsData
  }

  return teamApi.data
})
