// Phase 3c: revise -> collect REVISION ids -> library -> build -> embed URL.
import fs from 'fs'
const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const BASE = 'https://reactor.adobe.io'
const PROP = 'PR00054be9b3d6446e8d10f6e408021932'
const H = { Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID, Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json' }
async function rq(m, u, b) { const r = await fetch(u.startsWith('http') ? u : BASE + u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } } return { status: r.status, j } }
async function all(path) { let out = [], p = 1; while (true) { const r = await rq('GET', `${path}${path.includes('?') ? '&' : '?'}page[size]=100&page[number]=${p}`); const d = r.j.data || []; out = out.concat(d); if (d.length < 100) break; p++ } return out }

// For a working resource: ensure a revision exists, return the latest revision id.
async function latestRev(type, id) {
  await rq('PATCH', `/${type}/${id}`, { data: { type, id, meta: { action: 'revise' } } }) // ignore errors (already revised)
  const r = await rq('GET', `/${type}/${id}/revisions?page[size]=100`)
  const revs = (r.j.data || []).filter((x) => x.attributes.revision_number > 0).sort((a, b) => b.attributes.revision_number - a.attributes.revision_number)
  return revs[0] ? revs[0].id : id
}

const extensions = await all(`/properties/${PROP}/extensions`)
const dataElements = await all(`/properties/${PROP}/data_elements`)
const rules = await all(`/properties/${PROP}/rules`)
console.log('resources -> ext:', extensions.length, 'de:', dataElements.length, 'rules:', rules.length)

console.log('collecting revision ids...')
const extRev = []; for (const e of extensions) extRev.push(await latestRev('extensions', e.id))
const deRev = []; for (const e of dataElements) deRev.push(await latestRev('data_elements', e.id))
const ruleRev = []; for (const e of rules) ruleRev.push(await latestRev('rules', e.id))
console.log('  revisions -> ext:', extRev.length, 'de:', deRev.length, 'rules:', ruleRev.length)

// fresh library
const r = await rq('POST', `/properties/${PROP}/libraries`, { data: { type: 'libraries', attributes: { name: 'Feastly - Build ' + new Date().toISOString().slice(0, 19) } } })
const LIB = r.j.data.id
console.log('library:', LIB)

async function addRel(rel, ids) { const rr = await rq('POST', `/libraries/${LIB}/relationships/${rel}`, { data: ids.map((id) => ({ type: rel, id })) }); console.log(`  add ${rel}:`, rr.status, rr.status < 300 ? `OK(${ids.length})` : JSON.stringify(rr.j).slice(0, 220)) }
await addRel('extensions', extRev)
await addRel('data_elements', deRev)
await addRel('rules', ruleRev)

const env = (await all(`/properties/${PROP}/environments`)).find((e) => e.attributes.stage === 'development')
await rq('PATCH', `/libraries/${LIB}/relationships/environment`, { data: { type: 'environments', id: env.id } })

const bd = await rq('POST', `/libraries/${LIB}/builds`, {})
if (!bd.j.data) { console.log('build POST failed:', bd.status, JSON.stringify(bd.j).slice(0, 300)); process.exit(1) }
const BUILD = bd.j.data.id
console.log('build:', BUILD)
let status = 'pending'
for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 4000)); const b = await rq('GET', `/builds/${BUILD}`); status = b.j.data.attributes.status; process.stdout.write(' ' + status); if (status === 'succeeded' || status === 'failed') break }
console.log('\nstatus:', status)

const e2 = await rq('GET', `/environments/${env.id}`)
const a = e2.j.data.attributes
const embed = `https://assets.adobedtm.com/${a.library_path}/${a.library_name}`
console.log('EMBED:', embed)
fs.writeFileSync(process.env.OUT_FILE, JSON.stringify({ PROP, LIB, build: BUILD, status, embed }, null, 2))
