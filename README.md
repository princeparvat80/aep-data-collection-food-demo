# 🍔 Feastly — Learn Adobe Data Collection > AEP

A simple, friendly **food-ordering demo website** built to teach how **Adobe Data
Collection** (Tags/Launch + Web SDK) sends **streaming events and profile
attributes** into **Adobe Experience Platform (AEP)** — and how to troubleshoot
when data doesn't show up.

It's made for **AEP support / practitioners** who want to *see* the collection
side of the house: the data layer, rules, data elements, datastream, identity,
and profiles — using the **simplest, most common** setup real customers use.

> Sister demos: an e‑commerce site (> AEP/AJO/CJA) and TripNest (> Adobe
> Analytics > AEP > CJA). Feastly focuses purely on **Web SDK > Datastream > AEP**.

---

## What you'll learn / can show a team
- How a **data layer** (`adobeDataLayer`) decouples the site from Adobe
- How **Tags rules + data elements** turn data-layer pushes into **XDM**
- How the **Web SDK** sends events to the **Edge/Datastream**
- How data lands in **AEP** as **experience events** + builds **real-time profiles**
- **Identity**: anonymous **ECID** > **email identity** after sign-in (stitching)
- How to **validate** with Assurance and troubleshoot in AEP

---

## The data flow
```
User action
   ↓
window.adobeDataLayer.push({ event: "...", ... })      ← the website's only job
   ↓
Tags (Launch) property
   ├─ Adobe Client Data Layer extension (listens)
   ├─ Data Elements (map data layer > XDM + identity)
   ├─ Rules (one per event > Send Event)
   └─ AEP Web SDK extension
   ↓
Adobe Edge Network (Datastream)
   ↓
Adobe Experience Platform  > Event dataset (+ Profile if enabled)
```

## Events it sends (real-world set)
| Area | Events |
|---|---|
| Page / discovery | `pageView`, `viewMenu`, `search`, `dishView` |
| Commerce | `addToCart`, `removeFromCart`, `checkout`, `purchase` |
| Post-order | `orderRating` |
| Identity / profile | `login`, `signup`, `profileUpdate`, `newsletterSignup`, `logout` |

## Streaming profile attributes (build a profile in AEP)
`email` (identity), `firstName`, `loyaltyTier`, `dietaryPreference`,
`favoriteCuisine`, `city`, `marketingConsent`, plus visitor/device context.

---

## Run it (30 seconds)
```bash
npm install
npm run dev        # http://localhost:5175
```
It runs immediately in **data-layer-only mode** — every event logs to the console
and pushes to `window.adobeDataLayer`. Great for walking through the flow before
Adobe is wired up.

## Point it at YOUR Adobe (no code edits) 🔌
1. Click **⚙️ Adobe Config** in the footer.
2. Paste your **Tags (Launch) environment embed URL**
   (*Data Collection > Tags > your property > Environments*).
3. **Save & reload** — the site now loads *your* Tags library and sends to *your*
   datastream/sandbox.

This is what makes Feastly reusable: everyone clones the same repo and points it
at their own property via the panel. The setting is stored in `localStorage`.

To build your Adobe side from scratch, follow **[DATA-COLLECTION-SETUP.md](DATA-COLLECTION-SETUP.md)**
and the schema in **[SCHEMA.md](SCHEMA.md)**.

---

## Validate
1. **Console** — every action logs `[Feastly][dataLayer] <event>` with the payload.
   Type `adobeDataLayer.getState()` to see the merged state.
2. **Assurance** — connect a session and watch the ACDL event > rule > Web SDK
   `sendEvent` > Edge response.
3. **AEP** — Dataset > *Preview*, and **Profile > lookup by identity** to see the
   profile + event history and the **identity graph** (ECID ↔ email).

## Tech
- React 18 + Vite + react-router
- Adobe Data Collection (Tags) + Web SDK — configured in Adobe, not in code

## Project structure
```
src/
  adobe/
    config.js     runtime config (localStorage) for the Tags embed URL
    loader.js     injects the Tags embed at runtime
    identity.js   visitor/session/user + profile + global context
    track.js      pushes serialized, clean events to adobeDataLayer
  components/     Header, Footer, DishCard, CartDrawer, SignInModal, AdobeConfigPanel
  pages/          Home, Menu, DishDetail, Checkout, Confirmation, Profile
  data/menu.js    mock dishes
  CartContext.jsx cart state
```
