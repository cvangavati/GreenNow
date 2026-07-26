import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [sigCounts, setSigCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    setLoading(true)
    const { data: campaignData, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      setLoading(false)
      return
    }
    setCampaigns(campaignData)

    const { data: sigData } = await supabase
      .from('campaign_signatures')
      .select('campaign_id')

    const counts = {}
    sigData?.forEach(s => {
      counts[s.campaign_id] = (counts[s.campaign_id] || 0) + 1
    })
    setSigCounts(counts)

    setLoading(false)
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 700, margin: '0 auto' }}>
      <h1>Advocacy Campaigns</h1>
      <p><Link to="/create-campaign">+ Create a Campaign</Link></p>

      {loading && <p>Loading campaigns...</p>}
      {!loading && campaigns.length === 0 && <p>No campaigns yet.</p>}

      {campaigns.map(c => (
        <div key={c.id} style={{ border: '1px solid #ccc', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <h3 style={{ margin: '4px 0' }}>
            <Link to={`/campaigns/${c.id}`}>{c.title}</Link>
          </h3>
          <p style={{ margin: '4px 0', color: '#555' }}>{c.description}</p>
          <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#d98c2b', fontWeight: 600 }}>
            ✍️ {sigCounts[c.id] || 0} signature{(sigCounts[c.id] || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      ))}
    </div>
  )
}