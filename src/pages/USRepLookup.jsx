import { useState } from 'react'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
]

export default function USRepLookup() {
  const [state, setState] = useState('')
  const [reps, setReps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!state) return
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const res = await fetch(
        'https://cdn.jsdelivr.net/gh/unitedstates/congress-legislators@master/legislators-current.json'
      )
      const all = await res.json()

      const matches = all
        .filter(person => person.terms[person.terms.length - 1].state === state)
        .map(person => {
          const term = person.terms[person.terms.length - 1]
          return {
            name: `${person.name.first} ${person.name.last}`,
            role: term.type === 'sen' ? 'Senator' : 'Representative',
            district: term.district,
            phone: term.phone,
            website: term.url,
            contactForm: term.contact_form
          }
        })

      setReps(matches)
    } catch (err) {
      console.error(err)
      setError('Could not load representative data. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
      <h1>Find Your Representatives</h1>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>
        Currently supports U.S. federal representatives (House and Senate), looked up by state.
        International and local/state-level lookup isn't available yet — check your country or city's
        official government website for that contact info in the meantime.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <select value={state} onChange={e => setState(e.target.value)} required>
          <option value="">Select your state</option>
          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Find Representatives'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {searched && !loading && reps.length === 0 && !error && (
        <p style={{ color: '#888' }}>No representatives found for that state.</p>
      )}

      {reps.map((r, i) => (
        <div key={i} style={{ border: '1px solid #ccc', borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 6px' }}>{r.name}</h3>
          <p style={{ margin: '0 0 8px', color: '#555' }}>
            {r.role}{r.district ? ` — District ${r.district}` : ''}
          </p>
          {r.phone && <p style={{ margin: '4px 0' }}>📞 {r.phone}</p>}
          {r.website && (
            <p style={{ margin: '4px 0' }}>
              🔗 <a href={r.website} target="_blank" rel="noopener noreferrer">Official website</a>
            </p>
          )}
          {r.contactForm && (
            <p style={{ margin: '4px 0' }}>
              ✉️ <a href={r.contactForm} target="_blank" rel="noopener noreferrer">Contact form</a>
            </p>
          )}
        </div>
      ))}
    </div>
  )
}