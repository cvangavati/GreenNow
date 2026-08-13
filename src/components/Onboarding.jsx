import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

const STEPS = [
  {
    title: 'Welcome to GreenNow 🌱',
    body: 'GreenNow connects people who want to organize environmental cleanups with people who want to help. Let\'s show you around in a few quick steps.'
  },
  {
    title: 'Report or schedule a cleanup',
    body: 'See a polluted site? Report it in seconds from the Bulletin. Ready to organize a cleanup yourself? Post a full event with a date and volunteer count — anyone can adopt an unclaimed report and turn it into a real event.'
  },
  {
    title: 'Join and track cleanups',
    body: 'Browse the Bulletin to find cleanups near you and RSVP. Any logged-in volunteer can update a cleanup\'s status and post progress notes — it\'s a shared board, not a one-person job.'
  },
  {
    title: 'Share updates in the Feed',
    body: 'Post milestones, photos, or advocacy updates to the community Feed. Like and comment on posts from others, and link posts to specific groups or cleanups.'
  },
  {
    title: 'Find your people in Groups',
    body: 'Join or create a Group around a cause or region to organize with people near you — group pages show their own filtered bulletin and feed.'
  },
  {
    title: 'You\'re ready to go!',
    body: 'Explore the Map to see cleanups near you, check the Gallery for real before/after results, or jump straight into posting your first update.'
  }
]

export default function Onboarding({ onComplete }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [finishing, setFinishing] = useState(false)

  const isLastStep = step === STEPS.length - 1

  async function handleFinish() {
    setFinishing(true)
    await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id)
    setFinishing(false)
    onComplete()
  }

  function handleSkip() {
    handleFinish()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 30, 27, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div className="page-card" style={{ maxWidth: 440, width: '100%' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= step ? 'var(--brand)' : 'var(--border)'
              }}
            />
          ))}
        </div>

        <h2 id="onboarding-title">{STEPS[step].title}</h2>
        <p className="form-help-text" style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
          {STEPS[step].body}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <button type="button" className="site-nav__button" onClick={handleSkip} disabled={finishing}>
            Skip
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button type="button" className="site-nav__button" onClick={() => setStep(s => s - 1)}>
                Back
              </button>
            )}
            {!isLastStep ? (
              <button type="button" className="form-submit" onClick={() => setStep(s => s + 1)}>
                Next
              </button>
            ) : (
              <button type="button" className="form-submit" onClick={handleFinish} disabled={finishing}>
                {finishing ? 'Finishing…' : 'Get started'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}