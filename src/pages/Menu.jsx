import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DishCard from '../components/DishCard.jsx'
import { dishes, categories } from '../data/menu'
import { trackViewMenu, trackSearch } from '../adobe/track'

export default function Menu() {
  const [params] = useSearchParams()
  const initialCat = params.get('category') || 'All'
  const [category, setCategory] = useState(initialCat)
  const [term, setTerm] = useState('')

  // viewMenu is the menu page-view (it maps to web.webpagedetails.pageViews and
  // also carries the category) — so we don't fire a separate pageView here.
  useEffect(() => { trackViewMenu(category) }, [category])

  const filtered = useMemo(() => {
    let list = dishes
    if (category !== 'All') list = list.filter((d) => d.category === category)
    if (term.trim()) {
      const q = term.toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(q) || d.cuisine.toLowerCase().includes(q))
    }
    return list
  }, [category, term])

  const onSearch = (e) => {
    const v = e.target.value
    setTerm(v)
    if (v.trim().length > 2) trackSearch({ term: v, resultsCount: filtered.length, category })
  }

  return (
    <div className="container section">
      <div className="section-head"><div><h2>Our menu</h2><p>{filtered.length} dishes</p></div></div>
      <div className="toolbar">
        <input className="search-input" placeholder="🔍 Search dishes or cuisines..." value={term} onChange={onSearch} />
      </div>
      <div className="cats" style={{ marginBottom: 24 }}>
        {['All', ...categories].map((c) => (
          <button key={c} className={`cat-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
      <div className="grid">
        {filtered.map((d) => <DishCard key={d.id} dish={d} />)}
        {!filtered.length && <p style={{ color: 'var(--muted)' }}>No dishes match your search.</p>}
      </div>
    </div>
  )
}
