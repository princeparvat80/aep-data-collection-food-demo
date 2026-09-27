// Phase 2: install ACDL, create 11 data elements + 13 rules (idempotent).
import fs from 'fs'
const TOKEN = fs.readFileSync(process.env.DC_TOKEN_FILE, 'utf8').trim()
const { DC_CLIENT_ID, ORG_ID } = process.env
const BASE = 'https://reactor.adobe.io'
const PROP = 'PR00054be9b3d6446e8d10f6e408021932'
const CORE_EXT = 'EXe70dc495803b44b5aad3668c87483192'
const ALLOY_EXT = 'EX21495dfd2b794d12b0fadf26c781ce01'
const ACDL_PKG = 'EP6e4c031a8b7640d7ac3fab013fa28b17'
const SCHEMA_ID = 'https://ns.adobe.com/aepsupport/schemas/7eea5989503ed61e205aa444ff7706dee2b4364afa2e0349'
const SCHEMA_VERSION = '1.1'
const D = {
  customCode: 'core::dataElements::custom-code',
  xdmObject: 'adobe-alloy::dataElements::xdm-object',
  sendEvent: 'adobe-alloy::actions::send-event',
  dlState: 'gcoe-adobe-client-data-layer::dataElements::datalayer-computed-state',
  dlPush: 'gcoe-adobe-client-data-layer::events::datalayer-push',
  acdlCfg: 'gcoe-adobe-client-data-layer::extensionConfiguration::config',
}
const H = { Authorization: `Bearer ${TOKEN}`, 'x-api-key': DC_CLIENT_ID, 'x-gw-ims-org-id': ORG_ID, Accept: 'application/vnd.api+json;revision=1', 'Content-Type': 'application/vnd.api+json' }
async function rq(m, u, b) { const r = await fetch(BASE + u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); let j; try { j = JSON.parse(t) } catch { j = { raw: t } } return { status: r.status, j } }

// 0) ensure ACDL extension
let exts = await rq('GET', `/properties/${PROP}/extensions?page[size]=50`)
let acdl = (exts.j.data || []).find((e) => e.attributes.name === 'gcoe-adobe-client-data-layer')
if (!acdl) {
  const rr = await rq('POST', `/properties/${PROP}/extensions`, { data: { type: 'extensions', attributes: { settings: JSON.stringify({ dataLayerName: 'adobeDataLayer' }), delegate_descriptor_id: D.acdlCfg }, relationships: { extension_package: { data: { type: 'extension_packages', id: ACDL_PKG } } } } })
  if (![200, 201].includes(rr.status)) { console.log('ACDL install FAIL', rr.status, JSON.stringify(rr.j).slice(0, 300)); process.exit(1) }
  acdl = rr.j.data
}
const ACDL_EXT = acdl.id
console.log('ACDL ext:', ACDL_EXT)

// existing data elements (idempotent)
let deList = (await rq('GET', `/properties/${PROP}/data_elements?page[size]=100`)).j.data || []
const deByName = {}; deList.forEach((d) => (deByName[d.attributes.name] = d.id))
async function makeDE(name, extId, delegate, settings) {
  if (deByName[name]) { console.log('  DE exists:', name); return deByName[name] }
  const rr = await rq('POST', `/properties/${PROP}/data_elements`, { data: { type: 'data_elements', attributes: { name, settings: JSON.stringify(settings), delegate_descriptor_id: delegate }, relationships: { extension: { data: { type: 'extensions', id: extId } } } } })
  if (![200, 201].includes(rr.status)) { console.log('  DE FAIL', name, rr.status, JSON.stringify(rr.j).slice(0, 300)); process.exit(1) }
  deByName[name] = rr.j.data.id; console.log('  DE ok:', name); return rr.j.data.id
}

console.log('Creating data elements...')
const acdlPaths = { 'Feastly - page name': 'page.name', 'Feastly - commerce': 'commerce', 'Feastly - product': 'product', 'Feastly - order': 'order', 'Feastly - food': 'food', 'Feastly - search': 'search', 'Feastly - rating': 'rating', 'Feastly - user': 'user' }
for (const [name, path] of Object.entries(acdlPaths)) await makeDE(name, ACDL_EXT, D.dlState, { path })

