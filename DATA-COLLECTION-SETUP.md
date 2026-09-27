# Feastly — Adobe Data Collection Setup (step by step)

The simplest, most common setup: **Tags (Launch) property + Web SDK + Adobe
Client Data Layer**, sending to a **Datastream → AEP**.

```
Website → adobeDataLayer → Tags (ACDL + rules + data elements + Web SDK)
        → Datastream → AEP (event dataset, Profile-enabled)
```

---

## Step 1 — Schema & dataset (AEP)
1. Create schema **`Feastly Order Event`** (see [SCHEMA.md](SCHEMA.md)).
2. Mark **Email** as an identity (namespace: Email).
3. Create dataset **`Feastly Order Event Dataset`** → **enable for Profile**.

## Step 2 — Datastream
1. Data Collection → **Datastreams → New** → `Feastly Web SDK`.
2. Add the **Adobe Experience Platform** service → select the dataset above.
3. Copy the **Datastream ID**.

## Step 3 — Tag (Launch) property
1. Data Collection → **Tags → New Property** (Web) → `Feastly Web`.
2. **Extensions:**
   - **Adobe Experience Platform Web SDK** — set the **datastream** (per env) + **Org ID**.
   - **Adobe Client Data Layer**.

### Data Elements (Adobe Client Data Layer → *Computed State*, one per path)
| Name | Path |
|---|---|
| `Feastly - page` | `page` |
| `Feastly - commerce` | `commerce` |
| `Feastly - product` | `product` |
| `Feastly - order` | `order` |
| `Feastly - food` | `food` |
| `Feastly - search` | `search` |
| `Feastly - rating` | `rating` |
| `Feastly - user` | `user` |

**Custom Code** data element `Feastly - productListItems`:
```js
var p = _satellite.getVar('Feastly - product');
if (!p || !p.id) return [];
return [{ SKU: p.id, name: p.name, quantity: p.quantity, priceTotal: p.priceTotal }];
```

**Custom Code** data element `Feastly - identityMap` (adds Email identity when known):
```js
var u = _satellite.getVar('Feastly - user') || {};
var map = {};
if (u.email) {
  map.Email = [{ id: u.email, primary: true, authenticatedState: "authenticated" }];
}
return map; // ECID is added automatically by the Web SDK
```

**XDM Object** data element `Feastly - XDM` (Web SDK type, schema = Feastly Order Event):
| XDM field | Value |
|---|---|
| `web.webPageDetails.name` | `%Feastly - page%` → `.name` (or a page-name element) |
| `commerce` | `%Feastly - commerce%` |
| `productListItems` | `%Feastly - productListItems%` |
| `identityMap` | `%Feastly - identityMap%` |
| `_yourtenant.food` | `%Feastly - food%` |
| `_yourtenant.attributes` | `%Feastly - user%` (maps loyaltyTier, dietaryPreference, …) |
| `_yourtenant.rating` | `%Feastly - rating%` |

### Rules (one per event)
Event = **Adobe Client Data Layer → Data Pushed → Specific Event** (`Event/Key to
register for` = the data-layer name). Action = **Web SDK → Send event** with
**Type** = the XDM eventType, **XDM** = `%Feastly - XDM%`.

| Rule | Listen for | Type (eventType) |
|---|---|---|
| Feastly - Page View | `pageView` | `web.webpagedetails.pageViews` |
| Feastly - View Menu | `viewMenu` | `web.webpagedetails.pageViews` |
| Feastly - Search | `search` | `commerce.productListViews` |
| Feastly - Dish View | `dishView` | `commerce.productViews` |
| Feastly - Add To Cart | `addToCart` | `commerce.productListAdds` |
| Feastly - Remove From Cart | `removeFromCart` | `commerce.productListRemovals` |
| Feastly - Checkout | `checkout` | `commerce.checkouts` |
| Feastly - Purchase | `purchase` | `commerce.purchases` |
| Feastly - Order Rating | `orderRating` | `web.webinteraction.linkClicks` |
| Feastly - Login | `login` | `web.webinteraction.linkClicks` |
| Feastly - Signup | `signup` | `web.webinteraction.linkClicks` |
| Feastly - Profile Update | `profileUpdate` | `web.webinteraction.linkClicks` |
| Feastly - Newsletter | `newsletterSignup` | `web.webinteraction.linkClicks` |

> Remember: **listen-for** = the camelCase data-layer name (no dots); **Type** =
> the dotted XDM eventType.

## Step 4 — Publish & connect the site
1. **Publishing Flow** → add all resources → **Build** to Development.
2. Copy the **Development environment embed URL**.
3. In Feastly, click **⚙️ Adobe Config** (footer) → paste the embed URL → **Save & reload**.

## Step 5 — Validate & troubleshoot (support playbook)
1. **Console:** `[Feastly][dataLayer] <event>` on every action.
2. **Assurance:** ACDL event → rule fired → Web SDK `sendEvent` → Edge 200.
3. **AEP:** Dataset → *Preview*; **Profile → Browse/Lookup** by Email or ECID to
   see event history + **identity graph** (ECID ↔ Email stitching).
4. **Common issues to teach:** rule not firing (wrong listen-for value), empty XDM
   (data element path typo), identity not stitching (Email not marked as identity),
   data not in AEP (datastream missing AEP service or dataset not Profile-enabled).
