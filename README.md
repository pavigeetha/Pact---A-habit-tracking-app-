# PACT - Social Habit Tracking App

A group-first, socially-aware habit tracking system that transforms habits from private tasks into a shared social experience. Built with gamification, peer validation, and real accountability.

## The Problem

Existing habit tracking apps are:
- Private and easy to ignore
- Lack accountability and consequences
- Allow inconsistent or fake tracking
- Users lose motivation after failures with no recovery system

## Our Solution

Pact replaces passive habit tracking with an **active social accountability system** by focusing on:

- **Visibility** — Habits are shared commitments visible to your group
- **Validation** — Group members collectively verify completion (peer voting)
- **Gamification** — Castle-building, attack system, leaderboards, and reputation levels
- **Recovery** — Positive reinforcement and group momentum instead of toxic penalties

## Behavioral Psychology

| Principle | Application |
|-----------|-------------|
| **Hawthorne Effect** | People perform better when actions are visible to peers |
| **Commitment Devices** | Public commitments create social contracts harder to break |
| **Positive Reinforcement** | Celebration and recovery systems sustain long-term behavior |
| **Social Identity** | Group membership creates identity-based motivation beyond willpower |

## Features

### Hybrid Habit System
- **Private Habits** — Self-validated, tracked by daily streaks
- **Group Habits** — Peer-validated, tracked by group HP (points)
- Majority of group members must approve for a habit to be marked complete

### Castle / Base System
- Every group has a base that grows as members complete habits
- 6 levels: Village -> Town -> Castle -> Fortress -> Kingdom -> Empire
- SVG castle visually evolves — towers, walls, flags, and golden roofs appear as you level up
- HP bar shows progress toward the next level

### Attack System
- Groups can attack other groups on the leaderboard
- If your HP > target HP, they lose points; otherwise you lose points
- Incentivizes consistent habit completion to strengthen your base

### Global Leaderboard
- All groups ranked by HP (points)
- Top 5 displayed with progress bars
- Your group highlighted with "YOU" badge
- Points increase on habit completion (+5), decrease on missed habits

### Clubs
- Community spaces for people with similar goals (reading, fitness, coding, etc.)
- Browse by category, search, create, and join clubs
- Clubs contain groups for organized accountability
- Weekly challenges within clubs — create, join, and complete

### Reputation & Levels
| Level | Title | Min Rep | Reward |
|-------|-------|---------|--------|
| 1 | Seedling | 0 | Welcome to Pact |
| 2 | Sprout | 25 | Custom avatar border |
| 3 | Bloomer | 75 | Club creation unlocked |
| 4 | Warrior | 150 | Challenge creation unlocked |
| 5 | Champion | 300 | Gold profile badge |
| 6 | Legend | 500 | Legendary title |

### Achievements
- Fire Starter (3-day streak)
- Unstoppable (7-day streak)
- Team Carrier (+50 HP contributed)
- Social Butterfly (join 3 groups)
- Dedicated (50 completions)
- Legend (reach Lv.6)

### Profile
- Weekly activity circles (Mon-Sun)
- Performance stats: consistency, streak, HP contributed, weekly completion
- Achievement grid with locked/unlocked states
- Level progression with rewards display

### Notifications
- Context-aware social nudges triggered by group activity
- Dismissible notification banners

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Routing | React Router 7 |
| Backend | Express 5 (Node.js) |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT (jsonwebtoken + bcryptjs) |
| Notifications | react-hot-toast |

## Project Structure

