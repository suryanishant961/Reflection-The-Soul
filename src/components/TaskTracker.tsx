import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Check } from 'lucide-react'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: number
  completed_at: string | null
  scheduled_date: string
  created_at: string
}

export function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [priority, setPriority] = useState(0)
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (err: any) {
      console.error('Error loading tasks:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Task title is required')
      return
    }

    try {
      const { error } = await supabase.from('tasks').insert({
        title,
        description,
        category,
        priority,
        scheduled_date: scheduledDate,
      })

      if (error) throw error

      setTitle('')
      setDescription('')
      setCategory('personal')
      setPriority(0)
      setScheduledDate(format(new Date(), 'yyyy-MM-dd'))
      setShowForm(false)
      loadTasks()
    } catch (err: any) {
      alert('Error creating task: ' + err.message)
    }
  }

  const toggleComplete = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed_at: task.completed_at ? null : new Date().toISOString(),
        })
        .eq('id', task.id)

      if (error) throw error

      loadTasks()
    } catch (err: any) {
      alert('Error updating task: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error

      loadTasks()
    } catch (err: any) {
      alert('Error deleting task: ' + err.message)
    }
  }

  const incompleteTasks = tasks.filter((t) => !t.completed_at)
  const completedTasks = tasks.filter((t) => t.completed_at)

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2:
        return 'bg-red-900/30 border-red-700'
      case 1:
        return 'bg-yellow-900/30 border-yellow-700'
      default:
        return 'bg-slate-700/30 border-slate-600'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 2:
        return 'High'
      case 1:
        return 'Medium'
      default:
        return 'Low'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* New Task Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sticky top-24">
          <h2 className="text-xl font-bold text-white mb-4">Add Task</h2>

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Task
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
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
                  placeholder="Task details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>Low</option>
                    <option value={1}>Medium</option>
                    <option value={2}>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
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
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="lg:col-span-2">
        {loading ? (
          <div className="text-slate-400">Loading tasks...</div>
        ) : (
          <div className="space-y-6">
            {/* Incomplete Tasks */}
            {incompleteTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Active Tasks</h3>
                <div className="space-y-2">
                  {incompleteTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border border-slate-600 rounded-lg p-4 ${getPriorityColor(task.priority)} flex items-start gap-3`}
                    >
                      <button
                        onClick={() => toggleComplete(task)}
                        className="mt-1 text-slate-400 hover:text-slate-300 transition"
                      >
                        <div className="w-5 h-5 border-2 border-slate-400 rounded hover:border-slate-300" />
                      </button>

                      <div className="flex-1">
                        <p className="font-medium text-white">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-slate-300 mt-1">{task.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                            {task.category}
                          </span>
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                            {getPriorityLabel(task.priority)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(task.scheduled_date), 'MMM dd')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-400 mb-3">
                  Completed ({completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 flex items-start gap-3 opacity-60"
                    >
                      <button
                        onClick={() => toggleComplete(task)}
                        className="mt-1 text-green-500"
                      >
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      </button>

                      <div className="flex-1">
                        <p className="font-medium text-slate-300 line-through">{task.title}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Completed {format(new Date(task.completed_at!), 'MMM dd')}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incompleteTasks.length === 0 && completedTasks.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-400">No tasks yet. Start planning!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
