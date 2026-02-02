import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Heart, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface Mood {
  id: string
  date: string
  primary_mood: string
  intensity: number
  description: string
  triggers: string
  notes: string
}

const moods = [
  { value: 'happy', label: '😊 Happy', color: '#fbbf24' },
  { value: 'sad', label: '😢 Sad', color: '#ef4444' },
  { value: 'anxious', label: '😰 Anxious', color: '#8b5cf6' },
  { value: 'calm', label: '😌 Calm', color: '#10b981' },
  { value: 'excited', label: '🤩 Excited', color: '#f97316' },
  { value: 'neutral', label: '😐 Neutral', color: '#6b7280' },
  { value: 'frustrated', label: '😤 Frustrated', color: '#dc2626' },
]

export function MoodTracker() {
  const [todayMood, setTodayMood] = useState<Mood | null>(null)
  const [selectedMood, setSelectedMood] = useState('happy')
  const [intensity, setIntensity] = useState(5)
  const [triggers, setTriggers] = useState('')
  const [notes, setNotes] = useState('')
  const [moodHistory, setMoodHistory] = useState<Mood[]>([])
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    loadMoodData()
  }, [])

  const loadMoodData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error

      const history = data || []
      setMoodHistory(history)

      const today_mood = history.find((m) => m.date === today)
      setTodayMood(today_mood || null)

      if (today_mood) {
        setSelectedMood(today_mood.primary_mood)
        setIntensity(today_mood.intensity)
        setTriggers(today_mood.triggers || '')
        setNotes(today_mood.notes || '')
      }
    } catch (err: any) {
      console.error('Error loading mood data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (todayMood) {
        const { error } = await supabase
          .from('moods')
          .update({
            primary_mood: selectedMood,
            intensity,
            triggers,
            notes,
          })
          .eq('id', todayMood.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('moods').insert({
          date: today,
          primary_mood: selectedMood,
          intensity,
          triggers,
          notes,
        })

        if (error) throw error
      }

      loadMoodData()
    } catch (err: any) {
      alert('Error saving mood: ' + err.message)
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading mood data...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Mood Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart size={24} className="text-red-500" />
            Today's Mood
          </h2>

          <form onSubmit={handleSaveMood} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                How are you feeling?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-2 rounded transition text-xs font-medium ${
                      selectedMood === mood.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Intensity: {intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Triggers
              </label>
              <input
                type="text"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                placeholder="What triggered this mood?"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
              Save Mood
            </button>
          </form>
        </div>
      </div>

      {/* Mood History */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} />
            Mood History
          </h2>

          {moodHistory.length === 0 ? (
            <p className="text-slate-400">No mood records yet.</p>
          ) : (
            <div className="space-y-3">
              {moodHistory.map((mood) => {
                const moodInfo = moods.find((m) => m.value === mood.primary_mood)
                return (
                  <div
                    key={mood.id}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{moodInfo?.label}</p>
                        <p className="text-xs text-slate-500">{mood.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-300">
                          {mood.intensity}/10
                        </div>
                      </div>
                    </div>

                    {mood.triggers && (
                      <p className="text-sm text-slate-300 mb-1">
                        <span className="font-medium">Triggers:</span> {mood.triggers}
                      </p>
                    )}

                    {mood.notes && (
                      <p className="text-sm text-slate-300">
                        <span className="font-medium">Notes:</span> {mood.notes}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
