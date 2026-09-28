import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DishCard from '../components/DishCard.jsx'
import { dishes, categories } from '../data/menu'
import { dataLayer } from '../dataLayer'

export default function Menu() {
  const [params] = useSearchParams()
  const initialCat = params.get('category') || 'All'
  const [category, setCategory] = useState(initialCat)
  const [term, setTerm] = useState('')

  // Data layer: viewMenu is the menu page view. It is mapped to a page view in
  // Adobe and also carries the selected category, so we do not push a separate
  // pageView here (that would double count the page). It runs again whenever the
  // visitor switches category.
  useEffect(() => { dataLayer.viewMenu(category) }, [category])

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
    // Data layer: push a search event with the term, the current category and how
    // many results matched. We wait until three characters are typed so we do not
    // send a search on every single keystroke.
    if (v.trim().length > 2) dataLayer.search({ term: v, resultsCount: filtered.length, category })
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
