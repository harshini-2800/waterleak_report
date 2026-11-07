const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getDBStatus } = require('../config/db');

// System status
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    appName: 'WaterLeak Watch API',
    version: '1.0.0',
    database: getDBStatus()
  });
});

// Admin Auth
router.post('/auth/login', reportController.adminLogin);

// Public Report Routes
router.post('/reports', upload.single('image'), reportController.createReport);
router.get('/reports', reportController.getPublicReports);
router.get('/reports/track/:reportId', reportController.trackReport);

// Protected Admin Routes
router.get('/admin/reports', authMiddleware, reportController.getAllAdminReports);
router.patch('/admin/reports/:reportId/status', authMiddleware, reportController.updateReportStatus);
router.delete('/admin/reports/:reportId', authMiddleware, reportController.deleteReport);
router.get('/admin/analytics', authMiddleware, reportController.getAnalytics);
router.get('/admin/notifications', authMiddleware, reportController.getNotifications);
router.patch('/admin/notifications/:id/read', authMiddleware, reportController.markNotificationRead);
router.patch('/admin/notifications/read-all', authMiddleware, reportController.markAllNotificationsRead);

// Demo Data Management Routes
router.post('/admin/demo/seed', authMiddleware, reportController.loadDemoData);
router.post('/admin/demo/clean', authMiddleware, reportController.removeDemoData);

module.exports = router;

