import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
]

function buildTemplateLetter(campaign, userName, repName) {
  return `Dear ${repName || '[Representative Name]'},

My name is ${userName || '[Your Name]'}, and I am writing to urge your support for action on the following issue:

${campaign.title}

${campaign.policy_ask}

${campaign.description ? campaign.description + '\n\n' : ''}This matters to me and to many others in our community — as of today, ${campaign.signatureCount || 'a growing number of'} people have signed a petition in support of this cause through CleanBeach, a community environmental platform.

I would appreciate the opportunity to discuss this further, and I hope you will consider taking action on this issue.

Thank you for your time and service.

Sincerely,
${userName || '[Your Name]'}`
}

export default function ContactRep() {
  const { id } = useParams()
  const { user } = useAuth()

  const [campaign, setCampaign] = useState(null)
  const [signatureCount, setSignatureCount] = useState(0)
  const [userName, setUserName] = useState('')
  const [state, setState] = useState('')
  const [reps, setReps] = useState([])
  const [selectedRep, setSelectedRep] = useState(null)
  const [letter, setLetter] = useState('')
  const [loadingReps, setLoadingReps] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)

    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    const { count } = await supabase
      .from('campaign_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', id)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    setCampaign(campaignData)
    setSignatureCount(count || 0)
    setUserName(profileData?.name || '')
    setLoading(false)
  }

  async function handleFindReps(e) {
    e.preventDefault()
    if (!state) return
    setLoadingReps(true)

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
            email: term.contact_form || null,
            website: term.url
          }
        })

      setReps(matches)
    } catch (err) {
      console.error(err)
    }

    setLoadingReps(false)
  }

  function pickRep(rep) {
    setSelectedRep(rep)
    setLetter(buildTemplateLetter({ ...campaign, signatureCount }, userName, rep.name))
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>
  if (!campaign) return <p style={{ padding: 40 }}>Campaign not found.</p>

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <p><Link to={`/campaigns/${id}`}>&larr; Back to Campaign</Link></p>
      <h1>Contact Your Representative</h1>
      <p style={{ color: '#555' }}>Regarding: <strong>{campaign.title}</strong></p>

      {!selectedRep && (
        <>
          <form onSubmit={handleFindReps} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
            <select value={state} onChange={e => setState(e.target.value)} required>
              <option value="">Select your state</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" disabled={loadingReps}>
              {loadingReps ? 'Searching...' : 'Find Representatives'}
            </button>
          </form>

          {reps.map((r, i) => (
            <div key={i} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{r.name}</strong>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>{r.role}</div>
              </div>
              <button onClick={() => pickRep(r)}>Write to them</button>
            </div>
          ))}
        </>
      )}

      {selectedRep && (
        <div>
          <p>Writing to: <strong>{selectedRep.name}</strong> ({selectedRep.role})</p>
          <label style={{ fontSize: '0.85rem' }}>Edit your letter before sending:</label>
          <textarea
            value={letter}
            onChange={e => setLetter(e.target.value)}
            rows={14}
            style={{ width: '100%', fontFamily: 'inherit', marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => { navigator.clipboard.writeText(letter) }}>
              📋 Copy Letter
            </button>
            {selectedRep.website && (
              <a href={selectedRep.website} target="_blank" rel="noopener noreferrer">
                <button type="button">🔗 Go to Their Contact Form</button>
              </a>
            )}
            <button onClick={() => setSelectedRep(null)}>Choose a Different Representative</button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 10 }}>
            Most representatives require messages to be submitted through their official contact form rather
            than direct email — copy your letter and paste it into their form using the link above.
          </p>
        </div>
      )}
    </div>
  )
}