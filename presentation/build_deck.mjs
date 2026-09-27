import pptxgen from 'pptxgenjs'

const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE' // 13.33 x 7.5
pres.author = 'Feastly Demo'
pres.title = 'Feastly — Data Collection to AEP'

// ---- palette (no #) ----
const INK = '2B2320'
const CORAL = 'FF5722'
const CORAL_DK = 'E64A19'
const GOLD = 'FFB300'
const WHITE = 'FFFFFF'
const MUTED = '7D726C'
const LINE = 'E7DED8'
const GREEN = '2E7D32'
const SOFT = 'FFF3EE' // soft coral tint for cards
const HF = 'Cambria'   // header font (safe)
const BF = 'Calibri'   // body font (safe)

const W = 13.33, H = 7.5, M = 0.6

// screenshot placeholder box
function shot(slide, x, y, w, h, label) {
  slide.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: 'F4EEEA' }, line: { color: CORAL, width: 1.25, dashType: 'dash' } })
  slide.addText([
    { text: '📸  ', options: { fontSize: 20 } },
    { text: 'SCREENSHOT', options: { fontSize: 13, bold: true, color: CORAL_DK } },
  ], { x, y: y + h / 2 - 0.6, w, h: 0.4, align: 'center', isTextBox: true, margin: 0 })
  slide.addText(label, { x: x + 0.3, y: y + h / 2 - 0.1, w: w - 0.6, h: 0.7, align: 'center', fontSize: 12, italic: true, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
}

// circled step/number badge
function badge(slide, x, y, txt, d = 0.55, bg = CORAL, fg = WHITE) {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: bg } })
  slide.addText(String(txt), { x, y, w: d, h: d, align: 'center', valign: 'middle', fontSize: d > 0.5 ? 18 : 14, bold: true, color: fg, fontFace: BF, isTextBox: true, margin: 0 })
}

function titleBar(slide, kicker, title) {
  slide.addText(kicker.toUpperCase(), { x: M, y: 0.5, w: W - 2 * M, h: 0.3, fontSize: 12.5, bold: true, color: CORAL, charSpacing: 2, fontFace: BF, isTextBox: true, margin: 0 })
  slide.addText(title, { x: M, y: 0.8, w: W - 2 * M, h: 0.8, fontSize: 32, bold: true, color: INK, fontFace: HF, isTextBox: true, margin: 0 })
}

// ---------------------------------------------------------------- Slide 1: Title
let s = pres.addSlide()
s.background = { color: INK }
s.addShape(pres.ShapeType.ellipse, { x: 10.7, y: -1.4, w: 4.2, h: 4.2, fill: { color: CORAL }, line: { color: CORAL } })
s.addShape(pres.ShapeType.ellipse, { x: 11.9, y: 4.7, w: 3.0, h: 3.0, fill: { color: GOLD }, line: { color: GOLD } })
s.addText('🍔', { x: M, y: 1.5, w: 2, h: 1.2, fontSize: 64, isTextBox: true, margin: 0 })
s.addText('Feastly', { x: M, y: 2.7, w: 9, h: 0.9, fontSize: 30, bold: true, color: GOLD, fontFace: HF, isTextBox: true, margin: 0 })
s.addText('Understanding Data Collection → AEP', { x: M, y: 3.4, w: 10.5, h: 1.2, fontSize: 44, bold: true, color: WHITE, fontFace: HF, isTextBox: true, margin: 0 })
s.addText('How a website sends streaming events, profile attributes and identity into Adobe Experience Platform — the simple, standard way.', { x: M, y: 4.8, w: 9.5, h: 0.9, fontSize: 16, color: 'CADCFC', fontFace: BF, isTextBox: true, margin: 0 })
s.addText('A hands-on demo for the AEP Support team', { x: M, y: 6.5, w: 9, h: 0.4, fontSize: 13, italic: true, color: 'A89B94', fontFace: BF, isTextBox: true, margin: 0 })
s.addNotes('Intro: Feastly is a fake food-ordering site we built purely to show how the Data Collection side works and how data arrives in AEP. Our team lives in AEP; today we look one step upstream.')

