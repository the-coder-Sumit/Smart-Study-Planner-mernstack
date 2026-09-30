import os

users_path = 'server/routes/users.js'
with open(users_path, 'r', encoding='utf-8') as f:
    content = f.read()

if '/profile-picture' not in content:
    new_route = """
// Update Profile Picture
router.put('/profile-picture', auth, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.profilePicture = profilePicture;
    await user.save();
    
    res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture', error });
  }
});

module.exports = router;
"""
    content = content.replace('module.exports = router;', new_route)
    with open(users_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Updated users.js")
