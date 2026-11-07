const { isMongoose, embeddedDB } = require('../config/db');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Utility to generate unique human-readable Report ID (e.g., WL-9842)
const generateReportId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `WL-${num}`;
};

// String normalizer for duplicate detection
const normalizeText = (txt) => {
  if (!txt) return '';
  return txt.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

// DUPLICATE LEAK DETECTION HELPER
const findSimilarReportsCount = async (area, street, category, excludeId = null) => {
  const normArea = normalizeText(area);
  const normStreet = normalizeText(street);

  if (isMongoose()) {
    const all = await Report.find(excludeId ? { reportId: { $ne: excludeId } } : {});
    return all.filter(r => {
      const a = normalizeText(r.area);
      const s = normalizeText(r.street);
      return (a && a === normArea) || (s && s === normStreet) || (r.category === category && a === normArea);
    }).length;
  } else {
    const all = await embeddedDB.reports.find(excludeId ? { reportId: { $ne: excludeId } } : {});
    return all.filter(r => {
      const a = normalizeText(r.area);
      const s = normalizeText(r.street);
      return (a && a === normArea) || (s && s === normStreet) || (r.category === category && a === normArea);
    }).length;
  }
};

// Create in-app notification
const createNotification = async (title, message, reportId, type = 'new_report') => {
  try {
    const doc = {
      title,
      message,
      reportId,
      type,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (isMongoose()) {
      await Notification.create(doc);
    } else {
      await embeddedDB.notifications.insert(doc);
    }
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// --- CONTROLLER METHODS ---

// 1. Submit a Leak Report (Public)
exports.createReport = async (req, res) => {
  try {
    const {
      reporterName,
      reporterEmail,
      title,
      description,
      area,
      street,
      landmark,
      category,
      severity
    } = req.body;

    if (!title || !description || !area || !street) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory fields (Title, Description, Area, Street).' });
    }

    const reportId = generateReportId();
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Duplicate detection count
    const similarCount = await findSimilarReportsCount(area, street, category || 'Burst Pipe');

    const reportData = {
      reportId,
      reporterName: reporterName || 'Anonymous Citizen',
      reporterEmail: reporterEmail || 'citizen@community.org',
      title,
      description,
      area,
      street,
      landmark: landmark || '',
      category: category || 'Burst Pipe',
      severity: severity || 'Medium',
      image: imagePath,
      status: 'Pending',
      isDemo: false,
      statusHistory: [
        {
          status: 'Pending',
          note: 'Report submitted by citizen',
          changedAt: new Date(),
          changedBy: reporterName || 'Citizen'
        }
      ],
      similarReportsCount: similarCount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let savedReport;
    if (isMongoose()) {
      savedReport = await Report.create(reportData);
    } else {
      savedReport = await embeddedDB.reports.insert(reportData);
    }

    // Trigger Notification
    const notifMsg = `New ${reportData.severity} leak reported at ${area}, ${street}. (ID: ${reportId})`;
    await createNotification(`New Leak Reported: ${title}`, notifMsg, reportId, 'new_report');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully!',
      report: savedReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating report' });
  }
};

// 2. Get Public Reports (with search, filters, pagination)
exports.getPublicReports = async (req, res) => {
  try {
    const { search, area, severity, status, limit = 50 } = req.query;

    let reports = [];
    if (isMongoose()) {
      let query = {};
      if (area && area !== 'All') query.area = new RegExp(area, 'i');
      if (severity && severity !== 'All') query.severity = severity;
      if (status && status !== 'All') query.status = status;
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { reportId: new RegExp(search, 'i') },
          { area: new RegExp(search, 'i') },
          { street: new RegExp(search, 'i') },
        ];
      }
      reports = await Report.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));
    } else {
      const all = await embeddedDB.reports.find({});
      reports = all.filter(r => {
        let match = true;
        if (area && area !== 'All' && !r.area.toLowerCase().includes(area.toLowerCase())) match = false;
        if (severity && severity !== 'All' && r.severity !== severity) match = false;
        if (status && status !== 'All' && r.status !== status) match = false;
        if (search) {
          const s = search.toLowerCase();
          const inTitle = (r.title || '').toLowerCase().includes(s);
          const inDesc = (r.description || '').toLowerCase().includes(s);
          const inId = (r.reportId || '').toLowerCase().includes(s);
          const inArea = (r.area || '').toLowerCase().includes(s);
          const inStreet = (r.street || '').toLowerCase().includes(s);
          if (!inTitle && !inDesc && !inId && !inArea && !inStreet) match = false;
        }
        return match;
      });
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      reports = reports.slice(0, parseInt(limit));
    }

    // Mask sensitive reporter emails for privacy
    const sanitized = reports.map(r => ({
      reportId: r.reportId,
      title: r.title,
      description: r.description,
      area: r.area,
      street: r.street,
      landmark: r.landmark,
      category: r.category,
      severity: r.severity,
      image: r.image,
      status: r.status,
      isDemo: r.isDemo,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      resolvedAt: r.resolvedAt,
      similarReportsCount: r.similarReportsCount || 0,
    }));

    res.json({ success: true, count: sanitized.length, reports: sanitized });
  } catch (error) {
    console.error('Error fetching public reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// 3. Track a Report by ID (Public)
exports.trackReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!reportId) return res.status(400).json({ success: false, message: 'Report ID required' });

    const cleanId = reportId.trim().toUpperCase();

    let report;
    if (isMongoose()) {
      report = await Report.findOne({ reportId: cleanId });
    } else {
      report = await embeddedDB.reports.findOne({ reportId: cleanId });
    }

    if (!report) {
      return res.status(404).json({ success: false, message: `No report found with ID ${cleanId}. Please verify your tracking ID.` });
    }

    // Return detailed tracking information with status timeline
    res.json({
      success: true,
      report: {
        reportId: report.reportId,
        title: report.title,
        description: report.description,
        area: report.area,
        street: report.street,
        landmark: report.landmark,
        category: report.category,
        severity: report.severity,
        image: report.image,
        status: report.status,
        isDemo: report.isDemo,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        resolvedAt: report.resolvedAt,
        resolutionDurationHours: report.resolutionDurationHours,
        statusHistory: report.statusHistory || [],
        similarReportsCount: report.similarReportsCount || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin - Get All Reports
exports.getAllAdminReports = async (req, res) => {
  try {
    let reports;
    if (isMongoose()) {
      reports = await Report.find({}).sort({ createdAt: -1 });
    } else {
      reports = await embeddedDB.reports.find({});
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Admin - Update Report Status
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, note } = req.body;

    const allowed = ['Pending', 'Under Review', 'In Progress', 'Resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    let report;
    if (isMongoose()) {
      report = await Report.findOne({ reportId });
    } else {
      report = await embeddedDB.reports.findOne({ reportId });
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const previousStatus = report.status;
    report.status = status;
    report.updatedAt = new Date();

    const historyItem = {
      status,
      note: note || `Status updated from ${previousStatus} to ${status}`,
      changedAt: new Date(),
      changedBy: req.user?.email || 'Admin'
    };

    if (!report.statusHistory) report.statusHistory = [];
    report.statusHistory.push(historyItem);

    if (status === 'Resolved') {
      report.resolvedAt = new Date();
      const start = new Date(report.createdAt).getTime();
      const end = new Date(report.resolvedAt).getTime();
      const diffHours = Math.max(0.1, Number(((end - start) / (1000 * 60 * 60)).toFixed(1)));
      report.resolutionDurationHours = diffHours;
    } else {
      // If reopened or moved back, keep history but clear active resolvedAt
      if (previousStatus === 'Resolved') {
        report.resolvedAt = null;
        report.resolutionDurationHours = null;
      }
    }

    if (isMongoose()) {
      await report.save();
    } else {
      await embeddedDB.reports.update({ reportId }, { $set: report });
    }

    // Create Notification
    await createNotification(
      `Status Update: ${report.title}`,
      `Report ${reportId} changed to "${status}"`,
      reportId,
      'status_update'
    );

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Admin - Delete Report
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    let report;

    if (isMongoose()) {
      report = await Report.findOne({ reportId });
      if (report) await Report.deleteOne({ reportId });
    } else {
      report = await embeddedDB.reports.findOne({ reportId });
      if (report) await embeddedDB.reports.remove({ reportId });
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Clean up uploaded image file if present and local
    if (report.image && report.image.startsWith('/uploads/')) {
      const filename = path.basename(report.image);
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch(e) {}
      }
    }

    res.json({ success: true, message: `Report ${reportId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Analytics & Time-to-Resolution Metrics
exports.getAnalytics = async (req, res) => {
  try {
    let reports = [];
    if (isMongoose()) {
      reports = await Report.find({});
    } else {
      reports = await embeddedDB.reports.find({});
    }

    const totalReports = reports.length;
    const demoReports = reports.filter(r => r.isDemo).length;
    const genuineReports = totalReports - demoReports;

    const pending = reports.filter(r => r.status === 'Pending').length;
    const underReview = reports.filter(r => r.status === 'Under Review').length;
    const inProgress = reports.filter(r => r.status === 'In Progress').length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    const critical = reports.filter(r => r.severity === 'Critical').length;

    // Severity distribution
    const severityMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    reports.forEach(r => {
      if (severityMap[r.severity] !== undefined) {
        severityMap[r.severity]++;
      }
    });

    // Area distribution / hotspots
    const areaMap = {};
    reports.forEach(r => {
      const a = (r.area || 'Unknown').trim();
      areaMap[a] = (areaMap[a] || 0) + 1;
    });
    const topAreas = Object.keys(areaMap)
      .map(area => ({ area, count: areaMap[area] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Resolution Time Analytics
    const resolvedItems = reports.filter(r => r.status === 'Resolved' && r.resolutionDurationHours);
    let avgResolutionHours = 0;
    let fastestResolvedHours = null;
    let longestResolutionHours = null;

    if (resolvedItems.length > 0) {
      const sum = resolvedItems.reduce((acc, curr) => acc + (curr.resolutionDurationHours || 0), 0);
      avgResolutionHours = Number((sum / resolvedItems.length).toFixed(1));
      
      const durations = resolvedItems.map(r => r.resolutionDurationHours).sort((a, b) => a - b);
      fastestResolvedHours = durations[0];
      longestResolutionHours = durations[durations.length - 1];
    }

    // Longest unresolved report
    const unresolvedItems = reports.filter(r => r.status !== 'Resolved');
    let longestUnresolvedDays = 0;
    let oldestUnresolvedReport = null;

    if (unresolvedItems.length > 0) {
      const sortedByAge = [...unresolvedItems].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      oldestUnresolvedReport = sortedByAge[0];
      const diffMs = Date.now() - new Date(oldestUnresolvedReport.createdAt).getTime();
      longestUnresolvedDays = Number((diffMs / (1000 * 60 * 60 * 24)).toFixed(1));
    }

    // Category distribution
    const categoryMap = {};
    reports.forEach(r => {
      const cat = r.category || 'Burst Pipe';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalReports,
          genuineReports,
          demoReports,
          pending,
          underReview,
          inProgress,
          resolved,
          critical,
          avgResolutionHours,
          fastestResolvedHours: fastestResolvedHours || 0,
          longestResolutionHours: longestResolutionHours || 0,
          longestUnresolvedDays,
        },
        severityDistribution: [
          { name: 'Low', count: severityMap.Low, color: '#16A77A' },
          { name: 'Medium', count: severityMap.Medium, color: '#19B5C5' },
          { name: 'High', count: severityMap.High, color: '#F59E0B' },
          { name: 'Critical', count: severityMap.Critical, color: '#EF4444' },
        ],
        statusDistribution: [
          { name: 'Pending', count: pending, color: '#94A3B8' },
          { name: 'Under Review', count: underReview, color: '#38BDF8' },
          { name: 'In Progress', count: inProgress, color: '#F59E0B' },
          { name: 'Resolved', count: resolved, color: '#10B981' },
        ],
        topAreas,
        categories: Object.keys(categoryMap).map(k => ({ category: k, count: categoryMap[k] })),
        recentReports: reports.slice(0, 6)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Notifications
exports.getNotifications = async (req, res) => {
  try {
    let notifs;
    if (isMongoose()) {
      notifs = await Notification.find({}).sort({ createdAt: -1 }).limit(30);
    } else {
      notifs = await embeddedDB.notifications.find({});
      notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      notifs = notifs.slice(0, 30);
    }
    res.json({ success: true, notifications: notifs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoose()) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } else {
      await embeddedDB.notifications.update({ _id: id }, { $set: { isRead: true } });
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    if (isMongoose()) {
      await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
    } else {
      await embeddedDB.notifications.update({ isRead: false }, { $set: { isRead: true } }, { multi: true });
    }
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Demo Data Management: Load Demo Data
exports.loadDemoData = async (req, res) => {
  try {
    const seedReports = require('../scripts/sampleReports');

    let inserted = 0;
    for (const report of seedReports) {
      const exists = isMongoose() 
        ? await Report.findOne({ reportId: report.reportId })
        : await embeddedDB.reports.findOne({ reportId: report.reportId });

      if (!exists) {
        if (isMongoose()) {
          await Report.create(report);
        } else {
          await embeddedDB.reports.insert(report);
        }
        inserted++;
      }
    }

    await createNotification(
      'Demo Dataset Loaded',
      `Loaded ${inserted} sample reports for platform demonstration.`,
      'SYSTEM',
      'system'
    );

    res.json({
      success: true,
      message: `Successfully loaded ${inserted} demo reports!`,
      insertedCount: inserted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Demo Data Management: Remove Demo Data
exports.removeDemoData = async (req, res) => {
  try {
    let deletedCount = 0;
    if (isMongoose()) {
      const result = await Report.deleteMany({ isDemo: true });
      deletedCount = result.deletedCount;
    } else {
      deletedCount = await embeddedDB.reports.remove({ isDemo: true }, { multi: true });
    }

    await createNotification(
      'Demo Data Cleared',
      `Removed ${deletedCount} demo records. Genuine reports preserved.`,
      'SYSTEM',
      'system'
    );

    res.json({
      success: true,
      message: `Deleted ${deletedCount} demo reports. All genuine reports were preserved!`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Admin Login & Authentication
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isDev = (process.env.NODE_ENV || 'development') === 'development';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // In local demo mode: accept any non-empty email/password
    if (isDev) {
      const token = jwt.sign(
        { email, role: 'admin', isDemo: true },
        process.env.JWT_SECRET || 'waterleak_watch_super_secret_jwt_key_2026_luxury',
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully (Demo Mode Active)',
        token,
        admin: {
          email,
          name: email.split('@')[0].toUpperCase() || 'Administrator',
          role: 'admin',
          isDemoMode: true
        }
      });
    }

    // Production mode check
    let admin = isMongoose() 
      ? await Admin.findOne({ email: email.toLowerCase() })
      : await embeddedDB.admins.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'waterleak_watch_super_secret_jwt_key_2026_luxury',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isDemoMode: false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

