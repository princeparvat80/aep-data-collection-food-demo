// Creates the Feastly schema stack via the AEP Schema Registry + Catalog APIs.
// Token read from a file (never committed); config from env.
import fs from 'fs'

const TOKEN = fs.readFileSync(process.env.AEP_TOKEN_FILE, 'utf8').trim()
const { AEP_CLIENT_ID, ORG_ID, SANDBOX } = process.env
const SR = 'https://platform.adobe.io/data/foundation/schemaregistry'
const CAT = 'https://platform.adobe.io/data/foundation/catalog'

const H = (accept = 'application/vnd.adobe.xed+json; version=1') => ({
  Authorization: `Bearer ${TOKEN}`,
  'x-api-key': AEP_CLIENT_ID,
  'x-gw-ims-org-id': ORG_ID,
  'x-sandbox-name': SANDBOX,
  'Content-Type': 'application/json',
  Accept: accept,
})

async function req(method, url, body, accept) {
  const r = await fetch(url, { method, headers: H(accept), body: body ? JSON.stringify(body) : undefined })
  const t = await r.text()
  let j; try { j = JSON.parse(t) } catch { j = { raw: t } }
  return { status: r.status, j }
}

const CLASS = 'https://ns.adobe.com/xdm/context/experienceevent'
const WEBSDK = 'https://ns.adobe.com/experience/aep-web-sdk-experienceevent'
const COMMERCE = 'https://ns.adobe.com/xdm/context/experienceevent-commerce'

// 1) Custom field group -------------------------------------------------------
const fieldGroup = {
  type: 'object',
  title: 'Feastly Details',
  description: 'Feastly custom event fields (food, profile attributes, rating).',
  'meta:intendedToExtend': [CLASS],
  allOf: [{
    properties: {
      _aepsupport: {
        type: 'object',
        properties: {
          food: { type: 'object', properties: {
            category: { type: 'string', title: 'Food Category' },
            cuisine: { type: 'string', title: 'Cuisine' },
            veg: { type: 'boolean', title: 'Is Vegetarian' },
            spiceLevel: { type: 'string', title: 'Spice Level' },
          } },
          attributes: { type: 'object', properties: {
            loyaltyTier: { type: 'string', title: 'Loyalty Tier' },
            dietaryPreference: { type: 'string', title: 'Dietary Preference' },
            favoriteCuisine: { type: 'string', title: 'Favorite Cuisine' },
            city: { type: 'string', title: 'City' },
            marketingConsent: { type: 'boolean', title: 'Marketing Consent' },
            firstName: { type: 'string', title: 'First Name' },
            visitorType: { type: 'string', title: 'Visitor Type' },
          } },
          rating: { type: 'object', properties: {
            orderId: { type: 'string', title: 'Order ID' },
            stars: { type: 'integer', title: 'Stars' },
            comment: { type: 'string', title: 'Comment' },
          } },
        },
      },
    },
  }],
}

console.log('1) Creating field group "Feastly Details"...')
let r = await req('POST', `${SR}/tenant/fieldgroups`, fieldGroup)
if (r.status !== 201 && r.status !== 200) { console.log('  FAIL', r.status, JSON.stringify(r.j).slice(0, 400)); process.exit(1) }
const FG_ID = r.j.$id
console.log('  OK ->', FG_ID)

// 2) Schema -------------------------------------------------------------------
const schema = {
  type: 'object',
  title: 'Feastly Order Event',
  description: 'Feastly experience events (web + commerce + custom) for the Data Collection -> AEP demo.',
  'meta:class': CLASS,
  allOf: [
    { $ref: CLASS },
    { $ref: WEBSDK },
    { $ref: COMMERCE },
    { $ref: FG_ID },
  ],
}
console.log('2) Creating schema "Feastly Order Event"...')
r = await req('POST', `${SR}/tenant/schemas`, schema)
if (r.status !== 201 && r.status !== 200) { console.log('  FAIL', r.status, JSON.stringify(r.j).slice(0, 500)); process.exit(1) }
const SCHEMA_ID = r.j.$id
const SCHEMA_ALT = r.j['meta:altId']
console.log('  OK ->', SCHEMA_ID)

// 3) Enable schema for Profile (union) ---------------------------------------
console.log('3) Enabling schema for Profile (union)...')
r = await req('PATCH', `${SR}/tenant/schemas/${encodeURIComponent(SCHEMA_ALT)}`,
  [{ op: 'add', path: '/meta:immutableTags', value: ['union'] }])
console.log('  status', r.status, r.status < 300 ? 'OK' : JSON.stringify(r.j).slice(0, 300))

// 4) Dataset (Profile-enabled) -----------------------------------------------
console.log('4) Creating dataset "Feastly Order Event Dataset" (Profile-enabled)...')
const dataset = {
  name: 'Feastly Order Event Dataset',
  schemaRef: { id: SCHEMA_ID, contentType: 'application/vnd.adobe.xed-full+json;version=1' },
  tags: { unifiedProfile: ['enabled:true'] },
}
r = await req('POST', `${CAT}/dataSets`, dataset, 'application/json')
if (r.status !== 201 && r.status !== 200) { console.log('  FAIL', r.status, JSON.stringify(r.j).slice(0, 400)); process.exit(1) }
const DS_ID = Array.isArray(r.j) ? r.j[0].split('/').pop() : (r.j['@/dataSets'] || JSON.stringify(r.j))
console.log('  OK -> dataset:', DS_ID)

// Save the ids for later steps (datastream)
fs.writeFileSync(process.env.OUT_FILE, JSON.stringify({ FG_ID, SCHEMA_ID, SCHEMA_ALT, DATASET_ID: DS_ID }, null, 2))
console.log('\nSaved ids to', process.env.OUT_FILE)
console.log(JSON.stringify({ SCHEMA_ID, SCHEMA_ALT, DATASET_ID: DS_ID }, null, 2))
