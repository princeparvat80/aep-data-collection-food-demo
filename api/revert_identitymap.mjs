// Revert identityMap DE to Email-only (ECID left to the Edge), revise, relink, rebuild.
import fs from 'fs'
const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const BASE = 'https://reactor.adobe.io'
const PROP = 'PR00054be9b3d6446e8d10f6e408021932'
const LIB = 'LBe47bd06aeae1408daf4adde56446cd91'
const ENV = 'EN4344fff38c5741f98299de468ac12527'
const H = { Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID, Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json' }
async function rq(m, u, b) { const r = await fetch(u.startsWith('http') ? u : BASE + u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } } return { status: r.status, j } }
async function all(p) { let o = [], n = 1; while (true) { const r = await rq('GET', `${p}${p.includes('?') ? '&' : '?'}page[size]=100&page[number]=${n}`); const d = r.j.data || []; o = o.concat(d); if (d.length < 100) break; n++ } return o }
async function latestRev(type, id) { await rq('PATCH', `/${type}/${id}`, { data: { type, id, meta: { action: 'revise' } } }); const rr = await rq('GET', `/${type}/${id}/revisions?page[size]=100`); const revs = (rr.j.data || []).filter((x) => x.attributes.revision_number > 0).sort((a, b) => b.attributes.revision_number - a.attributes.revision_number); return revs[0] ? revs[0].id : id }

const des = await all(`/properties/${PROP}/data_elements`)
const de = des.find((d) => d.attributes.name === 'Feastly - identityMap')
const safeSource = "var u = _satellite.getVar('Feastly - user') || {};\nvar map = {};\n// ECID is managed automatically by the Web SDK / Edge Network — do NOT set it here.\nif (u.email) map.Email = [{ id: u.email, primary: true, authenticatedState: 'authenticated' }];\nreturn map;"
let r = await rq('PATCH', `/data_elements/${de.id}`, { data: { type: 'data_elements', id: de.id, attributes: { settings: JSON.stringify({ source: safeSource }) } } })
console.log('PATCH identityMap -> Email-only:', r.status)

// rebuild with latest revisions
const extensions = await all(`/properties/${PROP}/extensions`)
const dataElements = await all(`/properties/${PROP}/data_elements`)
const rules = await all(`/properties/${PROP}/rules`)
const extRev = []; for (const e of extensions) extRev.push(await latestRev('extensions', e.id))
const deRev = []; for (const e of dataElements) deRev.push(await latestRev('data_elements', e.id))
const ruleRev = []; for (const e of rules) ruleRev.push(await latestRev('rules', e.id))
async function setRel(rel, ids) { const rr = await rq('PATCH', `/libraries/${LIB}/relationships/${rel}`, { data: ids.map((id) => ({ type: rel, id })) }); console.log(`  set ${rel}:`, rr.status) }
await setRel('extensions', extRev); await setRel('data_elements', deRev); await setRel('rules', ruleRev)
const bd = await rq('POST', `/libraries/${LIB}/builds`, {})
const BUILD = bd.j.data.id; console.log('build:', BUILD)
let status = 'pending'; for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 4000)); const b = await rq('GET', `/builds/${BUILD}`); status = b.j.data.attributes.status; process.stdout.write(' ' + status); if (status === 'succeeded' || status === 'failed') break }
console.log('\nstatus:', status)
