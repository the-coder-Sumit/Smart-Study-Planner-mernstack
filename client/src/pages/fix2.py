import glob
import re

for file in glob.glob('*.js'):
    if file in ['App.js', 'Login.js', 'Register.js', 'ForgotPassword.js', 'QuizViewer.js']: continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = re.sub(r'<h2>.*? Study Planner</h2>', '<h2>📚 Study Planner</h2>', content)
    
    content = re.sub(r'(<Link to="/dashboard".*?>).*? Dashboard</Link>', r'\g<1>🏠 Dashboard</Link>', content)
    content = re.sub(r'(<Link to="/planner".*?>).*? Planner</Link>', r'\g<1>📅 Planner</Link>', content)
    content = re.sub(r'(<Link to="/pomodoro".*?>).*? Pomodoro</Link>', r'\g<1>⏱️ Pomodoro</Link>', content)
    content = re.sub(r'(<Link to="/notes".*?>).*? Notes</Link>', r'\g<1>📝 Notes</Link>', content)
    content = re.sub(r'(<Link to="/ai".*?>).*? AI Assistant</Link>', r'\g<1>🤖 AI Assistant</Link>', content)
    content = re.sub(r'(<Link to="/analytics".*?>).*? Analytics</Link>', r'\g<1>📊 Analytics</Link>', content)
    content = re.sub(r'(<Link to="/leaderboard".*?>).*? Leaderboard</Link>', r'\g<1>🏆 Leaderboard</Link>', content)
    content = re.sub(r'(<Link to="/settings".*?>).*? Settings</Link>', r'\g<1>⚙️ Settings</Link>', content)
    content = re.sub(r'<button className="logout-btn".*?>.*? Logout</button>', r'<button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>', content)
    
    content = re.sub(r'<h1>.*? Settings</h1>', '<h1>⚙️ Settings</h1>', content)
    
    if file == 'Leaderboard.js':
        content = re.sub(r'<h1>.*? Global Leaderboard</h1>', '<h1>🏆 Global Leaderboard</h1>', content)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed {file}')