const productJS = "var order = _satellite.getVar('Feastly - order');\nif (order && order.items && order.items.length) return order.items.map(function(i){return {SKU:i.id,name:i.name,quantity:i.quantity,priceTotal:i.priceTotal}});\nvar p = _satellite.getVar('Feastly - product');\nif (p && p.id) return [{SKU:p.id,name:p.name,quantity:p.quantity,priceTotal:p.priceTotal}];\nreturn [];"
await makeDE('Feastly - productListItems', CORE_EXT, D.customCode, { source: productJS})
const idJS = "var u = _satellite.getVar('Feastly - user') || {};\nvar map = {};\nif (u.email) { map.Email = [{ id: u.email, primary: true, authenticatedState: 'authenticated' }]; }\nreturn map;"
await makeDE('Feastly - identityMap', CORE_EXT, D.customCode, { source: idJS})

const xdmData = {
  web: { webPageDetails: { name: '%Feastly - page name%' } },
  commerce: '%Feastly - commerce%',
  productListItems: '%Feastly - productListItems%',
  identityMap: '%Feastly - identityMap%',
  _aepsupport: { food: '%Feastly - food%', attributes: '%Feastly - user%', rating: '%Feastly - rating%' },
}
await makeDE('Feastly - XDM', ALLOY_EXT, D.xdmObject, { schema: { id: SCHEMA_ID, version: SCHEMA_VERSION }, sandbox: { name: process.env.SANDBOX }, data: xdmData })

// Rules
let ruleList = (await rq('GET', `/properties/${PROP}/rules?page[size]=100`)).j.data || []
const ruleByName = {}; ruleList.forEach((r) => (ruleByName[r.attributes.name] = r.id))
const rules = [
  ['Feastly - Page View', 'pageView', 'web.webpagedetails.pageViews'],
  ['Feastly - View Menu', 'viewMenu', 'web.webpagedetails.pageViews'],
  ['Feastly - Search', 'search', 'commerce.productListViews'],
  ['Feastly - Dish View', 'dishView', 'commerce.productViews'],
  ['Feastly - Add To Cart', 'addToCart', 'commerce.productListAdds'],
  ['Feastly - Remove From Cart', 'removeFromCart', 'commerce.productListRemovals'],
  ['Feastly - Checkout', 'checkout', 'commerce.checkouts'],
  ['Feastly - Purchase', 'purchase', 'commerce.purchases'],
  ['Feastly - Order Rating', 'orderRating', 'web.webinteraction.linkClicks'],
  ['Feastly - Login', 'login', 'web.webinteraction.linkClicks'],
  ['Feastly - Signup', 'signup', 'web.webinteraction.linkClicks'],
  ['Feastly - Profile Update', 'profileUpdate', 'web.webinteraction.linkClicks'],
  ['Feastly - Newsletter', 'newsletterSignup', 'web.webinteraction.linkClicks'],
]
console.log('Creating rules...')
for (const [name, key, eventType] of rules) {
  let ruleId = ruleByName[name]
  if (!ruleId) {
    const rr = await rq('POST', `/properties/${PROP}/rules`, { data: { type: 'rules', attributes: { name } } })
    if (![200, 201].includes(rr.status)) { console.log('  rule FAIL', name, rr.status, JSON.stringify(rr.j).slice(0, 250)); process.exit(1) }
    ruleId = rr.j.data.id
    // event component
    const ev = await rq('POST', `/properties/${PROP}/rule_components`, { data: { type: 'rule_components', attributes: { name: `Data Layer - ${key}`, order: 0, delegate_descriptor_id: D.dlPush, settings: JSON.stringify({ scope: 'all', method: 'specificEvent', eventKey: key }) }, relationships: { extension: { data: { type: 'extensions', id: ACDL_EXT } }, rules: { data: [{ type: 'rules', id: ruleId }] } } } })
    if (![200, 201].includes(ev.status)) { console.log('  event FAIL', name, ev.status, JSON.stringify(ev.j).slice(0, 300)); process.exit(1) }
    // action component
    const ac = await rq('POST', `/properties/${PROP}/rule_components`, { data: { type: 'rule_components', attributes: { name: 'Send event', order: 1, delegate_descriptor_id: D.sendEvent, settings: JSON.stringify({ instanceName: 'alloy', xdm: '%Feastly - XDM%', type: eventType }) }, relationships: { extension: { data: { type: 'extensions', id: ALLOY_EXT } }, rules: { data: [{ type: 'rules', id: ruleId }] } } } })
    if (![200, 201].includes(ac.status)) { console.log('  action FAIL', name, ac.status, JSON.stringify(ac.j).slice(0, 300)); process.exit(1) }
    console.log('  rule ok:', name)
  } else console.log('  rule exists:', name)
  ruleByName[name] = ruleId
}
fs.writeFileSync(process.env.STATE2_FILE, JSON.stringify({ PROP, ACDL_EXT, deByName, ruleByName }, null, 2))
console.log('\nDONE. data elements:', Object.keys(deByName).length, '| rules:', Object.keys(ruleByName).length)
