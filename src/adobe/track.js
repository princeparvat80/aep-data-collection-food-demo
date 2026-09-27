// Feastly tracking helpers.
//
// This is the only file in the website that talks to Adobe. Nothing here calls
// Adobe directly. Every function simply pushes a plain JavaScript object onto
// window.adobeDataLayer (the Adobe Client Data Layer). The Tags (Launch)
// property that we load in index.html is what actually listens to that data
// layer, maps the values into XDM, and sends the event to the datastream, which
// forwards it to Adobe Experience Platform.
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

import { getContext } from './identity'

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

// ---- Page / discovery events ---------------------------------------------

export function trackPageView(pageName) {
  push({ event: 'pageView', page: {
    name: pageName, url: location.href, siteSection: pageName.split('-')[0],
  } })
}

export function trackViewMenu(category) {
  push({ event: 'viewMenu', food: { category }, page: { name: 'menu', siteSection: 'menu' } })
}

export function trackSearch({ term, resultsCount, category }) {
  push({ event: 'search', search: { term, resultsCount, category: category || 'all' } })
}

export function trackDishView(dish) {
  push({
    event: 'dishView',
    commerce: { productViews: { value: 1 } },
    product: productItem(dish),
    food: { category: dish.category, cuisine: dish.cuisine, veg: dish.veg, spiceLevel: dish.spiceLevel },
  })
}

// ---- Commerce events ------------------------------------------------------

export function trackAddToCart(dish, qty = 1) {
  push({
    event: 'addToCart',
    commerce: { productListAdds: { value: 1 } },
    product: productItem(dish, qty),
    food: { category: dish.category, cuisine: dish.cuisine },
  })
}

export function trackRemoveFromCart(dish, qty = 1) {
  push({
    event: 'removeFromCart',
    commerce: { productListRemovals: { value: 1 } },
    product: productItem(dish, qty),
  })
}

export function trackCartView(cart) {
  if (!cart || !cart.length) return
  push({
    event: 'cartView',
    commerce: { productListOpens: { value: 1 } },
    order: cartToOrder(cart),
  })
}

export function trackCheckout(cart) {
  push({
    event: 'checkout',
    commerce: { checkouts: { value: 1 } },
    order: cartToOrder(cart),
  })
}

export function trackPurchase(order) {
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
}

export function trackOrderRating({ orderId, stars, comment }) {
  push({ event: 'orderRating', rating: { orderId, stars, comment: comment || '' } })
}

// ---- Identity / profile events -------------------------------------------

export function trackLogin(user) {
  push({ event: 'login', authentication: { action: 'login', method: 'email', success: true },
    user: { authenticated: true, email: user.email, customerId: user.customerId } })
}

export function trackSignup(user) {
  push({ event: 'signup', authentication: { action: 'signup', method: 'email', success: true },
    user: { authenticated: true, email: user.email, customerId: user.customerId } })
}

export function trackProfileUpdate(user) {
  push({ event: 'profileUpdate', user: {
    email: user.email, loyaltyTier: user.loyaltyTier,
    dietaryPreference: user.dietaryPreference, favoriteCuisine: user.favoriteCuisine, city: user.city,
  } })
}

export function trackNewsletter({ email, consent }) {
  push({ event: 'newsletterSignup', marketing: { newsletterConsent: !!consent, email } })
}

export function trackLogout() {
  push({ event: 'logout', authentication: { action: 'logout', success: true } })
}

// ---- helpers --------------------------------------------------------------

function cartToOrder(cart) {
  const items = cart.map((c) => productItem(c.dish, c.qty))
  const total = +items.reduce((s, i) => s + i.priceTotal, 0).toFixed(2)
  return { items, itemCount: items.length, total }
}
