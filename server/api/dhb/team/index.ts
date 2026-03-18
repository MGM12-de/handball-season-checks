import { promises as fs } from 'fs'
import path from 'path'
import { getTeamUrl } from '../../../../server/utils/dhbUtils'

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
  let teamOrganizationsData: any[] = []

  if (clubName) {
    const orgIndexPath = path.join(process.cwd(), 'content', 'organizations', 'index.json')
    const organizationsList = JSON.parse(await fs.readFile(orgIndexPath, 'utf-8'))

    const foundOrganizations: any[] = []

    // Check bhv
    try {
      const bhvPath = path.join(process.cwd(), 'content', 'organizations', 'bhv.json')
      const bhvOrg = JSON.parse(await fs.readFile(bhvPath, 'utf-8'))
      if (bhvOrg.clubs.some((c: any) => c.name.toLowerCase() === clubName.toLowerCase())) {
        const orgInfo = organizationsList.find((o: any) => o.id === 'bhv')
        if (orgInfo) {
          foundOrganizations.push(orgInfo)
        }
      }
    }
    catch (e) {
      console.warn('Could not read bhv.json', e)
    }

    // Check bwhv districts
    try {
      const bwhvPath = path.join(process.cwd(), 'content', 'organizations', 'bwhv')
      const districtFiles = await fs.readdir(bwhvPath)

      for (const districtFile of districtFiles) {
        if (districtFile.endsWith('.json')) {
          const districtPath = path.join(bwhvPath, districtFile)
          const districtOrg = JSON.parse(await fs.readFile(districtPath, 'utf-8'))
          if (districtOrg.clubs.some((c: any) => c.name.toLowerCase() === clubName.toLowerCase())) {
            const orgId = `bwhv-${districtFile.replace('.json', '')}`
            const orgInfo = organizationsList.find((o: any) => o.id === orgId)
            if (orgInfo) {
              foundOrganizations.push(orgInfo)

              const parentOrgInfo = organizationsList.find((o: any) => o.id === 'bwhv')
              if (parentOrgInfo && !foundOrganizations.some(o => o.id === 'bwhv')) {
                foundOrganizations.push(parentOrgInfo)
              }
            }
          }
        }
      }
    }
    catch (e) {
      console.warn('Could not read bwhv organizations', e)
    }
    teamOrganizationsData = foundOrganizations
  }

  if (teamApi.data?.club) {
    teamApi.data.club.organizations = teamOrganizationsData
  }

  return teamApi.data
})
