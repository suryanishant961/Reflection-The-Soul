import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Clock } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface ScheduleItem {
  id: string
  title: string
  description: string
  category: string
  status: string
  scheduled_date: string
  start_time: string | null
  end_time: string | null
}

export function SchedulePlanner() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      setScheduleItems(data || [])
    } catch (err: any) {
      console.error('Error loading schedule:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Title is required')
      return
    }

    try {
      const { error } = await supabase.from('schedule_items').insert({
        title,
        description,
        category,
        scheduled_date: scheduledDate,
        start_time: startTime || null,
        end_time: endTime || null,
      })

      if (error) throw error

      setTitle('')
      setDescription('')
      setCategory('personal')
      setScheduledDate(format(new Date(), 'yyyy-MM-dd'))
      setStartTime('')
      setEndTime('')
      setShowForm(false)
      loadSchedule()
    } catch (err: any) {
      alert('Error creating schedule item: ' + err.message)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('schedule_items')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      loadSchedule()
    } catch (err: any) {
      alert('Error updating status: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule item?')) return

    try {
      const { error } = await supabase.from('schedule_items').delete().eq('id', id)

      if (error) throw error

      loadSchedule()
    } catch (err: any) {
      alert('Error deleting item: ' + err.message)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-900/30'
      case 'health':
        return 'bg-green-900/30'
      case 'learning':
        return 'bg-purple-900/30'
      default:
        return 'bg-slate-700/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'in_progress':
        return 'text-yellow-400'
      case 'cancelled':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  // Group by date
  const groupedByDate = scheduleItems.reduce((acc, item) => {
    if (!acc[item.scheduled_date]) {
      acc[item.scheduled_date] = []
    }
    acc[item.scheduled_date].push(item)
    return acc
  }, {} as Record<string, ScheduleItem[]>)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* New Schedule Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-4">Schedule Entry</h2>

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
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

      {/* Schedule List */}
      <div className="lg:col-span-2">
        {loading ? (
          <div className="text-slate-400">Loading schedule...</div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No scheduled items yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-lg font-bold text-white mb-3">
                  {format(new Date(date), 'EEEE, MMMM dd')}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`${getCategoryColor(item.category)} border border-slate-600 rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-white">{item.title}</p>
                          {item.start_time && (
                            <p className="text-sm text-slate-300 flex items-center gap-1 mt-1">
                              <Clock size={16} />
                              {item.start_time}
                              {item.end_time && ` - ${item.end_time}`}
                            </p>
                          )}
                        </div>
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded bg-slate-700 border border-slate-600 focus:outline-none ${getStatusColor(item.status)}`}
                        >
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {item.description && (
                        <p className="text-sm text-slate-300 mb-2">{item.description}</p>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded capitalize">
                          {item.category}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
