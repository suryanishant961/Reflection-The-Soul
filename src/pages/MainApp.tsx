import React, { useState } from 'react'
import { BookOpen, Heart, CheckSquare, Calendar, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DiaryEntries } from '../components/DiaryEntries'
import { MoodTracker } from '../components/MoodTracker'
import { TaskTracker } from '../components/TaskTracker'
import { SchedulePlanner } from '../components/SchedulePlanner'

type Tab = 'entries' | 'mood' | 'tasks' | 'schedule'

export function MainApp({ session }: { session: any }) {
  const [activeTab, setActiveTab] = useState<Tab>('entries')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const tabs = [
    { id: 'entries' as Tab, label: 'Reflections', icon: BookOpen },
    { id: 'mood' as Tab, label: 'Mood', icon: Heart },
    { id: 'tasks' as Tab, label: 'Tasks', icon: CheckSquare },
    { id: 'schedule' as Tab, label: 'Schedule', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reflection</h1>
            <p className="text-slate-400 text-sm">Personal Diary & Self-Discovery</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'entries' && <DiaryEntries />}
        {activeTab === 'mood' && <MoodTracker />}
        {activeTab === 'tasks' && <TaskTracker />}
        {activeTab === 'schedule' && <SchedulePlanner />}
      </main>
    </div>
  )
}
