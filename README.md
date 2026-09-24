# Smart Study Planner & Focus Tracker 🚀

A comprehensive web-based application designed to help students manage their academic workflow efficiently. Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and integrated with **Google Gemini AI** for an enhanced learning experience.

## ✨ Key Features

- 📅 **Kanban Task Manager:** Drag-and-drop board for visually organizing study tasks into Pending, In Progress, and Completed states.
- ⏱️ **Pomodoro Focus Timer:** Built-in study timer with customizable focus and break sessions. Runs globally in the background so you can navigate the app without losing your focus state.
- 🤖 **AI-Assisted Quiz & Flashcards:** Uses Google Gemini AI APIs to automatically parse uploaded study materials (PDFs/Images) and generate interactive Multiple Choice Questions (MCQs).
- 🏆 **Gamified Leaderboard:** Compete with others globally! Earn points and increase your study streak for every focused Pomodoro session completed.
- 🔐 **Secure Authentication:** JWT & bcrypt password hashing, along with Google OAuth 2.0 integration for seamless third-party login.
- 📊 **Analytics Dashboard:** Generate downloadable PDF reports of user progress using Chart.js.

## 🛠️ Tech Stack

- **Frontend:** React.js, CSS3, Chart.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT, Google OAuth 2.0
- **AI Integration:** Google Gemini API

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
\\\ash
git clone https://github.com/the-coder-Sumit/Smart-Study-Planner-mernstack.git
cd Smart-Study-Planner-mernstack
\\\

### 2. Environment Variables
Create a \.env\ file in both the \client\ and \server\ directories. Refer to the \.env.example\ files in each directory for the required API keys and database URIs.

### 3. Install Dependencies & Run

**For Backend (Server):**
\\\ash
cd server
npm install
npm start
\\\

**For Frontend (Client):**
\\\ash
cd client
npm install
npm start
\\\

The application will be running at \http://localhost:3000\.

## 👨‍💻 Developer
Developed by Sumit Kumar.
