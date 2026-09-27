// ---------------------------------------------------------------------------
// Feastly tracking API  —  DATA LAYER ONLY
// ---------------------------------------------------------------------------
// The website only pushes to window.adobeDataLayer. A Tags (Launch) property
// reads it and sends XDM to the Datastream -> Adobe Experience Platform.
//
// Design notes (so it stays clean & teachable):
//  - Events are serialized (spaced) so rapid actions don't bleed state via the
//    Adobe Client Data Layer's async, deep-merged computed state.
//  - Transient branches are reset before each event so one event's data never
//    leaks into the next.
//  - Every event carries a global context (site/device/visitor/session/user) so
//    profiles + identity build correctly in AEP.
// ---------------------------------------------------------------------------

import { getContext } from './identity'

// NOTE: 'page' is intentionally NOT reset — page name persists so every event
// (including commerce hits) carries the current pageName.
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
