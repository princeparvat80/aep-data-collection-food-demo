// Runtime Adobe configuration.
//
// This holds the Adobe settings the site needs, mainly the Tags embed URL that
// loader.js uses. A teammate can override these from the Adobe Config panel in
// the footer without touching the code. The chosen values are stored in the
// browser localStorage. Build time defaults can also be provided through a .env
// file, and there is a sensible default embed so the demo works out of the box.

const LS_KEY = 'feastly_adobe_config'

const defaults = {
  // Default = the shared demo Tags property (Development env) built for this demo.
  // Teammates can override with their OWN embed URL via the in-app Adobe Config panel.
  tagsEmbedUrl:
    import.meta.env.VITE_TAGS_EMBED_URL ||
    'https://assets.adobedtm.com/6a203c8a0ff8/78e6bd588c19/launch-157221773b3c-development.min.js',
  // Shown for reference / used only if you later switch to direct Web SDK.
  datastreamId: import.meta.env.VITE_DATASTREAM_ID || '5a439dcd-2363-46fb-a17d-bbceb3cb9f54',
  orgId: import.meta.env.VITE_ORG_ID || 'B504732B5D3B2A790A495ECF@AdobeOrg',
  sandbox: import.meta.env.VITE_SANDBOX || 'princeparvat-prod',
}

export function getConfig() {
  let saved = {}
  try {
    saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    saved = {}
  }
  return { ...defaults, ...saved }
}

export function saveConfig(patch) {
  const next = { ...getConfig(), ...patch }
  localStorage.setItem(LS_KEY, JSON.stringify(next))
  return next
}

export function clearConfig() {
  localStorage.removeItem(LS_KEY)
}

// True once a Tags embed URL is configured (otherwise we run data-layer-only).
export function isConfigured() {
  return Boolean(getConfig().tagsEmbedUrl)
}
