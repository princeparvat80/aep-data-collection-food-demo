// Phase 1 (idempotent): find/create property, install & configure extensions,
// and capture delegate descriptor IDs for the next phases.
import fs from 'fs'

const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const COMPANY = 'CO3fbcffe0934b41c28555bf865750d8cf'
const DATASTREAM = '5a439dcd-2363-46fb-a17d-bbceb3cb9f54'
const BASE = 'https://reactor.adobe.io'
const H = {
  Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID,
  Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json',
}
async function rq(method, url, body) {
  const r = await fetch(url.startsWith('http') ? url : BASE + url, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
  const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } }
  return { status: r.status, j }
}

// 1) Find or create property
let r = await rq('GET', `/companies/${COMPANY}/properties?filter[name]=EQ ${encodeURIComponent('Feastly Web')}&page[size]=20`)
let prop = (r.j.data || []).find((p) => p.attributes.name === 'Feastly Web')
if (!prop) {
  r = await rq('POST', `/companies/${COMPANY}/properties`, { data: { type: 'properties', attributes: { name: 'Feastly Web', platform: 'web', domains: ['feastly.example.com'], development: false } } })
  prop = r.j.data
}
const PROP = prop.id
console.log('property:', PROP)

async function pkg(name) {
  const rr = await rq('GET', `/extension_packages?filter[name]=EQ ${encodeURIComponent(name)}&page[size]=25`)
  const list = (rr.j.data || []).filter((p) => p.attributes.name === name)
  list.sort((a, b) => (a.attributes.version < b.attributes.version ? 1 : -1))
  return list[0]
}
const alloyPkg = await pkg('adobe-alloy')
const acdlPkg = await pkg('gcoe-adobe-client-data-layer')
const CORE_CFG = 'core::extensionConfiguration::config'

// 2) Installed extensions (core auto-installed)
let exts = await rq('GET', `/properties/${PROP}/extensions?page[size]=50`)
const findExt = (n) => (exts.j.data || []).find((e) => e.attributes.name === n)
async function ensureExt(name, packageObj, settings, delegateId) {
  const existing = findExt(name)
  if (existing) return existing
  const attrs = {}
  if (settings) { attrs.settings = JSON.stringify(settings); attrs.delegate_descriptor_id = delegateId }
  const rr = await rq('POST', `/properties/${PROP}/extensions`, {
    data: { type: 'extensions', attributes: attrs, relationships: { extension_package: { data: { type: 'extension_packages', id: packageObj.id } } } },
  })
  if (![200, 201].includes(rr.status)) { console.log('  install', name, 'FAIL', rr.status, JSON.stringify(rr.j).slice(0, 350)); return null }
  return rr.j.data
}
const coreExt = findExt('core')
const alloyExt = await ensureExt('adobe-alloy', alloyPkg, { instances: [{ name: 'alloy', edgeConfigId: DATASTREAM, orgId: ORG_ID }] }, 'adobe-alloy::extensionConfiguration::config')
const acdlExt = await ensureExt('gcoe-adobe-client-data-layer', acdlPkg, undefined, undefined)
console.log('extensions -> core:', coreExt && coreExt.id, '| alloy:', alloyExt && alloyExt.id, '| acdl:', acdlExt && acdlExt.id)

// 3) Delegate descriptors from packages
async function pkgById(id) { const rr = await rq('GET', `/extension_packages/${id}`); return rr.j.data }
const corePkg = await pkgById(coreExt.relationships.extension_package.data.id)
function pick(p, kind, re) { return (p.attributes[kind] || []).filter((d) => re.test(d.display_name || '')).map((d) => ({ id: d.id, name: d.display_name })) }

const state = {
  PROP, COMPANY, DATASTREAM,
  ext: { core: coreExt.id, alloy: alloyExt && alloyExt.id, acdl: acdlExt && acdlExt.id },
  delegate: {
    customCode: pick(corePkg, 'data_elements', /custom code/i)[0],
    xdmObject: pick(alloyPkg, 'data_elements', /xdm object/i)[0],
    sendEvent: pick(alloyPkg, 'actions', /send event/i)[0],
    dlComputedState: pick(acdlPkg, 'data_elements', /computed state/i)[0],
    dataPushed: pick(acdlPkg, 'events', /pushed/i)[0],
  },
}
fs.writeFileSync(process.env.STATE_FILE, JSON.stringify(state, null, 2))
console.log('\nDelegates:'); console.log(JSON.stringify(state.delegate, null, 2))
