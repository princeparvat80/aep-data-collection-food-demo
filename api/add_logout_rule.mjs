// Add a "Feastly - Logout" rule (event logout -> send-event userAccount.logout), rebuild.
import fs from 'fs'
const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const BASE = 'https://reactor.adobe.io'
const PROP = 'PR00054be9b3d6446e8d10f6e408021932'
const ALLOY_EXT = 'EX21495dfd2b794d12b0fadf26c781ce01'
const ACDL_EXT = 'EX68f377ef82ce4fdd8dff516e9290d5c4'
const LIB = 'LBe47bd06aeae1408daf4adde56446cd91'
const ENV = 'EN4344fff38c5741f98299de468ac12527'
const D = { sendEvent: 'adobe-alloy::actions::send-event', dlPush: 'gcoe-adobe-client-data-layer::events::datalayer-push' }
const H = { Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID, Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json' }
async function rq(m, u, b) { const r = await fetch(u.startsWith('http') ? u : BASE + u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } } return { status: r.status, j } }
async function all(p) { let o = [], n = 1; while (true) { const r = await rq('GET', `${p}${p.includes('?') ? '&' : '?'}page[size]=100&page[number]=${n}`); const d = r.j.data || []; o = o.concat(d); if (d.length < 100) break; n++ } return o }
async function latestRev(type, id) { await rq('PATCH', `/${type}/${id}`, { data: { type, id, meta: { action: 'revise' } } }); const rr = await rq('GET', `/${type}/${id}/revisions?page[size]=100`); const revs = (rr.j.data || []).filter((x) => x.attributes.revision_number > 0).sort((a, b) => b.attributes.revision_number - a.attributes.revision_number); return revs[0] ? revs[0].id : id }

const rules = await all(`/properties/${PROP}/rules`)
if (!rules.find((r) => r.attributes.name === 'Feastly - Logout')) {
  const cr = await rq('POST', `/properties/${PROP}/rules`, { data: { type: 'rules', attributes: { name: 'Feastly - Logout' } } })
  const rid = cr.j.data.id
  await rq('POST', `/properties/${PROP}/rule_components`, { data: { type: 'rule_components', attributes: { name: 'Data Layer - logout', order: 0, delegate_descriptor_id: D.dlPush, settings: JSON.stringify({ scope: 'all', method: 'specificEvent', eventKey: 'logout' }) }, relationships: { rules: { data: [{ type: 'rules', id: rid }] }, extension: { data: { type: 'extensions', id: ACDL_EXT } } } } })
  await rq('POST', `/properties/${PROP}/rule_components`, { data: { type: 'rule_components', attributes: { name: 'Send event', order: 1, delegate_descriptor_id: D.sendEvent, settings: JSON.stringify({ instanceName: 'alloy', xdm: '%Feastly - XDM%', type: 'userAccount.logout' }) }, relationships: { rules: { data: [{ type: 'rules', id: rid }] }, extension: { data: { type: 'extensions', id: ALLOY_EXT } } } } })
  console.log('Logout rule created:', rid)
} else console.log('Logout rule already exists')

// rebuild with latest revisions
const extensions = await all(`/properties/${PROP}/extensions`)
const dataElements = await all(`/properties/${PROP}/data_elements`)
const rules2 = await all(`/properties/${PROP}/rules`)
const extRev = []; for (const e of extensions) extRev.push(await latestRev('extensions', e.id))
const deRev = []; for (const e of dataElements) deRev.push(await latestRev('data_elements', e.id))
const ruleRev = []; for (const e of rules2) ruleRev.push(await latestRev('rules', e.id))
async function setRel(rel, ids) { const rr = await rq('PATCH', `/libraries/${LIB}/relationships/${rel}`, { data: ids.map((id) => ({ type: rel, id })) }); console.log(`  set ${rel}:`, rr.status) }
await setRel('extensions', extRev); await setRel('data_elements', deRev); await setRel('rules', ruleRev)
const bd = await rq('POST', `/libraries/${LIB}/builds`, {})
const BUILD = bd.j.data.id; console.log('build:', BUILD)
let status = 'pending'; for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 4000)); const b = await rq('GET', `/builds/${BUILD}`); status = b.j.data.attributes.status; process.stdout.write(' ' + status); if (status === 'succeeded' || status === 'failed') break }
console.log('\nstatus:', status, '| total rules now:', rules2.length)
