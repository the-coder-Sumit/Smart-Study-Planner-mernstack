import os
import re

files = ['Dashboard.js', 'Planner.js', 'Pomodoro.js', 'Notes.js', 'AIAssistant.js', 'Analytics.js', 'Settings.js']

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace('?? Study Planner', '📚 Study Planner')
        
        content = re.sub(r'(<Link to="/dashboard".*?>)\?\? Dashboard</Link>', r'\g<1>🏠 Dashboard</Link>', content)
        content = re.sub(r'(<Link to="/planner".*?>)\?\? Planner</Link>', r'\g<1>📅 Planner</Link>', content)
        content = re.sub(r'(<Link to="/pomodoro".*?>)\?\? Pomodoro</Link>', r'\g<1>⏱️ Pomodoro</Link>', content)
        content = re.sub(r'(<Link to="/notes".*?>)\?\? Notes</Link>', r'\g<1>📝 Notes</Link>', content)
        content = re.sub(r'(<Link to="/ai".*?>)\?\? AI Assistant</Link>', r'\g<1>🤖 AI Assistant</Link>', content)
        content = re.sub(r'(<Link to="/analytics".*?>)\?\? Analytics</Link>', r'\g<1>📊 Analytics</Link>', content)
        content = re.sub(r'(<Link to="/leaderboard".*?>)\?\? Leaderboard</Link>', r'\g<1>🏆 Leaderboard</Link>', content)
        content = re.sub(r'(<Link to="/settings".*?>)\?\? Settings</Link>', r'\g<1>⚙️ Settings</Link>', content)
        
        content = content.replace('?? Logout', '🚪 Logout')
        content = content.replace('?? Settings', '⚙️ Settings')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {file}')
    except Exception as e:
        print(f'Error: {e}')
