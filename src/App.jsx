import { useEffect } from 'react'
import { supabase } from './services/supabaseClient'

function App() {
  useEffect(() => {
    async function testConnection() {
      // Write a test row
      const { error: insertError } = await supabase
        .from('test_table')
        .insert({ name: 'Hello from CleanBeach' })

      if (insertError) console.error('Insert error:', insertError)

      // Read it back
      const { data, error: selectError } = await supabase
        .from('test_table')
        .select('*')

      if (selectError) console.error('Select error:', selectError)
      else console.log('Data from Supabase:', data)
    }
    testConnection()
  }, [])

  return <div>Check your browser console for Supabase test results</div>
}

export default App