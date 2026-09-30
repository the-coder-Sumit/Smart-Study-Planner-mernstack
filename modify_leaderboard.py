import os

leaderboard_path = 'client/src/pages/Leaderboard.js'
with open(leaderboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_row = """
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="PFP" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#4a3f75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user.name}
                  </div>
"""

content = content.replace('<td>{user.name}</td>', f'<td>{new_row}</td>')

with open(leaderboard_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Leaderboard updated")
