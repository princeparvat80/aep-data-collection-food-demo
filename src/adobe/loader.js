// ---------------------------------------------------------------------------
// Tags (Launch) embed loader
// ---------------------------------------------------------------------------
// Injects the Adobe Tags embed script at runtime based on the configured URL.
// This is what makes the demo reusable: whatever Tags environment URL you set in
// the Adobe Config panel gets loaded here, so the site talks to YOUR property,
// datastream and sandbox — no rebuild required.
// ---------------------------------------------------------------------------

import { getConfig } from './config'

let loaded = false

export function loadTags() {
  if (loaded) return
  const { tagsEmbedUrl } = getConfig()

  if (!tagsEmbedUrl) {
    console.info(
      '%c[Feastly] DATA-LAYER-ONLY mode.',
      'color:#e8590c;font-weight:bold',
      'No Tags embed set. Open the ⚙ Adobe Config panel (footer) and paste your ' +
        'Launch environment embed URL to send data to AEP. Until then, every event ' +
        'is logged here and pushed to window.adobeDataLayer.'
    )
    return
  }

  const s = document.createElement('script')
  s.src = tagsEmbedUrl
  s.async = true
  s.onload = () => console.info('[Feastly] Tags library loaded:', tagsEmbedUrl)
  s.onerror = () => console.error('[Feastly] Failed to load Tags library:', tagsEmbedUrl)
  document.head.appendChild(s)
  loaded = true
}
