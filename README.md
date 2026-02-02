# Reflection - Personal Diary & Self-Discovery App

A comprehensive personal diary application for self-reflection, mood tracking, task management, and daily planning.

## Features

- **Diary Entries**: Create and manage personal reflections, personality analysis, and memory entries
- **Mood Tracking**: Track daily moods with intensity levels, triggers, and notes
- **Task Management**: Organize accomplished tasks with priorities and categories
- **Schedule Planning**: Plan your day with time-based schedule entries and daily plans
- **Secure Authentication**: Email/password authentication with Supabase
- **Private Data**: Row-level security ensures only you can access your data

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication)
- **Build Tool**: Vite
- **UI Components**: Lucide React icons

## Data Structure

### Tables
- `entries`: Store diary entries with type (reflection, analysis, memory)
- `moods`: Track daily mood with intensity (1-10)
- `tasks`: Manage tasks by category and priority
- `schedule_items`: Schedule daily plans and events
- `tags`: Organize entries with custom tags
- `entry_tags`: Link tags to diary entries

### Security
All tables use Row Level Security (RLS) to ensure users can only access their own data.
