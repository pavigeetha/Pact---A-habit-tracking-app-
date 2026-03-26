<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License" />
</p>

# 🏰 PACT — Gamified Social Habit Tracker

**PACT** is a gamified accountability platform where friends form teams ("pacts"), build habits together, and defend their virtual bases through consistent daily action. Complete habits to gain HP, attack rival teams, and climb the leaderboard — all while holding each other accountable.

> _"Alone we can do so little; together we can do so much."_ — Helen Keller

---

## 📸 Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="400"/><br/><em>Dashboard — HP, Habits & Base</em></td>
    <td><img src="docs/screenshots/castle-fortress.png" alt="Castle" width="400"/><br/><em>Dynamic Fortress (Lv.3)</em></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/group-habits.png" alt="Group Habits" width="400"/><br/><em>Group Habits & Approval System</em></td>
    <td><img src="docs/screenshots/leaderboard-attack.png" alt="Leaderboard" width="400"/><br/><em>Leaderboard & Attack System</em></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/clubs.png" alt="Clubs" width="400"/><br/><em>Explore Clubs & Communities</em></td>
    <td><img src="docs/screenshots/profile.png" alt="Profile" width="400"/><br/><em>Profile & Achievements</em></td>
  </tr>
</table>

---

## ✨ Features

### 🎮 Core Gameplay

| Feature | Description |
|---------|-------------|
| **Base HP System** | Each pact has a shared base with HP. Complete habits → +10 HP. Miss habits → -15 HP. Reach 0 HP → Revival mode. |
| **Dynamic Fortress** | Your base visually grows from a tiny hut (Lv.1) to a full citadel (Lv.5) based on your team's HP. |
| **Attack System** | Attack rival pacts with lower HP. Max 2 attacks/day. No repeat attacks on the same target. |
| **Shield Mechanic** | Earn shields through streaks to protect your base from attacks. |
| **Revival Mode** | If HP hits 0, complete 3 habits in a row to revive your base to 50 HP. |
| **Leaderboard** | Real-time rankings of all pacts by HP. See who's on top. |

### 📋 Habit Management

| Feature | Description |
|---------|-------------|
| **Private & Group Habits** | Create habits just for yourself, or share them across your entire pact. |
| **Peer Approval** | Completed habits require approval from a group member before being confirmed. No cheating! |
| **Frequency Scheduling** | Set habits as Daily, 5x/week, 3x/week, 2x/week, 1x/week, or custom days (Mon-Sun picker). |
| **Reminder Notifications** | Set reminder times (06:00–22:00). Browser push notifications nudge you when habits are pending. |
| **Group Visibility** | See all group members' habits, their progress bars, and who's slacking off. |
| **Slacker Alerts** | Automatic warnings when teammates miss multiple habits. Notifications sent to the group. |

### 🏛️ Clubs & Communities

| Feature | Description |
|---------|-------------|
| **Explore Clubs** | Browse interest-based communities (Fitness, Book Reading, Art, Coding, etc.). |
| **Club-Specific Habits** | Each club has its own habit list — separate from your main pact habits. |
| **Club Leaderboard** | Squad rankings within each club with points, streaks, and HP tracking. |
| **Real-World Rewards** | Earn points and claim rewards (gym passes, book vouchers, etc.) from club partners. |
| **Tabbed Dashboard** | Each club has Overview, Habits, and Rewards tabs for organized navigation. |

### 🎨 Multi-Pact & Profile

| Feature | Description |
|---------|-------------|
| **Join Multiple Pacts** | Be part of multiple accountability groups simultaneously. |
| **Pact Switching** | Seamlessly switch between pacts from your profile. |
| **Achievement System** | Earn badges: First Blood, Streak Master, Social Butterfly (2+ pacts), and more. |
| **Performance Stats** | Weekly activity charts, consistency rates, and contribution tracking. |
| **AI Insights** | Smart suggestions based on your habit patterns and team performance. |

### 🎭 Theming

