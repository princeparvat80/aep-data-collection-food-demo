// Phase 4: efficiency + coverage improvements, then rebuild.
//  - disable ActivityMap clickCollection on the Web SDK extension
//  - add ECID (from identity cookie) to the identityMap data element
//  - give login/signup/profileUpdate/newsletter distinct eventTypes
//  - add a cartView rule (commerce.productListOpens)
import fs from 'fs'
const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const BASE = 'https://reactor.adobe.io'
const PROP = 'PR00054be9b3d6446e8d10f6e408021932'
const ALLOY_EXT = 'EX21495dfd2b794d12b0fadf26c781ce01'
const ACDL_EXT = 'EX68f377ef82ce4fdd8dff516e9290d5c4'
const LIB = 'LBe47bd06aeae1408daf4adde56446cd91'
const ENV = 'EN4344fff38c5741f98299de468ac12527'
const DATASTREAM = '5a439dcd-2363-46fb-a17d-bbceb3cb9f54'
const D = { sendEvent: 'adobe-alloy::actions::send-event', dlPush: 'gcoe-adobe-client-data-layer::events::datalayer-push', alloyCfg: 'adobe-alloy::extensionConfiguration::config' }
const H = { Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID, Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json' }
async function rq(m, u, b) { const r = await fetch(u.startsWith('http') ? u : BASE + u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } } return { status: r.status, j } }
async function all(p) { let o = [], n = 1; while (true) { const r = await rq('GET', `${p}${p.includes('?') ? '&' : '?'}page[size]=100&page[number]=${n}`); const d = r.j.data || []; o = o.concat(d); if (d.length < 100) break; n++ } return o }

// 1) disable clickCollection on Web SDK
let r = await rq('PATCH', `/extensions/${ALLOY_EXT}`, { data: { type: 'extensions', id: ALLOY_EXT, attributes: { settings: JSON.stringify({ instances: [{ name: 'alloy', edgeConfigId: DATASTREAM, orgId: ORG_ID, clickCollectionEnabled: false }] }), delegate_descriptor_id: D.alloyCfg } } })
console.log('1) disable clickCollection:', r.status)

// 2) identityMap DE: add ECID
const des = await all(`/properties/${PROP}/data_elements`)
const idmapDE = des.find((d) => d.attributes.name === 'Feastly - identityMap')
const idSource = "var u = _satellite.getVar('Feastly - user') || {};\nvar map = {};\ntry {\n  var m = document.cookie.match(/kndctr_[^=]*_identity=([^;]+)/);\n  if (m) {\n    var dec = atob(m[1].replace(/-/g,'+').replace(/_/g,'/'));\n    var e = dec.match(/[0-9]{38}/);\n    if (e) map.ECID = [{ id: e[0], primary: !u.email, authenticatedState: 'ambiguous' }];\n  }\n} catch (x) {}\nif (u.email) map.Email = [{ id: u.email, primary: true, authenticatedState: 'authenticated' }];\nreturn map;"
r = await rq('PATCH', `/data_elements/${idmapDE.id}`, { data: { type: 'data_elements', id: idmapDE.id, attributes: { settings: JSON.stringify({ source: idSource }) } } })
console.log('2) identityMap DE + ECID:', r.status)

// 3) distinct eventTypes on 4 rules' action components
const rules = await all(`/properties/${PROP}/rules`)
const typeMap = { 'Feastly - Login': 'userAccount.login', 'Feastly - Signup': 'userAccount.signup', 'Feastly - Profile Update': 'userAccount.profileUpdate', 'Feastly - Newsletter': 'userAccount.newsletterSignup' }
for (const [name, et] of Object.entries(typeMap)) {
  const rule = rules.find((x) => x.attributes.name === name); if (!rule) { console.log('  missing rule', name); continue }
  const comps = (await rq('GET', `/rules/${rule.id}/rule_components`)).j.data || []
  const action = comps.find((c) => c.attributes.delegate_descriptor_id === D.sendEvent)
  const rr = await rq('PATCH', `/rule_components/${action.id}`, { data: { type: 'rule_components', id: action.id, attributes: { settings: JSON.stringify({ instanceName: 'alloy', xdm: '%Feastly - XDM%', type: et }) } } })
  console.log(`   ${name} -> ${et}:`, rr.status)
}

// 4) cartView rule
if (!rules.find((x) => x.attributes.name === 'Feastly - Cart View')) {
  const cr = await rq('POST', `/properties/${PROP}/rules`, { data: { type: 'rules', attributes: { name: 'Feastly - Cart View' } } })
  const rid = cr.j.data.id
  await rq('POST', `/properties/${PROP}/rule_components`, { data: { type: 'rule_components', attributes: { name: 'Data Layer - cartView', order: 0, delegate_descriptor_id: D.dlPush, settings: JSON.stringify({ scope: 'all', method: 'specificEvent', eventKey: 'cartView' }) }, relationships: { rules: { data: [{ type: 'rules', id: rid }] }, extension: { data: { type: 'extensions', id: ACDL_EXT } } } } })
  await rq('POST', `/properties/${PROP}/rule_components`, { data: { type: 'rule_components', attributes: { name: 'Send event', order: 1, delegate_descriptor_id: D.sendEvent, settings: JSON.stringify({ instanceName: 'alloy', xdm: '%Feastly - XDM%', type: 'commerce.productListOpens' }) }, relationships: { rules: { data: [{ type: 'rules', id: rid }] }, extension: { data: { type: 'extensions', id: ALLOY_EXT } } } } })
  console.log('4) cartView rule created:', rid)
} else console.log('4) cartView rule exists')

// 5) revise everything + rebuild
async function latestRev(type, id) { await rq('PATCH', `/${type}/${id}`, { data: { type, id, meta: { action: 'revise' } } }); const rr = await rq('GET', `/${type}/${id}/revisions?page[size]=100`); const revs = (rr.j.data || []).filter((x) => x.attributes.revision_number > 0).sort((a, b) => b.attributes.revision_number - a.attributes.revision_number); return revs[0] ? revs[0].id : id }
const extensions = await all(`/properties/${PROP}/extensions`)
const dataElements = await all(`/properties/${PROP}/data_elements`)
const rules2 = await all(`/properties/${PROP}/rules`)
console.log('revising all...')
const extRev = []; for (const e of extensions) extRev.push(await latestRev('extensions', e.id))
const deRev = []; for (const e of dataElements) deRev.push(await latestRev('data_elements', e.id))
const ruleRev = []; for (const e of rules2) ruleRev.push(await latestRev('rules', e.id))
async function addRel(rel, ids) { const rr = await rq('POST', `/libraries/${LIB}/relationships/${rel}`, { data: ids.map((id) => ({ type: rel, id })) }); console.log(`  add ${rel}:`, rr.status) }
await addRel('extensions', extRev); await addRel('data_elements', deRev); await addRel('rules', ruleRev)
const bd = await rq('POST', `/libraries/${LIB}/builds`, {})
const BUILD = bd.j.data.id; console.log('build:', BUILD)
let status = 'pending'; for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 4000)); const b = await rq('GET', `/builds/${BUILD}`); status = b.j.data.attributes.status; process.stdout.write(' ' + status); if (status === 'succeeded' || status === 'failed') break }
console.log('\nstatus:', status)
