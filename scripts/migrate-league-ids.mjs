#!/usr/bin/env node
/**
 * Migrates content/leagues/**\/*.json from the old handball.net API's opaque
 * string ids (e.g. "handball4all.baden-wuerttemberg.m-bol-1-nf_nf") to the
 * new API's numeric phase ids.
 *
 * The old API is dead and there is no id mapping table - the only way to
 * find a league's new id is to search for it by name and federation on the
 * live API. This script does that, but competition name search is very
 * broad (e.g. "Bezirksoberliga" alone returns 800+ hits nationwide), so it
 * does NOT blindly rewrite content files. Instead it:
 *
 *   1. Searches /competitions?name=<league title> for every league config.
 *   2. Filters results to competitions whose federation roughly matches the
 *      league's organization (via content/organizations/index.json).
 *   3. Resolves each matching competition's phases (/phases?competition_id=).
 *   4. Writes a report (default: scripts/league-id-mapping-report.json) you
 *      can review.
 *   5. With --apply, only rewrites a league's `ids` when the number of
 *      matched phases exactly equals the number of old ids (i.e. there is
 *      no ambiguity to resolve by hand) - everything else is left alone and
 *      flagged "review" in the report for you to fill in manually.
 *
 * Usage:
 *   node scripts/migrate-league-ids.mjs                 # write report only
 *   node scripts/migrate-league-ids.mjs --apply          # also update unambiguous leagues
 *   DHB_BASE_URL=https://handball.net/api/new node scripts/migrate-league-ids.mjs
 *
 * Requires network access to handball.net - run this somewhere that has it
 * (this repo's sandboxed dev/CI environment may not).
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LEAGUES_DIR = join(ROOT, 'content/leagues')
const ORGANIZATIONS_INDEX = join(ROOT, 'content/organizations/index.json')
const REPORT_PATH = join(ROOT, 'scripts/league-id-mapping-report.json')
const BASE_URL = process.env.DHB_BASE_URL || 'https://handball.net/api/new'
const APPLY = process.argv.includes('--apply')

const REFERER = 'https://www.handball.net/'
const MAX_PAGES = 40

async function dhbFetch(path, query = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined)
      url.searchParams.set(key, String(value))
  }

  const response = await fetch(url, { headers: { Referer: REFERER } })
  if (!response.ok)
    throw new Error(`${url} -> HTTP ${response.status}`)

  const envelope = await response.json()
  if (envelope?.success === false)
    throw new Error(`${url} -> success: false`)

  return envelope
}

async function fetchAllPages(path, query) {
  const results = []
  let page = 1

  while (page <= MAX_PAGES) {
    const envelope = await dhbFetch(path, { ...query, page })
    results.push(...(envelope.data ?? []))

    const lastPage = envelope.pagination?.last_page ?? 1
    if (page >= lastPage)
      break
    page += 1
  }

  return results
}

async function findLeagueFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory())
      files.push(...await findLeagueFiles(fullPath))
    else if (entry.isFile() && entry.name.endsWith('.json'))
      files.push(fullPath)
  }

  return files
}

/**
 * Strip common German "district association" prefixes and punctuation so
 * "Bezirk Neckar-Franken" and "HB NECKAR-FRANKEN" both normalize to
 * something containing "neckar franken".
 */
function normalizeFederationName(name) {
  return (name ?? '')
    .toLowerCase()
    .replace(/\b(bezirk|kreis|hb|handballverband|handball-verband)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function federationMatches(candidateName, expectedName) {
  const candidate = normalizeFederationName(candidateName)
  const expected = normalizeFederationName(expectedName)
  if (!candidate || !expected)
    return false

  const candidateWords = new Set(candidate.split(' ').filter(Boolean))
  const expectedWords = expected.split(' ').filter(Boolean)
  return expectedWords.length > 0 && expectedWords.every(word => candidateWords.has(word))
}

async function resolveCandidatesForLeague(config, organizationName) {
  const competitions = await fetchAllPages('/competitions', { name: config.title })

  const matchingCompetitions = organizationName
    ? competitions.filter(c => federationMatches(c.championship?.federation?.name, organizationName))
    : competitions

  const candidates = []

  for (const competition of matchingCompetitions) {
    const phases = await dhbFetch('/phases', { competition_id: competition.id }).then(r => r.data).catch(() => [])
    for (const phase of phases) {
      candidates.push({
        phaseId: phase.id,
        phaseName: phase.name,
        competitionId: competition.id,
        competitionName: competition.name,
        federationName: competition.championship?.federation?.name,
      })
    }
  }

  return candidates
}

async function main() {
  const organizationsIndex = JSON.parse(await readFile(ORGANIZATIONS_INDEX, 'utf-8'))
  const organizationsById = new Map(organizationsIndex.map(org => [org.id, org.name]))

  const leagueFiles = await findLeagueFiles(LEAGUES_DIR)
  const report = []

  for (const filePath of leagueFiles) {
    const relPath = relative(ROOT, filePath)
    const config = JSON.parse(await readFile(filePath, 'utf-8'))
    const organizationName = organizationsById.get(config.organization)

    process.stdout.write(`Resolving ${relPath} ("${config.title}", ${config.organization})...\n`)

    let candidates = []
    try {
      candidates = await resolveCandidatesForLeague(config, organizationName)
    }
    catch (error) {
      report.push({ file: relPath, oldIds: config.ids, status: 'error', error: String(error) })
      continue
    }

    const isUnambiguous = candidates.length > 0 && candidates.length === config.ids.length

    report.push({
      file: relPath,
      title: config.title,
      organization: config.organization,
      oldIds: config.ids,
      candidates,
      status: candidates.length === 0 ? 'no-match' : isUnambiguous ? 'auto' : 'review',
    })

    if (APPLY && isUnambiguous) {
      config.ids = candidates.map(c => String(c.phaseId))
      await writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`)
      process.stdout.write(`  -> applied: ${config.ids.join(', ')}\n`)
    }
  }

  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  const summary = report.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] ?? 0) + 1
    return acc
  }, {})

  process.stdout.write(`\nDone. ${JSON.stringify(summary)}\n`)
  process.stdout.write(`Report written to ${relative(ROOT, REPORT_PATH)}\n`)
  if (!APPLY)
    process.stdout.write('Run again with --apply to write back unambiguous ("auto") matches.\n')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
