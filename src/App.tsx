import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './pages/Auth'
import { MainApp } from './pages/MainApp'

export function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Reflection</h1>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return session ? <MainApp session={session} /> : <Auth />
}
