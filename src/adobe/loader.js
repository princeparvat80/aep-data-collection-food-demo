// Tags (Launch) embed loader.
//
// This adds the Adobe Tags script tag to the page at runtime, using whatever
// embed URL is configured (see config.js and the Adobe Config panel). Loading it
// this way is what makes the demo reusable. A teammate can point the site at
// their own Tags property, datastream and sandbox just by pasting a different
// embed URL, without changing or rebuilding any code. If no URL is configured the
// site still runs and logs every event to the console, it just does not send
// anything to Adobe.

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
