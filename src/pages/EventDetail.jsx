import { useParams } from 'react-router-dom'

export default function EventDetail() {
  const { id } = useParams()
  return (
    <div style={{ padding: 40 }}>
      <h1>Event Detail</h1>
      <p>Details for event ID: {id} will appear here. (Coming in Week 2.)</p>
    </div>
  )
}