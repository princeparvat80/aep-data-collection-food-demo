// Phase 3b: revise all resources -> add to library -> build -> embed URL.
import fs from 'fs'
const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const BASE = 'https://reactor.adobe.io'
const PROP = 'PR00054be9b3d6446e8d10f6e408021932'
const H = { Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID, Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json' }
async function rq(m, u, b) { const r = await fetch(u.startsWith('http') ? u : BASE + u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } } return { status: r.status, j } }
async function all(path) { let out = [], p = 1; while (true) { const r = await rq('GET', `${path}${path.includes('?') ? '&' : '?'}page[size]=100&page[number]=${p}`); const d = r.j.data || []; out = out.concat(d); if (d.length < 100) break; p++ } return out }

const extensions = await all(`/properties/${PROP}/extensions`)
const dataElements = await all(`/properties/${PROP}/data_elements`)
const rules = await all(`/properties/${PROP}/rules`)
console.log('resources -> ext:', extensions.length, 'de:', dataElements.length, 'rules:', rules.length)

// 1) revise all (idempotent; ignore "nothing to revise")
async function revise(type, id) {
  const r = await rq('PATCH', `/${type}/${id}`, { data: { type, id, meta: { action: 'revise' } } })
  return r.status
}
console.log('revising...')
for (const e of extensions) await revise('extensions', e.id)
for (const e of dataElements) await revise('data_elements', e.id)
for (const e of rules) await revise('rules', e.id)
console.log('  revised all')

// 2) fresh library
const r = await rq('POST', `/properties/${PROP}/libraries`, { data: { type: 'libraries', attributes: { name: 'Feastly - Build ' + Date.now() } } })
const LIB = r.j.data.id
console.log('library:', LIB)

// 3) add resources (per-type)
async function addRel(rel, refs) { const rr = await rq('POST', `/libraries/${LIB}/relationships/${rel}`, { data: refs }); console.log(`  add ${rel}:`, rr.status, rr.status < 300 ? `OK(${refs.length})` : JSON.stringify(rr.j).slice(0, 200)) }
await addRel('extensions', extensions.map((e) => ({ type: 'extensions', id: e.id })))
await addRel('data_elements', dataElements.map((e) => ({ type: 'data_elements', id: e.id })))
await addRel('rules', rules.map((e) => ({ type: 'rules', id: e.id })))

// 4) environment
const env = (await all(`/properties/${PROP}/environments`)).find((e) => e.attributes.stage === 'development')
await rq('PATCH', `/libraries/${LIB}/relationships/environment`, { data: { type: 'environments', id: env.id } })

// 5) build
const bd = await rq('POST', `/libraries/${LIB}/builds`, {})
const BUILD = bd.j.data.id
console.log('build:', BUILD)
let status = 'pending'
for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 4000)); const b = await rq('GET', `/builds/${BUILD}`); status = b.j.data.attributes.status; process.stdout.write(' ' + status); if (status === 'succeeded' || status === 'failed') break }
console.log('\nstatus:', status)

// 6) embed URL
const e2 = await rq('GET', `/environments/${env.id}`)
const a = e2.j.data.attributes
const embed = `https://assets.adobedtm.com/${a.library_path}/${a.library_name}`
console.log('EMBED:', embed)
fs.writeFileSync(process.env.OUT_FILE, JSON.stringify({ PROP, LIB, build: BUILD, status, embed }, null, 2))
