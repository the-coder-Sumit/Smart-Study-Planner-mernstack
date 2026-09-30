import os
import re

# 1. Update User.js
user_model_path = 'server/models/User.js'
with open(user_model_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'profilePicture' not in content:
    content = content.replace('totalStudyMinutes: {\n    type: Number,\n    default: 0\n  }', 
                              'totalStudyMinutes: {\n    type: Number,\n    default: 0\n  },\n  profilePicture: {\n    type: String,\n    default: ""\n  }')
    with open(user_model_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Update auth.js (Google Login)
auth_path = 'server/routes/auth.js'
with open(auth_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

if 'picture' not in auth_content:
    auth_content = auth_content.replace('const { name, email } = payload;', 'const { name, email, picture } = payload;')
    auth_content = auth_content.replace('const userObj = new User({\n          name,\n          email,\n          password: hashedPassword\n        });',
                                        'const userObj = new User({\n          name,\n          email,\n          password: hashedPassword,\n          profilePicture: picture || ""\n        });')
    
    auth_content = auth_content.replace('user: { id: user._id, name: user.name, email: user.email }',
                                        'user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture }')
    
    with open(auth_path, 'w', encoding='utf-8') as f:
        f.write(auth_content)
        
    print("Updated auth.js")

# 3. Update auth.js login/register to include profilePicture in payload
with open(auth_path, 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_content = re.sub(r'user: \{\s*id: user\._id,\s*name: user\.name,\s*email: user\.email\s*\}', 
                      r'user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture }', 
                      auth_content)

with open(auth_path, 'w', encoding='utf-8') as f:
    f.write(auth_content)


# 4. Update index.js for JSON limit
index_path = 'server/index.js'
with open(index_path, 'r', encoding='utf-8') as f:
    index_content = f.read()

if '5mb' not in index_content:
    index_content = index_content.replace('app.use(express.json());', 'app.use(express.json({ limit: "5mb" }));\napp.use(express.urlencoded({ limit: "5mb", extended: true }));')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)

print("Backend configured for Profile Pictures")
