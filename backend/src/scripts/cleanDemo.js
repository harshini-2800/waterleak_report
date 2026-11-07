require('dotenv').config();
const { connectDB, isMongoose, embeddedDB } = require('../config/db');
const Report = require('../models/Report');

const runClean = async () => {
  await connectDB();
  console.log('[Clean] Removing demo reports (isDemo: true)...');

  let deleted = 0;
  if (isMongoose()) {
    const res = await Report.deleteMany({ isDemo: true });
    deleted = res.deletedCount;
  } else {
    deleted = await embeddedDB.reports.remove({ isDemo: true }, { multi: true });
  }

  console.log(`[Clean] Deleted ${deleted} demo reports. Genuine reports are intact.`);
  process.exit(0);
};

runClean().catch(err => {
  console.error('[Clean Error]:', err);
  process.exit(1);
});