| Theme | Aesthetic |
|-------|-----------|
| **Cottagecore / Cherry Blossom** | Warm pastels, medieval fortress, cozy green tones |
| **Midnight / Cyberpunk** | Dark mode, neon accents, futuristic cityscape base |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 6 |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS (70k+ lines, custom design system) |
| **State** | React Context + useReducer |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **Notifications** | Web Notifications API |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- A [Supabase](https://supabase.com/) project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/pact-frontend.git
cd pact-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Demo Mode

Don't have Supabase set up? No problem — click **"Continue as Demo"** on the login page to explore all features with mock data.

---

## 🗄️ Database Schema (Supabase)

If you're connecting to Supabase, run the following SQL to set up your tables:

```sql
-- Users profile extension
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  contribution INT DEFAULT 0,
  consistency FLOAT DEFAULT 0,
  streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Groups (Pacts)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  hp INT DEFAULT 100,
  max_hp INT DEFAULT 100,
  streak INT DEFAULT 0,
  shield_active BOOLEAN DEFAULT false,
  shield_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Group membership (many-to-many)
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  status TEXT DEFAULT 'pending', -- pending, completed, missed
  is_group_habit BOOLEAN DEFAULT false,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity log (attacks, etc.)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'attack', 'defend', 'habit_complete', etc.
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies (simplified)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Group members can view groups" ON groups FOR SELECT USING (
  id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own habits" ON habits FOR ALL USING (user_id = auth.uid());
```

---

## 📁 Project Structure

```
pact-frontend/
├── public/                  # Static assets
├── docs/
│   └── screenshots/         # README screenshots
├── src/
│   ├── components/
│   │   ├── ActivityChart.jsx      # Weekly activity visualization
│   │   ├── AnimatedBase.jsx       # Dynamic fortress SVG (Lv.1–5)
│   │   ├── AttackPanel.jsx        # Attack system UI
│   │   ├── BaseHealth.jsx         # HP display with animations
│   │   ├── ClubBrowser.jsx        # Club discovery & joining
│   │   ├── ClubDashboard.jsx      # Club detail view with habits
│   │   ├── GroupSetup.jsx         # Pact creation/join flow
│   │   ├── HabitList.jsx          # Habit CRUD + approval + scheduling
│   │   ├── InsightsPanel.jsx      # AI-powered suggestions
│   │   ├── Leaderboard.jsx        # Global pact rankings
│   │   ├── LoginPage.jsx          # Auth + demo mode
│   │   ├── PerformanceStats.jsx   # User stat cards
│   │   ├── ProfilePage.jsx        # User profile + multi-pact view
│   │   ├── SettingsPage.jsx       # Theme switcher
│   │   ├── TeamDashboard.jsx      # Pact members overview
│   │   └── ToastContainer.jsx     # Notification toasts
│   ├── context/
│   │   ├── GameContext.jsx        # Global state (reducer + actions)
│   │   └── ThemeContext.jsx       # Theme management
│   ├── data/
│   │   ├── clubData.js           # Club definitions & rewards
│   │   └── mockData.js           # Demo mode constants
│   ├── lib/
│   │   ├── api.js                # Supabase API functions
│   │   └── supabase.js           # Supabase client init
│   ├── App.jsx                   # Main layout + routing
│   ├── index.css                 # Full design system (70k+ lines)
│   └── main.jsx                  # React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Game Mechanics Deep Dive

### HP System
```
Complete a habit    → +10 HP (capped at max)
Miss a habit        → -15 HP
Attack landed       → -20 HP to target
Shield blocks       → 50% damage reduction
HP reaches 0        → Revival Mode activated
Revival (3 streak)  → Restores to 50 HP
```

### Fortress Levels
| Level | HP Range | Visual | Name (Cottage) | Name (Cyber) |
|-------|----------|--------|-----------------|--------------|
| 1 | 0–20% | Tiny hut | Outpost | Terminal |
| 2 | 21–40% | Walls + keep | Camp | Hub |
| 3 | 41–60% | Side towers | Fortress | Station |
| 4 | 61–80% | Extra sections | Stronghold | Nexus |
| 5 | 81–100% | Full citadel | Citadel | Core |

### Attack Rules
- You can only attack pacts with **lower HP** than yours
- Maximum **2 attacks per day**
- Cannot attack the **same target** more than once per day
- Each attack deals **20 damage** to the target's base

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the PACT team<br/>
  <em>Make habits stick. Together.</em>
</p>
