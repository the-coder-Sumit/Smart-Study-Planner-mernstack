import os

# 1. Update Dashboard.js
dash_path = 'client/src/pages/Dashboard.js'
with open(dash_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace header in Dashboard
new_header = """<div className="header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#4a3f75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Let's make today productive!</p>
          </div>
        </div>"""
content = content.replace('<div className="header">\n          <h1>Welcome back, {user?.name}! 👋</h1>\n          <p>Let\'s make today productive!</p>\n        </div>', new_header)
with open(dash_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update Settings.js to add Profile Picture upload
settings_path = 'client/src/pages/Settings.js'
with open(settings_path, 'r', encoding='utf-8') as f:
    s_content = f.read()

if 'profilePicture' not in s_content:
    s_content = s_content.replace('const [error, setError] = useState("");', 'const [error, setError] = useState("");\n  const [uploading, setUploading] = useState(false);')
    
    upload_logic = """
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        setUploading(true);
        const res = await axios.put(`${API_URL}/api/users/profile-picture`, 
          { profilePicture: reader.result }, 
          { headers }
        );
        let currentUser = JSON.parse(sessionStorage.getItem('user'));
        currentUser.profilePicture = res.data.profilePicture;
        sessionStorage.setItem('user', JSON.stringify(currentUser));
        alert("Profile picture updated successfully!");
        window.location.reload();
      } catch (err) {
        alert("Failed to update profile picture.");
      } finally {
        setUploading(false);
      }
    };
  };
"""
    s_content = s_content.replace('const handleSave = async (e) => {', upload_logic + '\n  const handleSave = async (e) => {')
    
    upload_ui = """
          <div className="form-group">
            <label>Profile Picture</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {JSON.parse(sessionStorage.getItem('user'))?.profilePicture ? (
                <img src={JSON.parse(sessionStorage.getItem('user')).profilePicture} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#4a3f75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold' }}>
                  {JSON.parse(sessionStorage.getItem('user'))?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleProfilePicUpload} disabled={uploading} style={{ padding: '10px' }} />
              {uploading && <span>Uploading...</span>}
            </div>
          </div>
"""
    s_content = s_content.replace('<form onSubmit={handleSave}>', '<form onSubmit={handleSave}>\n' + upload_ui)
    
    with open(settings_path, 'w', encoding='utf-8') as f:
        f.write(s_content)

print("Frontend updated")
