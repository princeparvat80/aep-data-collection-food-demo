// Keep Adobe Experience Platform Assurance connected across SPA navigation.
//
// Assurance ties a validation session to the page through the
// `adb_validation_sessionid` query parameter. The Web SDK / Edge Network reads
// this parameter from the URL when it sends each event and forwards a copy of
// that event to the Assurance session you opened.
//
// Feastly is a single page app (react-router), so every in-app navigation
// (navigate(), <Link>, <NavLink>) calls history.pushState / replaceState and
// would drop the parameter from the URL. The moment it is gone, new events are
// no longer tagged with the session, so Assurance stops receiving them. That is
// exactly the "first load shows a few rows, then tracking stops as soon as I
// fire an event" symptom — the first event you fire navigates and loses the id.
//
// Fix: remember the session id for this browser tab and re-attach it to every
// URL the router pushes, so the parameter stays present for the whole
// validation session. This is a no-op when the app is not opened from an
// Assurance validation link.

const PARAM = 'adb_validation_sessionid'
const SS_KEY = 'feastly_assurance_sessionid'

function readSessionId() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(PARAM)
    if (fromUrl) sessionStorage.setItem(SS_KEY, fromUrl)
    return fromUrl || sessionStorage.getItem(SS_KEY)
  } catch {
    return null
  }
}

// Return `url` with the session id attached (without overwriting one that is
// already there). Falls back to the original value if it cannot be parsed.
function withSession(url, id) {
  try {
    const next = new URL(url, window.location.href)
    if (!next.searchParams.get(PARAM)) next.searchParams.set(PARAM, id)
    return next.pathname + next.search + next.hash
  } catch {
    return url
  }
}

export function keepAssuranceSession() {
  const id = readSessionId()
  if (!id) return // Not an Assurance validation session — nothing to preserve.

  // Ensure it is on the URL right now (e.g. after a prior strip).
  if (!new URLSearchParams(window.location.search).get(PARAM)) {
    window.history.replaceState(
      window.history.state,
      '',
      withSession(window.location.href, id)
    )
  }

  // Re-attach it to every client-side navigation react-router performs.
  ;['pushState', 'replaceState'].forEach((method) => {
    const original = window.history[method]
    if (original.__feastlyAssurancePatched) return
    const patched = function (state, title, url) {
      const nextUrl = url == null ? url : withSession(url, id)
      return original.call(this, state, title, nextUrl)
    }
    patched.__feastlyAssurancePatched = true
    window.history[method] = patched
  })
}