// ---------------------------------------------------------------- Slide 2: Why
s = pres.addSlide(); s.background = { color: WHITE }
titleBar(s, 'Why this session', 'We know AEP. Today we look one step upstream.')
const why = [
  ['🎯', 'The goal', 'See how website data is collected and shaped before it ever reaches AEP.'],
  ['🧩', 'The gap', 'Support lives in AEP, but most "data is missing" issues start in Data Collection.'],
  ['🛠️', 'The payoff', 'Know where to look — data layer, rules, data elements, datastream — when data is wrong or absent.'],
]
why.forEach((r, i) => {
  const y = 1.9 + i * 1.55
  s.addShape(pres.ShapeType.roundRect, { x: M, y, w: W - 2 * M, h: 1.35, rectRadius: 0.08, fill: { color: SOFT }, line: { type: 'none' } })
  s.addShape(pres.ShapeType.ellipse, { x: M + 0.3, y: y + 0.33, w: 0.7, h: 0.7, fill: { color: CORAL } })
  s.addText(r[0], { x: M + 0.3, y: y + 0.33, w: 0.7, h: 0.7, align: 'center', valign: 'middle', fontSize: 22, isTextBox: true, margin: 0 })
  s.addText(r[1], { x: M + 1.3, y: y + 0.2, w: 3.2, h: 0.9, fontSize: 20, bold: true, color: INK, valign: 'middle', fontFace: HF, isTextBox: true, margin: 0 })
  s.addText(r[2], { x: M + 4.6, y: y + 0.2, w: W - 2 * M - 5.0, h: 0.95, fontSize: 15, color: MUTED, valign: 'middle', fontFace: BF, isTextBox: true, margin: 0 })
})
s.addNotes('Frame it as: you already debug AEP; this gives you the vocabulary and the map of the collection side so you can triage faster.')

