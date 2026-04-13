import type { LeagueConfig, TableRow } from '../../../types/league'
import { describe, expect, it } from 'vitest'
import { LeagueSeasonCalculator } from '../../../app/services/LeagueSeasonCalculator'

function createLeagueConfig(title: string, sort: number, promoted: number, relegated: number): LeagueConfig {
  return {
    title,
    ids: [title],
    organization: 'org',
    sort,
    promoted,
    relegated,
  }
}

function createRow(name: string): TableRow {
  return {
    team: {
      name,
      organizations: ['org'],
    },
    games: 10,
  }
}

describe('leagueSeasonCalculator', () => {
  it('keeps a team listed as promoted and marks it when a clubmate already occupies the higher league', () => {
    const calculator = new LeagueSeasonCalculator('org')

    const results = calculator.calculate([
      {
        config: createLeagueConfig('Higher League', 1, 0, 0),
        tables: [[createRow('TSV Beispiel I'), createRow('HSG Norden')]],
      },
      {
        config: createLeagueConfig('Current League', 2, 1, 0),
        tables: [[createRow('TSV Beispiel II'), createRow('TV Süden')]],
      },
    ])

    expect(results[1]?.promoted).toHaveLength(1)
    expect(results[1]?.promoted[0]?.team?.name).toBe('TSV Beispiel II')
    expect(results[1]?.promoted[0]?.promotionBlocked).toBe(true)
  })

  it('marks a promoted team when a clubmate relegates into the higher league', () => {
    const calculator = new LeagueSeasonCalculator('org')

    const results = calculator.calculate([
      {
        config: createLeagueConfig('Top League', 1, 0, 1),
        tables: [[createRow('HSG West'), createRow('TSV Beispiel I')]],
      },
      {
        config: createLeagueConfig('Higher League', 2, 0, 0),
        tables: [[createRow('MTV Mitte'), createRow('TV Süden')]],
      },
      {
        config: createLeagueConfig('Current League', 3, 1, 0),
        tables: [[createRow('TSV Beispiel II'), createRow('HC Ost')]],
      },
    ])

    expect(results[2]?.promoted).toHaveLength(1)
    expect(results[2]?.promoted[0]?.team?.name).toBe('TSV Beispiel II')
    expect(results[2]?.promoted[0]?.promotionBlocked).toBe(true)
  })

  it('hides the league organization and its parents from organization badges', () => {
    expect(LeagueSeasonCalculator.getForeignOrganizations([
      { id: 'bwhv-nf', name: 'Bezirk Neckar-Franken' },
      { id: 'bwhv', name: 'BWHV' },
      { id: 'bwhv-srm', name: 'Bezirk Stuttgart-Rems-Murr' },
      { id: 'dhb', name: 'DHB' },
    ], 'bwhv-nf')).toEqual([
      { id: 'bwhv-srm', name: 'Bezirk Stuttgart-Rems-Murr' },
      { id: 'dhb', name: 'DHB' },
    ])
  })

  it('keeps child organizations visible on parent league pages', () => {
    expect(LeagueSeasonCalculator.getForeignOrganizations([
      { id: 'bwhv-nf', name: 'Bezirk Neckar-Franken' },
      { id: 'bwhv', name: 'BWHV' },
    ], 'bwhv')).toEqual([
      { id: 'bwhv-nf', name: 'Bezirk Neckar-Franken' },
    ])
  })

  it('inherits badge color from parent organization when child has no color', () => {
    expect(LeagueSeasonCalculator.getForeignOrganizations([
      { id: 'bhv-oberbayern', name: 'Bezirk Oberbayern' },
    ], 'bwhv')).toEqual([
      { id: 'bhv-oberbayern', name: 'Bezirk Oberbayern', color: 'blue' },
    ])
  })
})
