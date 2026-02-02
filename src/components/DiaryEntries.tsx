import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Entry {
  id: string
  title: string
  content: string
  entry_type: string
  created_at: string
}

export function DiaryEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('reflection')
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err: any) {
      console.error('Error loading entries:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }

    try {
      const { error } = await supabase.from('entries').insert({
        title,
        content,
        entry_type: type,
      })

      if (error) throw error

      setTitle('')
      setContent('')
      setType('reflection')
      setShowForm(false)
      loadEntries()
    } catch (err: any) {
      alert('Error creating entry: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase.from('entries').delete().eq('id', id)

      if (error) throw error

      loadEntries()
      setSelectedEntry(null)
    } catch (err: any) {
      alert('Error deleting entry: ' + err.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-4">New Reflection</h2>

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="reflection">Self Reflection</option>
                  <option value="analysis">Personality Analysis</option>
                  <option value="memory">Memory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entry title..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind..."
                  rows={6}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
              <Plus size={20} />
              New Entry
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="lg:col-span-2">
        {loading ? (
          <div className="text-center text-slate-400">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No entries yet. Start journaling!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-pointer transition hover:border-blue-600 ${
                  selectedEntry?.id === entry.id ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {entry.entry_type}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-2">{entry.content}</p>
              </div>
            ))}
          </div>
        )}

        {selectedEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedEntry.title}</h2>
              <p className="text-slate-500 text-sm mb-4">
                {formatDistanceToNow(new Date(selectedEntry.created_at), { addSuffix: true })}
              </p>
              <p className="text-slate-300 whitespace-pre-wrap mb-6">{selectedEntry.content}</p>

              <div className="flex justify-between">
                <button
                  onClick={() => handleDelete(selectedEntry.id)}
                  className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-300 font-medium py-2 px-4 rounded transition"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 px-6 rounded transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
