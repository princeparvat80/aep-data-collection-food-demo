// Feastly data layer — the ONE place all data-collection code lives.
//
// This single file is the whole "data layer" of the website. Every UI page and
// component imports the `dataLayer` object below and calls one of its methods
// (for example `dataLayer.addToCart(dish)`) at the moment something happens. The
// pages never build Adobe payloads themselves and never talk to Adobe directly —
// they just "hit" this file.
//
// How the data actually reaches Adobe:
//
//   UI page  ->  dataLayer.<event>()  ->  window.adobeDataLayer.push({...})
//            ->  Adobe Tags (Launch) listens on the data layer
//            ->  maps the values to XDM  ->  Datastream  ->  AEP
//
// So everything below simply pushes plain JavaScript objects onto
// window.adobeDataLayer (the Adobe Client Data Layer). The Tags property loaded
// in index.html is what listens to that array, maps the values into XDM, and
// sends each event to the datastream, which forwards it to Adobe Experience
// Platform (AEP).
//
// The object we push is "the data layer". Its shape is what the whole demo is
// about, so a quick tour of the pieces:
//
//   event        the name of what happened, for example "addToCart". A Tags rule
//                is set up to listen for each of these names.
//   commerce     the standard commerce metrics (productViews, productListAdds,
//                checkouts, purchases and so on). These map to the equivalent
//                Analytics or AEP commerce fields automatically.
//   product      the single dish being viewed or added.
//   order        the full cart or order (used by cart view, checkout, purchase).
//   food         custom attributes about the dish (category, cuisine).
//   search       what the user searched for.
//   rating       an order rating.
//   page         the current page name and section.
//   authentication  login, signup or logout details.
//   plus a global context (site, device, visitor, session, user) added to every
//   event by getContext() so that AEP can build the profile and stitch identity.
//
// Two implementation details worth knowing when reading this file:
//
// 1. Events are put on a small queue and pushed one at a time with a short gap.
//    The Adobe Client Data Layer merges pushes together and processes them
//    asynchronously, so firing several events in the same instant can let one
//    event's data leak into the next. Spacing them keeps each hit clean.
//
// 2. Before each event we clear the "transient" branches (commerce, product and
//    so on) by setting them to undefined. That way a purchase does not carry
//    over into the next page view. The page branch is deliberately left alone so
//    the current page name stays attached to every following event.

import { getUser, getVisitorId, getSessionId, getVisitorType } from './adobe/identity'

// ---- Global context (added to every event) -------------------------------