```
pact/
├── public/
│   └── favicon.svg
├── server/                    # Express backend
│   ├── index.js               # Server entry, route registration
│   ├── lib/supabase.js        # Supabase admin client
│   ├── middleware/auth.js     # JWT sign/verify middleware
│   └── routes/
│       ├── auth.js            # Register, login, me
│       ├── dashboard.js       # Aggregated dashboard data
│       ├── groups.js          # Group CRUD, join, members
│       ├── habits.js          # Habit CRUD, check-in, voting
│       ├── clubs.js           # Club CRUD, challenges
│       ├── leaderboard.js     # Global group rankings
│       ├── profile.js         # User profile, streaks
│       ├── notifications.js   # Nudge system
│       └── ai.js              # Gemini AI club advisor
├── src/                       # React frontend
│   ├── App.jsx                # Route definitions
│   ├── main.jsx               # App entry point
│   ├── index.css              # Tailwind + custom styles
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state management
│   ├── lib/
│   │   ├── api.js             # Fetch wrapper with JWT
│   │   └── levels.js          # Group HP & user rep levels
│   ├── components/
│   │   ├── Navbar.jsx         # Top navigation
│   │   ├── ProtectedRoute.jsx # Auth guard
│   │   ├── CastleVisual.jsx   # SVG castle (level-based)
│   │   ├── GlobalLeaderboard.jsx
│   │   ├── PactMembers.jsx    # Group member stats
│   │   ├── AttackSystem.jsx   # Group vs group attacks
│   │   ├── PerformanceCard.jsx # User stats + weekly overview
│   │   └── AiAdvisor.jsx      # Gemini AI chat widget
│   └── pages/
│       ├── Landing.jsx        # Marketing page
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx      # Main dashboard
│       ├── Group.jsx          # Group detail
│       ├── CreateGroup.jsx    # Group creation wizard
│       ├── JoinGroup.jsx      # Join via invite code
│       ├── Clubs.jsx          # Club discovery
│       ├── ClubDetail.jsx     # Club detail
│       ├── Profile.jsx        # User profile + achievements
│       └── Settings.jsx       # App settings
└── supabase/
    ├── schema.sql             # Base database schema
    ├── migration.sql          # JWT auth + triggers
    └── migration_v2_clubs.sql # Clubs, challenges, points log
```

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/pavigeetha/Pact---A-habit-tracking-app-.git
cd Pact---A-habit-tracking-app-
npm install
```

### 2. Database Setup

In the Supabase SQL Editor, run these files in order:
1. `supabase/schema.sql` — Base tables (profiles, clubs, groups, habits, etc.)
2. `supabase/migration.sql` — JWT auth fields, triggers, invite codes
3. `supabase/migration_v2_clubs.sql` — Club members, challenges, points log

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your-secret-key
PORT=3001

GEMINI_API_KEY=your_gemini_key  # Optional, for AI advisor
```

Find your Supabase keys at: **Project Settings -> API**

### 4. Run

```bash
npm run dev
```

This starts both:
- **Frontend** on `http://localhost:5173`
- **Backend** on `http://localhost:3001`

The Vite proxy forwards `/api` requests to the backend, so only port 5173 is needed.

### 5. Access from Other Devices

Devices on the same WiFi can access via your local IP:

```
http://<your-local-ip>:5173
```

Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full dashboard data |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | List user's groups |
| GET | `/api/groups/:id` | Group detail |
| POST | `/api/groups` | Create group with habits |
| POST | `/api/groups/join` | Join by invite code |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/habits` | Create private habit |
| POST | `/api/habits/group/:id` | Add habits to group |
| POST | `/api/habits/:id/log` | Check-in a habit |
| POST | `/api/habits/logs/:id/vote` | Vote approve/reject |

### Clubs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clubs` | List public clubs |
| GET | `/api/clubs/:id` | Club detail |
| POST | `/api/clubs` | Create club |
| POST | `/api/clubs/:id/join` | Join club |
| DELETE | `/api/clubs/:id/leave` | Leave club |
| POST | `/api/clubs/:id/challenges` | Create weekly challenge |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/groups` | Global group rankings |
| GET | `/api/profile` | User profile + streaks |
| GET | `/api/notifications` | Unread notifications |

## Database Schema

### Core Tables
- **profiles** — Users with email, password hash, name
- **groups** — Habit groups with invite codes
- **group_members** — Group membership
- **habits** — Private or group habits with validation type (self/peer)
- **habit_logs** — Daily check-ins with status (pending/approved/rejected/self_completed)
- **approvals** — Peer votes on habit logs

### Gamification Tables
- **reputation_scores** — User reputation points
- **group_points** — Group HP (health points)
- **group_points_log** — Audit trail for point changes

### Social Tables
- **clubs** — Interest-based communities
- **club_members** — Club membership with roles
- **club_challenges** — Weekly challenges
- **challenge_participants** — Challenge enrollment/completion
- **notifications** — Social nudges

### Database Triggers
- Auto-validate self-reported habits on insert
- Update streaks on validated check-ins
- Award reputation points on completion (+5)
- Add group HP on group habit completion (+5)
- Check peer approval threshold (majority vote)
- Penalize rejected check-ins (-10 reputation)
- Generate social nudge notifications on completion

## Existing Solutions Analyzed

| App | Limitation | How Pact Solves It |
|-----|-----------|-------------------|
| **Habitica** | Gamification-focused, limited real accountability | Real peer validation + group consequences |
| **HabitShare** | Social sharing without enforcement | Mandatory peer approval for group habits |
| **Streaks** | Individual tracking, no group dependency | Group-first design with shared HP |
| **Loop Habit Tracker** | No social features | Built around social accountability |

## License

MIT
