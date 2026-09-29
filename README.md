# Smart Study Planner & Focus Tracker 🚀

A comprehensive web-based application designed to help students manage their academic workflow efficiently. Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and integrated with **Google Gemini AI** for an enhanced learning experience.

🌐 **Live Demo:** [https://smart-study-planner-mernstack.vercel.app/](https://smart-study-planner-mernstack.vercel.app/)

---

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

---

## 🚀 Getting Started (Run Locally)

To run this project locally on your machine, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/the-coder-Sumit/Smart-Study-Planner-mernstack.git
cd Smart-Study-Planner-mernstack
```

### 2. Set Up Environment Variables
You need to create a `.env` file in both the `client` and `server` directories. 
Refer to the `.env.example` files in each directory for the required API keys (Google Gemini, Google Auth Client ID) and your MongoDB URI.

### 3. Install Dependencies & Run

**Step A: Start the Backend Server**
Open a terminal and run:
```bash
cd server
npm install
node index.js
```
*The server will start running on http://localhost:5000*

**Step B: Start the Frontend React App**
Open a new, separate terminal and run:
```bash
cd client
npm install
npm start
```
*The React app will open in your browser at http://localhost:3000*

---

## 👨‍💻 Developer
Developed by **Sumit Kumar**.
