# Focus Beats 🧘‍♂️🍎

Focus Beats is a minimalist, high-productivity Pomodoro timer app designed to help you stay in the flow. Featuring a clean "Glassmorphism" aesthetic, it combines the proven Pomodoro technique with a calming Lo-Fi background loop to create the perfect deep-work environment.

## ✨ Features

- **Pomodoro Timer**: Classic 25-minute focus and 5-minute break intervals.
- **Glassmorphism UI**: A modern, frosted-glass design that's easy on the eyes.
- **Lo-Fi Ambient Loop**: Toggle a relaxing background loop and visualizer to drown out distractions.
- **Session Tracking**: Automatically logs your completed focus sessions to a database.
- **Daily Stats**: See how many sessions you've knocked out today.
- **Confetti Celebrations**: A little spark of joy every time you finish a session.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/focus-beats.git
   cd focus-beats
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your database URL:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/focus_beats
   ```

4. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

5. **Run the App**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5000`.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Icons**: Lucide React

## 📖 Learn the Logic

If you're looking to understand how the timer works, check out `client/src/pages/Home.tsx`. The code is heavily commented to explain the relationship between `setInterval`, React state, and side effects.

## 📝 License

MIT