function detectDevice() {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

// Context merged into every event (site/device/visitor/session/user). This is
// what lets Adobe Experience Platform build the profile and stitch the anonymous
// visitor (known only by ECID) to the known user (email) after they sign in.
function getContext() {
  const user = getUser()
  return {
    site: { brand: 'Feastly', businessUnit: 'food', platform: 'web',
      language: navigator.language || 'en-US', currency: 'USD' },
    device: { type: detectDevice(), viewport: `${innerWidth}x${innerHeight}` },
    visitor: { id: getVisitorId(), type: getVisitorType() },
    session: { id: getSessionId() },
    user: user
      ? {
          authenticated: true,
          email: user.email,
          customerId: user.customerId,
          firstName: user.firstName,
          loyaltyTier: user.loyaltyTier,
          dietaryPreference: user.dietaryPreference,
          favoriteCuisine: user.favoriteCuisine,
          city: user.city,
          marketingConsent: user.marketingConsent,
        }
      : { authenticated: false },
  }
}

// ---- Push queue -----------------------------------------------------------

// Branches that belong to a single event and must be cleared before the next one.
// 'page' is intentionally not in this list so the page name persists across events.
const TRANSIENT = ['commerce', 'product', 'order', 'search', 'rating', 'food', 'authentication']
const GAP_MS = 300
let queue = []
let draining = false

function pruneNested(o) { return JSON.parse(JSON.stringify(o)) }

function drain() {
  if (!queue.length) { draining = false; return }
  draining = true
  const obj = queue.shift()

  const reset = {}
  TRANSIENT.forEach((k) => { reset[k] = undefined })
  window.adobeDataLayer.push(reset)

  window.adobeDataLayer.push(obj)
  console.info('%c[Feastly][dataLayer]', 'color:#2b8a3e;font-weight:bold', obj.event, obj)

  setTimeout(drain, GAP_MS)
}

function push(payload) {
  window.adobeDataLayer = window.adobeDataLayer || []
  queue.push({
    event: payload.event,
    eventInfo: { timestamp: new Date().toISOString() },
    ...getContext(),
    ...pruneNested(payload),
  })
  if (!draining) drain()
}

// ---- Shared shape helpers -------------------------------------------------

function productItem(dish, qty = 1) {
  return {
    id: dish.id,
    name: dish.name,
    category: dish.category,
    cuisine: dish.cuisine,
    price: dish.price,
    quantity: qty,
    priceTotal: +(dish.price * qty).toFixed(2),
  }
}

function cartToOrder(cart) {
  const items = cart.map((c) => productItem(c.dish, c.qty))
  const total = +items.reduce((s, i) => s + i.priceTotal, 0).toFixed(2)
  return { items, itemCount: items.length, total }
}

// ---- The data layer API ---------------------------------------------------
//
// This is the object every UI page/component uses. One method per event.

export const dataLayer = {
  // ---- Page / discovery events -------------------------------------------

  pageView(pageName) {
    push({ event: 'pageView', page: {
      name: pageName, url: location.href, siteSection: pageName.split('-')[0],
    } })
  },

  viewMenu(category) {
    push({ event: 'viewMenu', food: { category }, page: { name: 'menu', siteSection: 'menu' } })
  },

  search({ term, resultsCount, category }) {
    push({ event: 'search', search: { term, resultsCount, category: category || 'all' } })
  },

  dishView(dish) {
    push({
      event: 'dishView',
      commerce: { productViews: { value: 1 } },
      product: productItem(dish),
      food: { category: dish.category, cuisine: dish.cuisine, veg: dish.veg, spiceLevel: dish.spiceLevel },
    })
  },

  // ---- Commerce events ----------------------------------------------------

  addToCart(dish, qty = 1) {
    push({
      event: 'addToCart',
      commerce: { productListAdds: { value: 1 } },
      product: productItem(dish, qty),
      food: { category: dish.category, cuisine: dish.cuisine },
    })
  },

  removeFromCart(dish, qty = 1) {
    push({
      event: 'removeFromCart',
      commerce: { productListRemovals: { value: 1 } },
      product: productItem(dish, qty),
    })
  },

  cartView(cart) {
    if (!cart || !cart.length) return
    push({
      event: 'cartView',
      commerce: { productListOpens: { value: 1 } },
      order: cartToOrder(cart),
    })
  },

  checkout(cart) {
    push({
      event: 'checkout',
      commerce: { checkouts: { value: 1 } },
      order: cartToOrder(cart),
    })
  },

  purchase(order) {
    push({
      event: 'purchase',
      commerce: {
        purchases: { value: 1 },
        order: {
          purchaseID: order.id,
          priceTotal: order.total,
          currencyCode: 'USD',
          payments: [{ paymentType: order.paymentMethod, currencyCode: 'USD', paymentAmount: order.total }],
        },
      },
      order,
    })
  },

  orderRating({ orderId, stars, comment }) {
    push({ event: 'orderRating', rating: { orderId, stars, comment: comment || '' } })
  },

  // ---- Identity / profile events -----------------------------------------

  login(user) {
    push({ event: 'login', authentication: { action: 'login', method: 'email', success: true },
      user: { authenticated: true, email: user.email, customerId: user.customerId } })
  },

  signup(user) {
    push({ event: 'signup', authentication: { action: 'signup', method: 'email', success: true },
      user: { authenticated: true, email: user.email, customerId: user.customerId } })
  },

  profileUpdate(user) {
    push({ event: 'profileUpdate', user: {
      email: user.email, loyaltyTier: user.loyaltyTier,
      dietaryPreference: user.dietaryPreference, favoriteCuisine: user.favoriteCuisine, city: user.city,
    } })
  },

  newsletter({ email, consent }) {
    push({ event: 'newsletterSignup', marketing: { newsletterConsent: !!consent, email } })
  },

  logout() {
    push({ event: 'logout', authentication: { action: 'logout', success: true } })
  },
}
