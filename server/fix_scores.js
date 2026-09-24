const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const PomodoroSession = require('./models/PomodoroSession');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const users = await User.find({});
    for (let user of users) {
      const sessions = await PomodoroSession.find({ userId: user._id });
      let totalMins = 0;
      let score = 0;
      for (let s of sessions) {
        if (s.type === 'work' || !s.type) {
          totalMins += (s.durationMinutes || 25);
          score += (s.durationMinutes || 25);
        }
      }
      user.totalStudyMinutes = totalMins;
      user.score = score;
      await user.save();
      console.log(`Updated user ${user.name} with score ${score} and mins ${totalMins}`);
    }
    console.log('Done recalculating!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