// ---------------------------------------------------------------- Slide 3: Big picture flow
s = pres.addSlide(); s.background = { color: WHITE }
titleBar(s, 'The big picture', 'From a click to a profile in AEP')
const steps = [
  ['Website', 'User clicks / views', '🖥️'],
  ['Data Layer', 'adobeDataLayer.push', '📦'],
  ['Tags (Launch)', 'Rules + Data Elements', '🏷️'],
  ['Web SDK', 'sendEvent (XDM)', '📡'],
  ['Datastream', 'Edge routing', '🔀'],
  ['AEP', 'Events + Profile', '☁️'],
]
const bw = 1.9, gap = 0.19, by = 2.6, bh = 1.7
const totalW = steps.length * bw + (steps.length - 1) * gap
let bx = (W - totalW) / 2
steps.forEach((st, i) => {
  const fill = i === steps.length - 1 ? CORAL : INK
  s.addShape(pres.ShapeType.roundRect, { x: bx, y: by, w: bw, h: bh, rectRadius: 0.1, fill: { color: fill }, line: { type: 'none' } })
  s.addText(st[2], { x: bx, y: by + 0.18, w: bw, h: 0.6, align: 'center', fontSize: 26, isTextBox: true, margin: 0 })
  s.addText(st[0], { x: bx, y: by + 0.78, w: bw, h: 0.4, align: 'center', fontSize: 15, bold: true, color: WHITE, fontFace: BF, isTextBox: true, margin: 0 })
  s.addText(st[1], { x: bx + 0.1, y: by + 1.16, w: bw - 0.2, h: 0.5, align: 'center', fontSize: 10.5, color: 'D9CFC9', fontFace: BF, isTextBox: true, margin: 0 })
  if (i < steps.length - 1) s.addText('▸', { x: bx + bw - 0.02, y: by + bh / 2 - 0.25, w: gap + 0.04, h: 0.5, align: 'center', valign: 'middle', fontSize: 16, bold: true, color: CORAL, isTextBox: true, margin: 0 })
  bx += bw + gap
})
s.addText('The website only writes to the data layer. Everything downstream is configured in Adobe — no code changes to add or fix tracking.', { x: M, y: 4.9, w: W - 2 * M, h: 0.6, align: 'center', fontSize: 15, italic: true, color: INK, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('This is the single most important slide — keep coming back to it.', { x: M, y: 6.7, w: W - 2 * M, h: 0.3, align: 'center', fontSize: 11, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
s.addNotes('Walk left to right. Emphasise the decoupling: the site is dumb; Adobe is where the shaping and routing happen.')

// ---------------------------------------------------------------- Slide 4: Glossary
s = pres.addSlide(); s.background = { color: WHITE }
titleBar(s, 'Key concepts', 'The vocabulary in one place')
const terms = [
  ['Data Layer', 'A JS object (adobeDataLayer) the site pushes events into.'],
  ['Extension', 'A plug-in in Tags (e.g. Web SDK, Client Data Layer).'],
  ['Data Element', 'A reusable "variable" that reads a value (from the data layer).'],
  ['Rule', 'When X happens → do Y (e.g. on "purchase" → send event).'],
  ['Schema (XDM)', 'The agreed structure/shape of the data in AEP.'],
  ['Datastream', 'Server-side config that routes Edge data to AEP (and others).'],
  ['Identity', 'Who the user is — ECID (anon) + Email (known).'],
  ['Profile', 'The unified person in AEP: identities + attributes + events.'],
]
const cw = (W - 2 * M - 0.4) / 2
terms.forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2)
  const x = M + col * (cw + 0.4), y = 1.85 + row * 1.18
  s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: 1.0, rectRadius: 0.07, fill: { color: WHITE }, line: { color: LINE, width: 1 } })
  s.addText(t[0], { x: x + 0.25, y: y + 0.13, w: cw - 0.5, h: 0.35, fontSize: 15, bold: true, color: CORAL_DK, fontFace: BF, isTextBox: true, margin: 0 })
  s.addText(t[1], { x: x + 0.25, y: y + 0.47, w: cw - 0.5, h: 0.45, fontSize: 12.5, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
})
s.addNotes('Do not linger — this is a reference slide. Tell people it maps to the flow: data layer -> data elements -> rules -> web sdk -> datastream -> schema/identity/profile.')

// -------------------------------------------------- reusable "component" slide with screenshot
function componentSlide(kicker, title, bullets, shotLabel) {
  const sl = pres.addSlide(); sl.background = { color: WHITE }
  titleBar(sl, kicker, title)
  bullets.forEach((b, i) => {
    const y = 1.95 + i * 0.92
    badge(sl, M, y, i + 1, 0.5)
    sl.addText(b[0], { x: M + 0.7, y: y - 0.04, w: 4.6, h: 0.4, fontSize: 15.5, bold: true, color: INK, fontFace: BF, isTextBox: true, margin: 0 })
    sl.addText(b[1], { x: M + 0.7, y: y + 0.32, w: 4.7, h: 0.55, fontSize: 12.5, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
  })
  shot(sl, 6.5, 1.85, W - M - 6.5, 4.9, shotLabel)
  return sl
}

// Slide 5: Schema
componentSlide('Component 1 · AEP', 'XDM Schema — the shape of the data',
  [['Class: ExperienceEvent', 'The type of record — a time-stamped event.'],
   ['Field groups', 'Web SDK EE + Commerce + custom "Feastly Details".'],
   ['Identity: Email', 'Marked as an identity so AEP can stitch people.'],
   ['Dataset → Profile', 'Enabled for Profile so events build real-time profiles.']],
  'Schema "Feastly Order Event" — show the field tree (_yourtenant.food / attributes / rating, commerce, identityMap).'
).addNotes('Schema = the contract. If a field is not in the schema, it will not land. Show the custom field group and the Email identity.')

// Slide 6: Datastream
componentSlide('Component 2 · Data Collection', 'Datastream — the routing switchboard',
  [['One datastream', '"Feastly Web SDK" — the server-side config.'],
   ['Adobe Experience Platform service', 'Added and pointed at the Feastly dataset.'],
   ['Datastream ID', 'The Web SDK sends to this ID at the Edge.'],
   ['Extensible', 'Same event can also go to Analytics, Target, etc.']],
  'Datastream "Feastly Web SDK" — show the AEP service added + the Datastream ID.'
).addNotes('The datastream is where data is routed server-side. Support tip: "data not in AEP" often = AEP service missing here, or wrong dataset.')

// Slide 7: Tag property + extensions
componentSlide('Component 3 · Data Collection', 'Tag (Launch) property + extensions',
  [['Property "Feastly Web"', 'The container for all collection logic.'],
   ['AEP Web SDK extension', 'Configured with the datastream + Org ID.'],
   ['Adobe Client Data Layer', 'Listens to adobeDataLayer pushes.'],
   ['Publish → embed', 'Build a library, embed the script on the site.']],
  'Tags property "Feastly Web" — show Extensions (Web SDK + Client Data Layer) installed.'
).addNotes('The property holds extensions, data elements and rules. The embed script is what the site loads (via our Adobe Config panel).')

// Slide 8: Data Elements
s = pres.addSlide(); s.background = { color: WHITE }
titleBar(s, 'The building blocks', 'Data Elements — reusable variables (11)')
s.addText('Each reads one value from the data layer, so rules stay simple and consistent.', { x: M, y: 1.55, w: W - 2 * M, h: 0.35, fontSize: 14, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
const de = ['page name', 'commerce', 'product', 'order', 'food', 'search', 'rating', 'user', 'productListItems*', 'identityMap*', 'Feastly - XDM**']
de.forEach((d, i) => {
  const col = i % 4, row = Math.floor(i / 4)
  const x = M + col * 3.05, y = 2.15 + row * 0.95
  s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.85, h: 0.75, rectRadius: 0.09, fill: { color: SOFT }, line: { type: 'none' } })
  s.addText(d, { x: x + 0.2, y, w: 2.5, h: 0.75, valign: 'middle', fontSize: 13.5, bold: true, color: INK, fontFace: BF, isTextBox: true, margin: 0 })
})
shot(s, M, 5.25, W - 2 * M, 1.55, 'Data Elements list in Tags — show the 11 "Feastly - ..." elements.')
s.addText('* Custom Code   ** XDM Object (builds the final payload)', { x: M, y: 5.0, w: W - 2 * M, h: 0.3, fontSize: 11, italic: true, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
s.addNotes('Analogy: data elements are like variables; rules are the functions that use them. 8 read the data layer, 2 are custom code (products array, identity), 1 assembles the XDM.')

// Slide 9: Rules
s = pres.addSlide(); s.background = { color: WHITE }
titleBar(s, 'The building blocks', 'Rules — one per event (13)')
s.addText('Each rule: WHEN a data-layer event fires → SEND the XDM event to the Edge.', { x: M, y: 1.55, w: W - 2 * M, h: 0.35, fontSize: 14, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
const rules = ['Page View', 'View Menu', 'Search', 'Dish View', 'Add To Cart', 'Remove From Cart', 'Checkout', 'Purchase', 'Order Rating', 'Login', 'Signup', 'Profile Update', 'Newsletter']
rules.forEach((r, i) => {
  const col = i % 4, row = Math.floor(i / 4)
  const x = M + col * 3.05, y = 2.15 + row * 0.7
  s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.85, h: 0.55, rectRadius: 0.08, fill: { color: WHITE }, line: { color: LINE, width: 1 } })
  badge(s, x + 0.12, y + 0.1, i + 1, 0.35, GOLD, INK)
  s.addText(r, { x: x + 0.58, y, w: 2.2, h: 0.55, valign: 'middle', fontSize: 12.5, bold: true, color: INK, fontFace: BF, isTextBox: true, margin: 0 })
})
shot(s, M, 5.15, W - 2 * M, 1.7, 'A single rule (e.g. "Feastly - Purchase") — show its Event (listen for "purchase") + Action (Send event, type commerce.purchases).')
s.addNotes('Key teaching point: the Event LISTENS for the camelCase data-layer name; the Action TYPE is the dotted XDM eventType. Mixing these up is the #1 "rule not firing" bug.')

// Slide 10: Identity & Profile (diagram)
s = pres.addSlide(); s.background = { color: INK }
s.addText('IDENTITY & PROFILE', { x: M, y: 0.55, w: 10, h: 0.3, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('Anonymous → Known: how one profile forms', { x: M, y: 0.85, w: 12, h: 0.8, fontSize: 30, bold: true, color: WHITE, fontFace: HF, isTextBox: true, margin: 0 })
// two identity nodes merging
s.addShape(pres.ShapeType.roundRect, { x: 1.2, y: 2.5, w: 3.6, h: 1.5, rectRadius: 0.1, fill: { color: '3A302B' }, line: { color: CORAL, width: 1.25 } })
s.addText('🕶️  Anonymous', { x: 1.2, y: 2.7, w: 3.6, h: 0.4, align: 'center', fontSize: 15, bold: true, color: WHITE, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('ECID', { x: 1.2, y: 3.1, w: 3.6, h: 0.4, align: 'center', fontSize: 18, bold: true, color: GOLD, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('set by the Web SDK', { x: 1.2, y: 3.5, w: 3.6, h: 0.35, align: 'center', fontSize: 11, color: 'D9CFC9', fontFace: BF, isTextBox: true, margin: 0 })
s.addShape(pres.ShapeType.roundRect, { x: 1.2, y: 4.3, w: 3.6, h: 1.5, rectRadius: 0.1, fill: { color: '3A302B' }, line: { color: CORAL, width: 1.25 } })
s.addText('👤  Signed in', { x: 1.2, y: 4.5, w: 3.6, h: 0.4, align: 'center', fontSize: 15, bold: true, color: WHITE, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('Email identity', { x: 1.2, y: 4.9, w: 3.6, h: 0.4, align: 'center', fontSize: 18, bold: true, color: GOLD, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('added to identityMap', { x: 1.2, y: 5.3, w: 3.6, h: 0.35, align: 'center', fontSize: 11, color: 'D9CFC9', fontFace: BF, isTextBox: true, margin: 0 })
s.addText('▸', { x: 5.0, y: 3.5, w: 1.0, h: 1.0, align: 'center', valign: 'middle', fontSize: 40, bold: true, color: CORAL, isTextBox: true, margin: 0 })
s.addShape(pres.ShapeType.roundRect, { x: 6.4, y: 3.1, w: 5.6, h: 2.3, rectRadius: 0.12, fill: { color: CORAL }, line: { type: 'none' } })
s.addText('🧑‍🤝‍🧑  One AEP Profile', { x: 6.4, y: 3.35, w: 5.6, h: 0.5, align: 'center', fontSize: 18, bold: true, color: WHITE, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('Identity graph stitches ECID ↔ Email', { x: 6.4, y: 3.9, w: 5.6, h: 0.4, align: 'center', fontSize: 13, color: 'FFE9E0', fontFace: BF, isTextBox: true, margin: 0 })
s.addText('+ attributes (loyalty, diet, cuisine, city)\n+ full event history', { x: 6.4, y: 4.3, w: 5.6, h: 0.9, align: 'center', fontSize: 13, color: WHITE, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('This stitching is exactly what support debugs when "two profiles should be one."', { x: M, y: 6.6, w: 12, h: 0.4, fontSize: 12.5, italic: true, color: 'CADCFC', fontFace: BF, isTextBox: true, margin: 0 })
s.addNotes('Before sign-in the person is only an ECID. After sign-in the Email joins the identityMap and AEP merges the two into one profile via the identity graph.')

// Slide 11: Events in action (site + console)
s = pres.addSlide(); s.background = { color: WHITE }
titleBar(s, 'See it live', 'Every action becomes an event')
s.addText('Browse → add to cart → checkout → purchase → rate. Each click pushes a clean event to the data layer, which the console prints.', { x: M, y: 1.55, w: W - 2 * M, h: 0.5, fontSize: 14, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
shot(s, M, 2.2, 5.9, 4.6, 'Feastly site — the home/menu page (the running website).')
shot(s, 6.8, 2.2, W - M - 6.8, 4.6, 'Browser console — the "[Feastly][dataLayer] purchase" log with the payload expanded.')
s.addNotes('Open DevTools console live if you can. Show a purchase and expand the object so they see commerce.order, productListItems, identityMap and the attributes.')

// Slide 12: Assurance
componentSlide('Validate', 'Adobe Assurance — watch it flow',
  [['Connect a session', 'Scan/enter the URL to attach the site.'],
   ['See the chain', 'Data layer event → rule fired → sendEvent.'],
   ['Inspect the XDM', 'Confirm the exact payload leaving the browser.'],
   ['Edge response', 'A 200 means the Edge accepted the event.']],
  'Assurance — the event list with a "purchase" selected, showing the XDM payload + Edge 200.'
).addNotes('Assurance is the bridge between the browser and AEP. If it looks good here but not in AEP, the issue is datastream/dataset config, not collection.')

// Slide 13: Verify in AEP
componentSlide('Verify', 'Confirm the data in AEP',
  [['Dataset → Preview', 'See rows arriving in the Feastly dataset.'],
   ['Monitoring', 'Batch/streaming ingestion success or failures.'],
   ['Profile → Lookup', 'Find the person by Email or ECID.'],
   ['Identity graph', 'See ECID ↔ Email linked; events + attributes.']],
  'AEP — Profile lookup showing attributes + event timeline (and the identity graph tab).'
).addNotes('This is home turf for the team. Tie it back: the fields they see here are exactly the ones defined in the schema and populated by the rules.')

// Slide 14: Troubleshooting playbook
s = pres.addSlide(); s.background = { color: WHITE }
titleBar(s, 'Support playbook', 'When data is missing — where to look')
const tb = [
  ['Rule not firing', 'Event "listen for" ≠ the data-layer name (camelCase, no dots).'],
  ['Empty / wrong XDM', 'Data element path typo, or field not in the schema.'],
  ['No data in AEP', 'Datastream missing the AEP service, or wrong dataset.'],
  ['Identity not stitching', 'Email not marked as an identity, or not in identityMap.'],
  ['Nothing at all', 'Tags embed not on the page / wrong environment build.'],
  ['Duplicated metrics', 'Same event fired twice, or state bleeding between events.'],
]
tb.forEach((t, i) => {
  const col = i % 2, row = Math.floor(i / 2)
  const x = M + col * (cw + 0.4), y = 1.9 + row * 1.55
  s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: 1.35, rectRadius: 0.08, fill: { color: SOFT }, line: { type: 'none' } })
  s.addText('⚠️', { x: x + 0.25, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 18, isTextBox: true, margin: 0 })
  s.addText(t[0], { x: x + 0.85, y: y + 0.18, w: cw - 1.1, h: 0.4, fontSize: 15, bold: true, color: CORAL_DK, fontFace: BF, isTextBox: true, margin: 0 })
  s.addText(t[1], { x: x + 0.85, y: y + 0.58, w: cw - 1.1, h: 0.65, fontSize: 12.5, color: INK, fontFace: BF, isTextBox: true, margin: 0 })
})
s.addNotes('This is the slide the team will screenshot for their own reference. Walk the funnel top-down: browser (Assurance) → datastream → dataset → profile.')

// Slide 15: Mental model recap
s = pres.addSlide(); s.background = { color: INK }
s.addText('ONE MENTAL MODEL', { x: M, y: 0.6, w: 10, h: 0.3, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('If you remember one thing', { x: M, y: 0.95, w: 12, h: 0.8, fontSize: 30, bold: true, color: WHITE, fontFace: HF, isTextBox: true, margin: 0 })
s.addText('“The website only speaks the data layer. Tags translates it to XDM, the Web SDK ships it to the datastream, and the datastream routes it to AEP.”', { x: M, y: 2.4, w: 12, h: 1.6, fontSize: 24, bold: true, color: WHITE, italic: true, fontFace: HF, isTextBox: true, margin: 0 })
const recap = ['Data layer = what happened', 'Data elements = variables', 'Rules = when → send', 'Datastream = where it goes']
recap.forEach((r, i) => {
  const x = M + i * 3.05
  s.addShape(pres.ShapeType.roundRect, { x, y: 4.5, w: 2.85, h: 1.2, rectRadius: 0.1, fill: { color: '3A302B' }, line: { color: CORAL, width: 1 } })
  s.addText(r, { x: x + 0.2, y: 4.5, w: 2.45, h: 1.2, valign: 'middle', align: 'center', fontSize: 14, bold: true, color: WHITE, fontFace: BF, isTextBox: true, margin: 0 })
})
s.addNotes('Repeat the one-liner. This is the takeaway that lets them reason about any collection issue.')

// Slide 16: Closing / resources
s = pres.addSlide(); s.background = { color: WHITE }
s.addShape(pres.ShapeType.ellipse, { x: 11.4, y: 5.3, w: 3.4, h: 3.4, fill: { color: SOFT }, line: { type: 'none' } })
s.addText('🍔', { x: M, y: 1.2, w: 2, h: 1.2, fontSize: 54, isTextBox: true, margin: 0 })
s.addText('Try it yourself', { x: M, y: 2.4, w: 11, h: 0.9, fontSize: 40, bold: true, color: INK, fontFace: HF, isTextBox: true, margin: 0 })
s.addText([
  { text: 'Clone the repo, run it, then point it at your own Adobe via the ⚙ Adobe Config panel.', options: { breakLine: true } },
], { x: M, y: 3.4, w: 10.5, h: 0.6, fontSize: 16, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.3, w: 9.5, h: 0.8, rectRadius: 0.08, fill: { color: INK }, line: { type: 'none' } })
s.addText('github.com/princeparvat80/aep-data-collection-food-demo', { x: M + 0.3, y: 4.3, w: 9, h: 0.8, valign: 'middle', fontSize: 16, bold: true, color: GOLD, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('Run:  npm install  →  npm run dev  →  http://localhost:5175', { x: M, y: 5.35, w: 10, h: 0.4, fontSize: 14, italic: true, color: INK, fontFace: BF, isTextBox: true, margin: 0 })
s.addText('Questions? Let\'s open the console and trace an event together.', { x: M, y: 6.5, w: 11, h: 0.4, fontSize: 13, color: MUTED, fontFace: BF, isTextBox: true, margin: 0 })
s.addNotes('End by inviting them to clone and try; offer to pair on wiring it to a sandbox.')

await pres.writeFile({ fileName: 'C:/Users/princekumar/Documents/Projects/aep-data-collection-food-demo/presentation/Feastly-DataCollection-to-AEP.pptx' })
console.log('deck written')
