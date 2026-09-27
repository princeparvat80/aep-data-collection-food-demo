// Identity, session and profile helpers for the website.
//
// This file keeps track of who the visitor is, using ordinary browser storage.
// It does not use Adobe cookies. The point it demonstrates is the move from an
// anonymous visitor to a known one. Before sign in, Adobe only knows the visitor
// by the ECID that the Web SDK sets automatically. After sign in we record the
// email and a few profile attributes here, and getContext() adds them to every
// event so that Adobe Experience Platform can stitch the anonymous and known
// identities into a single profile.
//
// The values managed here are a persistent visitor id, a per session id, and the
// signed in user with their profile attributes. getContext() returns the site,
// device, visitor, session and user information that track.js attaches to every
// data layer event.

const LS_USER = 'feastly_user'
const LS_VISITOR = 'feastly_visitor_id'
const SS_SESSION = 'feastly_session_id'

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

let _new = false
export function getVisitorId() {
  let id = localStorage.getItem(LS_VISITOR)
  if (!id) { id = 'v-' + uuid(); localStorage.setItem(LS_VISITOR, id); _new = true }
  return id
}
export function getSessionId() {
  let id = sessionStorage.getItem(SS_SESSION)
  if (!id) { id = 's-' + uuid(); sessionStorage.setItem(SS_SESSION, id) }
  return id
}
export function getVisitorType() {
  getVisitorId()
  return _new ? 'new' : 'returning'
}

const listeners = new Set()
export function onUserChange(fn) { listeners.add(fn); return () => listeners.delete(fn) }
function emit(u) { listeners.forEach((fn) => fn(u)) }

export function getUser() {
  try { return JSON.parse(localStorage.getItem(LS_USER) || 'null') } catch { return null }
}

export function signIn({ email, firstName = '', loyaltyTier = 'Silver',
  dietaryPreference = 'none', favoriteCuisine = '', city = '', marketingConsent = true }) {
  const user = {
    email,
    firstName,
    loyaltyTier,
    dietaryPreference,
    favoriteCuisine,
    city,
    marketingConsent,
    authenticated: true,
    // demo-only pseudo CRM id derived from email (not real hashing)
    customerId: 'crm-' + btoa(email).replace(/=/g, '').slice(0, 12),
  }
  localStorage.setItem(LS_USER, JSON.stringify(user))
  emit(user)
  return user
}

export function updateProfile(patch) {
  const user = { ...(getUser() || {}), ...patch }
  localStorage.setItem(LS_USER, JSON.stringify(user))
  emit(user)
  return user
}

export function signOut() {
  localStorage.removeItem(LS_USER)
  emit(null)
}

function detectDevice() {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

// Context merged into every event (site/device/visitor/session/user).
export function getContext() {
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
