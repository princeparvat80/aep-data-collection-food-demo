// Phase 3: library + host + environment + build + embed URL (Reactor API).
import fs from 'fs'
const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const BASE = 'https://reactor.adobe.io'
const PROP = 'PR00054be9b3d6446e8d10f6e408021932'
const H = { Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID, Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json' }
async function rq(m, u, b) { const r = await fetch(u.startsWith('http') ? u : BASE + u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } } return { status: r.status, j } }
async function all(path) { // paginate
  let out = [], page = 1
  while (true) { const r = await rq('GET', `${path}${path.includes('?') ? '&' : '?'}page[size]=100&page[number]=${page}`); const d = r.j.data || []; out = out.concat(d); if (d.length < 100) break; page++ }
  return out
}

// 1) gather resources
const extensions = await all(`/properties/${PROP}/extensions`)
const dataElements = await all(`/properties/${PROP}/data_elements`)
const rules = await all(`/properties/${PROP}/rules`)
console.log('resources -> extensions:', extensions.length, '| data elements:', dataElements.length, '| rules:', rules.length)
const resourceRefs = [
  ...extensions.map((e) => ({ type: 'extensions', id: e.id })),
  ...dataElements.map((e) => ({ type: 'data_elements', id: e.id })),
  ...rules.map((e) => ({ type: 'rules', id: e.id })),
]

// 2) host (create Adobe-managed if none)
let hosts = await all(`/properties/${PROP}/hosts`)
let host = hosts[0]
if (!host) {
  const r = await rq('POST', `/properties/${PROP}/hosts`, { data: { type: 'hosts', attributes: { name: 'Adobe Managed', type_of: 'akamai' } } })
  if (![200, 201].includes(r.status)) { console.log('host FAIL', r.status, JSON.stringify(r.j).slice(0, 300)); process.exit(1) }
  host = r.j.data
}
console.log('host:', host.id, host.attributes.type_of)

// 3) environment (Development)
let envs = await all(`/properties/${PROP}/environments`)
let env = envs.find((e) => e.attributes.stage === 'development')
if (!env) {
  const r = await rq('POST', `/properties/${PROP}/environments`, { data: { type: 'environments', attributes: { name: 'Development', stage: 'development' }, relationships: { host: { data: { type: 'hosts', id: host.id } } } } })
  if (![200, 201].includes(r.status)) { console.log('env FAIL', r.status, JSON.stringify(r.j).slice(0, 300)); process.exit(1) }
  env = r.j.data
}
console.log('environment:', env.id, env.attributes.stage)

// 4) library
let libs = await all(`/properties/${PROP}/libraries`)
let lib = libs.find((l) => l.attributes.name === 'Feastly - Initial')
if (!lib) {
  const r = await rq('POST', `/properties/${PROP}/libraries`, { data: { type: 'libraries', attributes: { name: 'Feastly - Initial' } } })
  if (![200, 201].includes(r.status)) { console.log('library FAIL', r.status, JSON.stringify(r.j).slice(0, 300)); process.exit(1) }
  lib = r.j.data
}
const LIB = lib.id
console.log('library:', LIB, '| state:', lib.attributes.state)

// 5) add resources to library (per-type relationships)
async function addRel(rel, refs) {
  const r = await rq('POST', `/libraries/${LIB}/relationships/${rel}`, { data: refs })
  console.log(`  add ${rel}:`, r.status, r.status < 300 ? `OK (${refs.length})` : JSON.stringify(r.j).slice(0, 250))
}
await addRel('extensions', extensions.map((e) => ({ type: 'extensions', id: e.id })))
await addRel('data_elements', dataElements.map((e) => ({ type: 'data_elements', id: e.id })))
await addRel('rules', rules.map((e) => ({ type: 'rules', id: e.id })))

// 6) set environment on library
let se = await rq('PATCH', `/libraries/${LIB}/relationships/environment`, { data: { type: 'environments', id: env.id } })
console.log('set environment:', se.status, se.status < 300 ? 'OK' : JSON.stringify(se.j).slice(0, 200))

// 7) build
let bd = await rq('POST', `/libraries/${LIB}/builds`, {})
if (![200, 201].includes(bd.status)) { console.log('build FAIL', bd.status, JSON.stringify(bd.j).slice(0, 400)); process.exit(1) }
const BUILD = bd.j.data.id
console.log('build started:', BUILD)
// poll
let status = 'pending'
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 4000))
  const b = await rq('GET', `/builds/${BUILD}`)
  status = b.j.data.attributes.status
  process.stdout.write(` ${status}`)
  if (status === 'succeeded' || status === 'failed') break
}
console.log('\nbuild status:', status)

// 8) embed url from environment
const e2 = await rq('GET', `/environments/${env.id}`)
const a = e2.j.data.attributes
const embed = `https://${a.library_path}${a.library_name}`
console.log('\nEMBED URL:', embed)
fs.writeFileSync(process.env.OUT_FILE, JSON.stringify({ PROP, LIB, env: env.id, build: BUILD, status, embed, library_path: a.library_path, library_name: a.library_name }, null, 2))
