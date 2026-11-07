require('dotenv').config();
const { connectDB, isMongoose, embeddedDB } = require('../config/db');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const sampleReports = require('./sampleReports');

const runSeed = async () => {
  await connectDB();
  console.log('[Seed] Seeding sample demo reports...');

  let count = 0;
  for (const rep of sampleReports) {
    if (isMongoose()) {
      const exists = await Report.findOne({ reportId: rep.reportId });
      if (!exists) {
        await Report.create(rep);
        count++;
      }
    } else {
      const exists = await embeddedDB.reports.findOne({ reportId: rep.reportId });
      if (!exists) {
        await embeddedDB.reports.insert(rep);
        count++;
      }
    }
  }

  // Create welcome notification
  const notif = {
    title: 'Demo Dataset Initialized',
    message: `${count} demo reports seeded with full historical logs and resolution times.`,
    reportId: 'SYSTEM',
    type: 'system',
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (isMongoose()) {
    await Notification.create(notif);
  } else {
    await embeddedDB.notifications.insert(notif);
  }

  console.log(`[Seed] Seeded ${count} new demo reports successfully!`);
  process.exit(0);
};

runSeed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});

