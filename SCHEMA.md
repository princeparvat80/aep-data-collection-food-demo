# Feastly — XDM Schema (for AEP)

The Tags property maps the data layer into XDM that matches this schema. Keep it
**simple and semantic** — great for AEP and CJA.

## Schema
- **Name:** `Feastly Order Event`
- **Class:** `XDM ExperienceEvent`

### Standard field groups
| Field group | Gives |
|---|---|
| **AEP Web SDK ExperienceEvent** | `web`, `environment`, `device`, `placeContext`, `identityMap`, `timestamp`, `eventType` |
| **Commerce Details** | `commerce` (productViews, productListAdds, productListRemovals, checkouts, purchases, order) + `productListItems` |

### Custom field group: `Feastly Details`
Custom fields live under your tenant prefix (shown as `_yourtenant`).

**Object `food`:** `category` (string), `cuisine` (string), `veg` (boolean),
`spiceLevel` (string)

**Object `attributes`:** `loyaltyTier` (string), `dietaryPreference` (string),
`favoriteCuisine` (string), `city` (string), `marketingConsent` (boolean),
`firstName` (string), `visitorType` (string)

**Object `rating`:** `orderId` (string), `stars` (integer), `comment` (string)

## Identity (the important part for support)
- **ECID** — set automatically by the Web SDK (anonymous visitor).
- **Email** — after sign-in, the Tags data element adds it to `identityMap` under
  the **Email** namespace (mark Email as **Identity**, type *Email*).
- Result: AEP **stitches** the anonymous ECID and the known Email into one
  **identity graph** / profile — the classic thing support debugs.

## Dataset
- Create a dataset **`Feastly Order Event Dataset`** on this schema.
- **Enable it for Profile** so events build **real-time profiles** (with the
  identity graph).

> Note on attributes vs events: experience events populate the profile's **event
> history** and **identity graph**. The `attributes` object travels on the events
> (visible in the dataset / queryable). To also populate the **profile attributes
> tab**, add a separate **Individual Profile** (record) schema + dataset later —
> out of scope for this simple demo, but a good "next step" talking point.

## How events map (data layer > XDM eventType)
| Data-layer `event` | XDM `eventType` |
|---|---|
| `pageView` | `web.webpagedetails.pageViews` |
| `viewMenu` | `web.webpagedetails.pageViews` |
| `search` | `commerce.productListViews` |
| `dishView` | `commerce.productViews` |
| `addToCart` | `commerce.productListAdds` |
| `removeFromCart` | `commerce.productListRemovals` |
| `checkout` | `commerce.checkouts` |
| `purchase` | `commerce.purchases` |
| `orderRating` | `web.webinteraction.linkClicks` (or custom) |
| `login` / `signup` | `web.webinteraction.linkClicks` (or custom) |
| `profileUpdate` | `web.webinteraction.linkClicks` (or custom) |
| `newsletterSignup` | `web.webinteraction.linkClicks` (or custom) |
