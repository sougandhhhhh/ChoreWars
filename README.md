# ⚔️ ChoreWars

ChoreWars is a high-stakes, competitive chore management system designed to gamify household responsibilities. It transforms mundane tasks into a quest for glory, complete with real-time analytics, skill distributions, and a roommate leaderboard.

## 🚀 Key Features

*   **Gamified Chores**: Earn points and level up by completing household tasks.
*   **Skill Distribution**: A dynamic radar chart tracking your proficiency in 6 categories:
    *   🗑️ **Waste**: Trash and recycling management.
    *   💧 **Water**: Refilling and maintaining water supplies.
    *   🍳 **Kitchen**: Dishes, surfaces, and organization.
    *   🚿 **Bathroom**: Deep cleaning and hygiene maintenance.
    *   🏠 **House**: General tidying and common area maintenance.
    *   ✨ **Extra Chores**: Custom reward-based tasks for bonus points.
*   **Roommate Dashboard**: Compare lifetime stats and rankings with your roommates in real-time.
*   **Interactive Calendar**: Visual history of your daily activities and contributions.
*   **Reward Polling**: Propose extra chores and let the community vote on the reward points.

## 🛠️ Technology Stack

*   **Frontend**: Next.js (App Router), React, Tailwind CSS
*   **State Management**: Zustand (History-driven analytics)
*   **Icons**: Lucide React
*   **Visuals**: Custom SVG Radar Charts and high-fidelity UI components.

## 📦 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/sougandhhhhh/ChoreWars.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Open the app**: Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Analytics Engine

ChoreWars uses a **unified history-based calculation model**. Every statistic on the dashboard is derived directly from the immutable activity log, ensuring 100% accuracy and preventing data drift between different modules.

---
*Created with ❤️ for better living.*
