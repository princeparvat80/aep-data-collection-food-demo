// ---------------------------------------------------------------------------
// Runtime Adobe configuration
// ---------------------------------------------------------------------------
// Teammates can point this demo at THEIR OWN Adobe setup with no code edits, via
// the in-app "Adobe Config" panel (gear icon in the footer). Values are saved in
// localStorage. Optional build-time defaults can be set in a .env file.
// ---------------------------------------------------------------------------

const LS_KEY = 'feastly_adobe_config'

const defaults = {
  // Paste your Tags (Launch) environment embed script URL here (or via the panel).
  tagsEmbedUrl: import.meta.env.VITE_TAGS_EMBED_URL || '',
  // Shown for reference / used only if you later switch to direct Web SDK.
  datastreamId: import.meta.env.VITE_DATASTREAM_ID || '',
  orgId: import.meta.env.VITE_ORG_ID || '',
  sandbox: import.meta.env.VITE_SANDBOX || 'prod',
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
