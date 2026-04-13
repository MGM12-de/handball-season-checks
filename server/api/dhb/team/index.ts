import type { OrganizationListItem } from '~~/types/league'
import organizationsIndex from '~~/content/organizations/index.json'
import { getTeamUrl } from '../../../../server/utils/dhbUtils'

interface OrganizationContentEntry {
  name?: string
  parent?: string
  clubs?: Array<{ name?: string }>
}

const TEAM_SUFFIXES = new Set(['2', '3', '4', '5', '6', '7', '8', '9', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'])
const WHITESPACE_REGEXP = /\s+/

function extractClubName(teamName: string): string {
  const normalizedTeamName = teamName.trim()
  if (!normalizedTeamName)
    return ''

  const parts = normalizedTeamName.split(WHITESPACE_REGEXP)
  const suffix = parts.at(-1)

  return (parts.length > 1 && suffix && TEAM_SUFFIXES.has(suffix))
    ? parts.slice(0, -1).join(' ')
    : normalizedTeamName
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
      const normalizedClubName = extractClubName(clubName).toLowerCase()

      const foundOrganizations = new Map<string, OrganizationListItem>()

      const addOrganizationById = (organizationId: string) => {
        const orgInfo = organizationsList.find(o => o.id === organizationId)
        if (orgInfo) {
          foundOrganizations.set(orgInfo.id, orgInfo)
        }
      }

      const processParentOrganization = (parentId: string) => {
        const districtDocuments = organizationDocuments.filter(doc => doc.parent === parentId)
        for (const districtDocument of districtDocuments) {
          if (!districtDocument.clubs?.some(c => c.name?.toLowerCase() === normalizedClubName)) {
            continue
          }

          const districtOrgInfo = organizationsList.find(
            org => org.parent === parentId && org.name === districtDocument.name,
          )

          if (districtOrgInfo) {
            foundOrganizations.set(districtOrgInfo.id, districtOrgInfo)
            addOrganizationById(parentId)
          }
        }
      }

      // Process all parent organizations (bhv, bwhv, etc.)
      const uniqueParents = new Set(organizationDocuments
        .filter(doc => doc.parent)
        .map(doc => doc.parent))
      uniqueParents.forEach(parent => processParentOrganization(parent!))

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
